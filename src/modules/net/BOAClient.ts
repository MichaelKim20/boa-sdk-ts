/*******************************************************************************

    Contains definition for the BOA Client of TypeScript.
    It is responsible for requesting and receiving responses from
    the BOA API server(Stoa).
    It also provides other functions.(Verification of signature and pre-image)

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hash, hashFull } from '../data/Hash';
import { Request } from './Request';
import { Validator } from '../data/Validator';
import { Seed, Transaction, TxInput, TxOutput } from "../..";

import { AxiosResponse, AxiosError } from 'axios';
import uri from 'urijs';

/**
 * Define the BOA Client of TypeScript.
 * It is responsible for requesting and receiving responses from
 * the BOA API server(Stoa).
 * It also provides other functions. (Verification of signature and pre-image)
 */
export class BOAClient
{
    /**
     * The Stoa server URL
     */
    public readonly server_url: uri;

    /**
     * The Agora URL
     */
    public readonly agora_url: uri;


    /**
     * Constructor
     * @param server_url {string} The Stoa server URL
     * @param agora_url {string} The Agora server URL
     */
    constructor (server_url: string, agora_url: string)
    {
        this.server_url = uri(server_url);
        this.agora_url = uri(agora_url);
    }

    /**
     * Request all valid validator at the block height.
     * If block height is not specified, it is the current height.
     * @param height {number | undefined} The block height
     * @returns {Promise<Array<Validator>>} Promise that resolves or
     * rejects with response from the Stoa
     */
    public getAllValidators
        (height?: number): Promise<Array<Validator>>
    {
        return new Promise<Array<Validator>>((resolve, reject) =>
        {
            let url = uri(this.server_url)
                .directory("validators");

            if (height != undefined)
                url.addSearch("height", height);

            Request.get(url.toString())
            .then((response: AxiosResponse) =>
            {
                let validators: Array<Validator> = new Array<Validator>();
                if (response.status == 200)
                {
                    response.data.forEach((elem: any) =>
                    {
                        let validator = new Validator();
                        validator.fromJSON(elem);
                        validators.push(validator);
                    });
                    resolve(validators);
                }
                else if (response.status == 204)
                {
                    resolve(validators);
                }
                else
                {
                    // It is not yet defined in Stoa.
                    reject(new Error(response.statusText));
                }
            })
            .catch((reason: any) =>
            {
                reject(handleNetworkError(reason));
            });
        });
    }

    /**
     * Requests a valid validator for the address at the block height.
     * If block height is not specified, it is the current height.
     * @param address {string} The public key
     * @param height {number | undefined} The block height
     * @returns {Promise<Array<Validator>>} Promise that resolves or
     * rejects with response from the Stoa
     */
    public getValidator
        (address: string, height?: number): Promise<Array<Validator>>
    {
        return new Promise<Array<Validator>>((resolve, reject) =>
        {
            let url = uri(this.server_url)
                .directory("validator")
                .filename(address);

            if (height != undefined)
                url.addSearch("height", height);

            Request.get(url.toString())
            .then((response: AxiosResponse) =>
            {
               let validators: Array<Validator> = new Array<Validator>();
               if (response.status == 200)
               {
                    response.data.forEach((elem: any) =>
                    {
                        let validator = new Validator();
                        validator.fromJSON(elem);
                        validators.push(validator);
                    });
                    resolve(validators);
                }
                else if (response.status == 204)
                {
                    resolve(validators);
                }
                else
                {
                    // It is not yet defined in Stoa.
                    reject(new Error(response.statusText));
                }
            })
            .catch((reason: any) =>
            {
                reject(handleNetworkError(reason));
            });
        });
    }

