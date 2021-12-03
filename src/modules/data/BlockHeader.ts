/*******************************************************************************

    The class that defines the header of a block.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hashPart } from "../common/Hash";
import { Height } from "../common/Height";
import { Signature } from "../common/Signature";
import { JSONValidator } from "../utils/JSONValidator";
import { iota } from "../utils/Utils";
import { VarInt } from "../utils/VarInt";
import { BitMask } from "./BitMask";
import { Enrollment } from "./Enrollment";

import { SmartBuffer } from "smart-buffer";

/**
 * The class that defines the header of a block.
 * Convert JSON object to TypeScript's instance.
 * An exception occurs if the required property is not present.
 */
export class BlockHeader {
    /**
     * The hash of the previous block in the chain of blocks
     */
    public prev_block: Hash;

    /**
     * The hash of the merkle root of the transactions
     */
    public merkle_root: Hash;

    /**
     * The Schnorr multisig of all validators which signed this block
     */
    public signature: Signature;

    /**
     * The bit-field containing the validators' key indices which signed the block
     */
    public validators: BitMask;

    /**
     * The block height (genesis is #0)
     */
    public height: Height;

    /**
     * The pre-images propagated in this block
     */
    public preimages: Hash[];

    /**
     * The enrolled validators
     */
    public enrollments: Enrollment[];

    /**
     * Block seconds offset from Genesis Timestamp in `ConsensusParams`
     */
    public time_offset: number = 0;

    /**
     * Constructor
     * @param prev_block  The Hash of the previous block in the chain of blocks
     * @param merkle_root The hash of the merkle root of the transactions
     * @param signature   The Schnorr multisig of all validators which signed this block
     * @param validators  The bit-field containing the validators' key indices which signed the block
     * @param height      The block height
     * @param preimages   The pre-images propagated in this block
     * @param enrollments The enrolled validators
     */
    constructor(
        prev_block: Hash,
        merkle_root: Hash,
        signature: Signature,
        validators: BitMask,
        height: Height,
        preimages: Hash[],
        enrollments: Enrollment[]
    ) {
        this.prev_block = prev_block;
        this.merkle_root = merkle_root;
        this.signature = signature;
        this.validators = validators;
        this.height = height;
        this.preimages = preimages;
        this.enrollments = enrollments;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `BlockHeader` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("BlockHeader", value);

        return new BlockHeader(
            new Hash(value.prev_block),
            new Hash(value.merkle_root),
            new Signature(value.signature),
            BitMask.fromString(value.validators),
            new Height(value.height),
            value.preimages.map((elem: string) => new Hash(elem)),
            value.enrollments.map((elem: any) => Enrollment.reviver("", elem))
        );
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(): any {
        return {
            prev_block: this.prev_block,
            merkle_root: this.merkle_root,
            signature: this.signature.toString(),
            validators: this.validators.toString(),
            height: this.height.toString(),
            preimages: this.preimages,
            enrollments: this.enrollments,
        };
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.prev_block.computeHash(buffer);
        this.merkle_root.computeHash(buffer);
        this.height.computeHash(buffer);
        for (const elem of this.preimages) hashPart(elem, buffer);
        for (const elem of this.enrollments) elem.computeHash(buffer);
    }

    /**
     * Serialize as binary data.
     * @param buffer - The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        this.prev_block.serialize(buffer);
        this.merkle_root.serialize(buffer);
        this.signature.serialize(buffer);
        this.validators.serialize(buffer);
        this.height.serialize(buffer);

        VarInt.fromNumber(this.preimages.length, buffer);
        for (const elem of this.preimages) elem.serialize(buffer);

        VarInt.fromNumber(this.enrollments.length, buffer);
        for (const elem of this.enrollments) elem.serialize(buffer);
    }

    /**
     * Deserialize as binary data.
     * @param buffer - The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): BlockHeader {
        const prev_block = Hash.deserialize(buffer);
        const merkle_root = Hash.deserialize(buffer);
        const signature = Signature.deserialize(buffer);
        const validators = BitMask.deserialize(buffer);
        const height = Height.deserialize(buffer);

        const preimages_length = VarInt.toNumber(buffer);
        const preimages = iota(preimages_length).map(() => Hash.deserialize(buffer));

        const enroll_length = VarInt.toNumber(buffer);
        const enrollments = iota(enroll_length).map(() => Enrollment.deserialize(buffer));

        return new BlockHeader(prev_block, merkle_root, signature, validators, height, preimages, enrollments);
    }

    /**
     * Returns the data size.
     */
    public getNumberOfBytes(): number {
        let num_bytes =
            this.prev_block.getNumberOfBytes() +
            this.merkle_root.getNumberOfBytes() +
            this.signature.getNumberOfBytes() +
            this.validators.getNumberOfBytes() +
            this.height.getNumberOfBytes();
        for (const elem of this.preimages) num_bytes += elem.getNumberOfBytes();
        for (const elem of this.enrollments) num_bytes += elem.getNumberOfBytes();
        return num_bytes;
    }
}
