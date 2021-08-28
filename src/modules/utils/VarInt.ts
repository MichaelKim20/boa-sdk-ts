/*******************************************************************************

    Includes a class that defines the ability to read and write a number
    when serializing and deserializing them in binary.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Utils } from "./Utils";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

const number_type: number[] = [0xfc, 0xfd, 0xfe, 0xff];

/**
 * A class that defines the ability to read and write a number
 * when serializing and deserializing them in binary.
 */
export class VarInt {
    /**
     * Serialize the number, Do not use compression if value is of enum type.
     * @param value The number to serialize
     * @param buffer The byte buffer
     * @param size The byte size of value when its data type is enum
     * It can have a value of 1, 2, or 4. Other values are not enum type
     */
    public static fromNumber(value: number, buffer: SmartBuffer, size: number = 0) {
        if (size === 1) {
            buffer.writeUInt8(value);
        } else if (size === 2) {
            buffer.writeUInt16BE(value);
        } else if (size === 4) {
            buffer.writeUInt32BE(value);
        } else {
            if (value <= number_type[0]) {
                buffer.writeUInt8(value);
            } else if (value <= 0xffff) {
                buffer.writeUInt8(number_type[1]);
                buffer.writeUInt16BE(value);
            } else if (value <= 0xffffffff) {
                buffer.writeUInt8(number_type[2]);
                buffer.writeUInt32BE(value);
            } else throw new Error("The number is too large to be processed.");
        }
    }

    /**
     * Serialize the JSBI, Do not use compression if value is of enum type.
     * @param value The JSBI instance to serialize
     * @param buffer The byte buffer
     * @param size The byte size of value when its data type is enum
     * It can have a value of 1, 2, or 4. Other values are not enum type
     */
    public static fromJSBI(value: JSBI, buffer: SmartBuffer, size: number = 0) {
        if (size === 1) {
            buffer.writeUInt8(JSBI.toNumber(value));
        } else if (size === 2) {
            buffer.writeUInt16BE(JSBI.toNumber(value));
        } else if (size === 4) {
            buffer.writeUInt32BE(JSBI.toNumber(value));
        } else {
            if (JSBI.lessThanOrEqual(value, JSBI.BigInt(number_type[0]))) {
                buffer.writeUInt8(JSBI.toNumber(value));
            } else if (JSBI.lessThanOrEqual(value, JSBI.BigInt(0xffff))) {
                buffer.writeUInt8(number_type[1]);
                buffer.writeUInt16BE(JSBI.toNumber(value));
            } else if (JSBI.lessThanOrEqual(value, JSBI.BigInt(0xffffffff))) {
                buffer.writeUInt8(number_type[2]);
                buffer.writeUInt32BE(JSBI.toNumber(value));
            } else {
                buffer.writeUInt8(number_type[3]);
                const buf = Buffer.allocUnsafe(8);
                Utils.writeJSBigIntBE(buf, value);
                buffer.writeBuffer(buf);
            }
        }
    }

    /**
     * Deserialize the number to Number, Do not use compression if value is of enum type.
     * @param buffer The byte buffer
     * @param size The byte size of value when its data type is enum
     * It can have a value of 1, 2, or 4. Other values are not enum type
     * @returns The deserialized number
     */
    public static toNumber(buffer: SmartBuffer, size: number = 0): number {
        let remaining = buffer.remaining();
        if (size === 1) {
            if (remaining < 1) throw new Error(`Requested 1 bytes but only ${remaining} bytes available`);
            return buffer.readUInt8();
        } else if (size === 2) {
            if (remaining < 2) throw new Error(`Requested 2 bytes but only ${remaining} bytes available`);
            return buffer.readUInt16BE();
        } else if (size === 4) {
            if (remaining < 4) throw new Error(`Requested 4 bytes but only ${remaining} bytes available`);
            return buffer.readUInt32BE();
        } else {
            remaining = buffer.remaining();
            if (remaining < 1) throw new Error(`Requested 1 bytes but only ${remaining} bytes available`);

            const value = buffer.readUInt8();

            if (value <= number_type[0]) {
                return value;
            } else if (value === number_type[1]) {
                remaining = buffer.remaining();
                if (remaining < 2) throw new Error(`Requested 2 bytes but only ${remaining} bytes available`);

                return buffer.readUInt16BE();
            } else if (value === number_type[2]) {
                remaining = buffer.remaining();
                if (remaining < 4) throw new Error(`Requested 4 bytes but only ${remaining} bytes available`);

                return buffer.readUInt32BE();
            } else throw new Error("The number is too large to be processed.");
        }
    }

    /**
     * Deserialize the number to JSBI, Do not use compression if value is of enum type.
     * @param buffer The byte buffer
     * @param size The byte size of value when its data type is enum
     * It can have a value of 1, 2, or 4. Other values are not enum type
     * @returns The deserialized JSBI instance
     */
    public static toJSBI(buffer: SmartBuffer, size: number = 0): JSBI {
        let remaining = buffer.remaining();
        if (size === 1) {
            if (remaining < 1) throw new Error(`Requested 1 bytes but only ${remaining} bytes available`);
            return JSBI.BigInt(buffer.readUInt8());
        } else if (size === 2) {
            if (remaining < 2) throw new Error(`Requested 2 bytes but only ${remaining} bytes available`);
            return JSBI.BigInt(buffer.readUInt16BE());
        } else if (size === 4) {
            if (remaining < 4) throw new Error(`Requested 4 bytes but only ${remaining} bytes available`);
            return JSBI.BigInt(buffer.readUInt32BE());
        } else {
            if (remaining < 1) throw new Error(`Requested 1 bytes but only ${remaining} bytes available`);

            const value = buffer.readUInt8();

            if (value <= number_type[0]) {
                return JSBI.BigInt(value);
            } else if (value === number_type[1]) {
                remaining = buffer.remaining();
                if (remaining < 2) throw new Error(`Requested 2 bytes but only ${remaining} bytes available`);

                return JSBI.BigInt(buffer.readUInt16BE());
            } else if (value === number_type[2]) {
                remaining = buffer.remaining();
                if (remaining < 4) throw new Error(`Requested 4 bytes but only ${remaining} bytes available`);

                return JSBI.BigInt(buffer.readUInt32BE());
            } else {
                remaining = buffer.remaining();
                if (remaining < 8) throw new Error(`Requested 8 bytes but only ${remaining} bytes available`);

                return Utils.readJSBigIntBE(buffer.readBuffer(8));
            }
        }
    }
}