    /**
     * Check the validity of a new pre-image
     * @param original_image {Hash} The original pre-image hash
     * @param original_image_height {number} The original pre-image height
     * @param new_image {Hash} The new pre-image hash to check
     * @param new_image_height {number} The new pre-image height
     * @returns {IsValidPreimageResponse}
     * {result: true, message: "The pre-image is valid."} if the pre-image is valid,
     * otherwise the result is false and the message is the reason for invalid
     * See_Also: https://github.com/bpfkorea/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/validation/PreImage.d#L50-L69
     */
    public isValidPreimage (
        original_image: Hash, original_image_height: number,
        new_image: Hash, new_image_height: number): IsValidPreimageResponse
    {
        if (!Number.isInteger(original_image_height) || (original_image_height < 0))
            return {
                result: false,
                message: "The original pre-image height is not valid."
            };

        if (!Number.isInteger(new_image_height) || (new_image_height < 0))
            return {
                result: false,
                message: "The new pre-image height is not valid."
            };

        if (new_image_height < original_image_height)
            return {
                result: false,
                message: "The height of new pre-image is smaller than that of original one."
            };

        let temp_hash = new Hash(new_image.data);
        for (let idx = original_image_height; idx < new_image_height; idx++)
            temp_hash = hash(temp_hash.data)

        if (!original_image.data.equals(temp_hash.data))
            return {
                result: false,
                message: "The pre-image has a invalid hash value."
            };

        return {
            result: true,
            message: "The pre-image is valid."
        };
    }

    /**
     * TODO As this might get influenced by future changes
     * Shell function to convert from time to height
     * @param when {Date} Unix epoch time
     * @returns height {number} (or expected height) of the designated time
     */
    public getHeightAt(when: Date): Promise<number>
    {
        return new Promise<number>((resolve, reject) =>
        {
            const baseDate: Date = new Date(Date.UTC(2020, 0, 1, 0, 0, 0));
            if (when.getTime() < baseDate.getTime())
            {
                reject(new Error("Dates prior to the chain Genesis date (January 1, 2020) are not valid"));
                return;
            }
            const milliseconds_per_block = 600000;
            let height = Math.floor((when.getTime() - baseDate.getTime()) / milliseconds_per_block);
            resolve(height);
        });
    }

    /**
     * Saves the data to the blockchain
     * @param inputs An array of 1 or more UTXOs to be spent
     * @param outputs An array of 1 or more output
     * @param keys An array of length matching `inputs` which are the keys controlling the UTXOs
     * @param data The data to store
     * @returns Returns true if success, otherwise returns false
     */
    public saveData (inputs: Array<TxInput>, outputs: Array<TxOutput>, keys: Array<Seed>, data: Buffer): Promise<boolean>
    {
        return new Promise<boolean>((resolve, reject) =>
        {
            try
            {
                let tx = Transaction.create(inputs, outputs, keys, data);

                // TODO: Send a transaction to Agora
                // ex)
                /*
                let url = uri(this.agora_url)
                    .directory("put_transaction");

                Request.put(url.toString(), tx.toObject())
                    .then((response: AxiosResponse) =>
                    {
                        if (response.status == 200)
                        {
                            resolve(true);
                        }
                        else
                        {
                            // It is not yet defined in Stoa.
                            reject(new Error(response.statusText));
                        }
                    })
                    .catch((reason: any) =>
                    {
                        reject(handleNetworkError(reason));
                    });
                */

                resolve(true);
            } catch (err)
            {
                reject(err);
            }
        });
    }
}

export interface IsValidPreimageResponse
{
    result: boolean;
    message: string;
}

/**
 * Check if parameter `reason` is type `AxiosError`.
 * @param reason{any} This is why the error occurred
 * @returns {boolean}
 */
function isAxiosError (reason: any): reason is AxiosError
{
    return ((reason as AxiosError).isAxiosError);
}

/**
 * Check if parameter `reason` is type `Error`.
 * @param reason{any} This is why the error occurred
 * @returns {boolean}
 */
function isError (reason: any): reason is Error
{
    return ((reason as Error).message != undefined);
}

/**
 * It is a common function that handles errors that occur
 * during network communication.
 * @param reason{any} This is why the error occurred
 * @returns {Error}
 */
function handleNetworkError (reason: any): Error
{
    if (isAxiosError(reason))
    {
        let e = reason as AxiosError;
        if (e.response != undefined)
        {
            let message = "";
            if (e.response.statusText != undefined) message = e.response.statusText + ", ";
            if (e.response.data != undefined) message += e.response.data;
            return new Error(message);
        }
    }

    if (isError(reason))
    {
        return new Error((reason as Error).message);
    }
    else
    {
        return new Error("An unknown error has occurred.");
    }
}
