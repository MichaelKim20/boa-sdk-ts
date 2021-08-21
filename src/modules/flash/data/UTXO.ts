/*******************************************************************************

    Defines the UTXO transaction set struct,
    contains the UTXOFinder delegate

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { hashPart } from "../../common/Hash";
import { TxOutput } from "../../data/TxOutput";
import { JSONValidator } from "../../utils/JSONValidator";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 * The class of spendable transaction output
 */
export class UTXO {
    /**
     * The height of the block to be unlock
     */
    public unlock_height: JSBI;

    /**
     * The unspent transaction output
     */
    public output: TxOutput;

    /**
     * Constructor
     * @param unlock_height The height of the block to be unlock
     * @param output        The unspent transaction output
     */
    constructor(unlock_height: JSBI, output: TxOutput) {
        this.unlock_height = unlock_height;
        this.output = output;
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        hashPart(this.unlock_height, buffer);
        hashPart(this.output, buffer);
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `UTXO` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("UTXO", value);

        return new UTXO(JSBI.BigInt(value.unlock_height), TxOutput.reviver("", value.output));
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            unlock_height: this.unlock_height.toString(),
            output: this.output.toJSON(),
        };
    }
}
