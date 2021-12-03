/*******************************************************************************

    Contains definition for the signature

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Endian, Utils } from "../utils/Utils";
import { Point, Scalar } from "./ECC";

import { SmartBuffer } from "smart-buffer";

/**
 * Define the signature
 */
export class Signature {
    /**
     * Buffer containing signature values
     */
    public readonly data: Buffer;

    /**
     * Commitment
     */
    public R: Point;

    /**
     * Proof
     */
    public s: Scalar;

    /**
     * The number of byte of the signature
     */
    public static Width: number = 64;

    /**
     * Construct a new instance of this class
     *
     * @param data   The string or binary representation of the Signature
     * @param endian The byte order
     * @throws Will throw an error if the data is not the same size as 64.
     */
    constructor(data: Buffer | string, endian: Endian = Endian.Big) {
        if (typeof data === "string") this.data = Utils.readFromString(data, Buffer.alloc(Signature.Width));
        else {
            this.data = Buffer.alloc(Signature.Width);
            this.fromBinary(data, endian);
        }
        if (this.data.length !== Signature.Width) throw new Error("The size of the data is abnormal.");
        this.R = new Point(this.data.slice(Scalar.Width));
        this.s = new Scalar(this.data.slice(0, Scalar.Width));
    }

    /**
     * Returns new instance of Signature from Scalar and Point
     * @param R The instance of Point
     * @param s The instance of Scalar
     */
    public static fromSchnorr(R: Point, s: Scalar): Signature {
        return new Signature(Buffer.concat([s.data, R.data]));
    }

    /**
     * Reads from the hex string
     * @param hex The hex string
     * @returns The instance of Signature
     */
    public fromString(hex: string): Signature {
        Utils.readFromString(hex, this.data);
        return this;
    }

    /**
     * Writes to the hex string
     * @returns The hex string
     */
    public toString(): string {
        return Utils.writeToString(this.data);
    }

    /**
     * Set binary data
     * @param bin    The binary data of the signature
     * @param endian The byte order
     * @returns The instance of Signature
     * @throws Will throw an error if the argument `bin` is not the same size as 64.
     */
    public fromBinary(bin: Buffer, endian: Endian = Endian.Big): Signature {
        if (bin.length !== Signature.Width) throw new Error("The size of the data is abnormal.");

        bin.copy(this.data);
        if (endian === Endian.Little) this.data.reverse();

        return this;
    }

    /**
     * Get binary data
     * @param endian The byte order
     * @returns The binary data of the signature
     */
    public toBinary(endian: Endian = Endian.Big): Buffer {
        if (endian === Endian.Little) return Buffer.from(this.data).reverse();
        else return this.data;
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.R.computeHash(buffer);
        this.s.computeHash(buffer);
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(): string {
        return this.toString();
    }

    /**
     * Serialize as binary data.
     * @param buffer The buffer where serialized data is stored
     */
    public serialize(buffer: SmartBuffer) {
        buffer.writeBuffer(this.R.data);
        buffer.writeBuffer(this.s.data);
    }

    /**
     * Deserialize as binary data.
     * @param buffer The buffer to be deserialized
     */
    public static deserialize(buffer: SmartBuffer): Signature {
        const R = new Point(Utils.readBuffer(buffer, Point.Width));
        const s = new Scalar(Utils.readBuffer(buffer, Scalar.Width));
        return Signature.fromSchnorr(R, s);
    }

    /**
     * Returns the data size.
     */
    public getNumberOfBytes(): number {
        return this.data.length;
    }
}
