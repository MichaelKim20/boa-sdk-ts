/*******************************************************************************

    The wallet utility

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { Hash } from "../common/Hash";
import { PublicKey, SecretKey, VersionByte } from "../common/KeyPair";
import { validate } from "../utils/CRC16";
import { SodiumHelper } from "../utils/SodiumHelper";
import { Utils } from "../utils/Utils";
import { IWalletResult, WalletMessage, WalletResultCode } from "./Types";

import { base32Decode } from "@ctrl/ts-base32";
import { bech32m } from "bech32";
import JSBI from "jsbi";

/**
 * A class that converts an amount into a BOA unit string and a BOA unit string into an amount.
 */
export class AmountConverter {
    /**
     * Convert an amount into a BOA unit string
     * @param amount            The amount
     * @param commaOnThousand   Whether there is a comma for each thousand units.
     * @param numberOfDigit     Number of decimal places.
     */
    public static toString(amount: Amount, commaOnThousand: boolean = true, numberOfDigit: number = 7): string {
        const share = JSBI.divide(amount.value, Amount.UNIT_PER_COIN_JSBI);
        const remain = JSBI.remainder(amount.value, Amount.UNIT_PER_COIN_JSBI);
        const txShare = commaOnThousand
            ? JSBI.toNumber(share).toLocaleString("en-US", { maximumFractionDigits: numberOfDigit })
            : share.toString();

        let txRemain: string;
        if (numberOfDigit === 0) {
            if (JSBI.equal(remain, Amount.ZERO_JSBI)) return txShare;
            txRemain = remain.toString();
            if (txRemain.length < Amount.LENGTH_DECIMAL) txRemain = txRemain.padStart(Amount.LENGTH_DECIMAL, "0");
            txRemain = txRemain.replace(/0+$/g, "");
        } else if (numberOfDigit > Amount.LENGTH_DECIMAL) {
            const factor = Math.pow(10, numberOfDigit - Amount.LENGTH_DECIMAL);
            txRemain = Math.round(JSBI.toNumber(remain) * factor).toString();
            if (txRemain.length < numberOfDigit) txRemain = txRemain.padStart(numberOfDigit, "0");
        } else {
            if (numberOfDigit < 0) numberOfDigit = 0;
            const factor = Math.pow(10, Amount.LENGTH_DECIMAL - numberOfDigit);
            txRemain = Math.round(JSBI.toNumber(remain) / factor).toString();
            if (txRemain.length < numberOfDigit) txRemain = txRemain.padStart(numberOfDigit, "0");
        }
        return txShare + "." + txRemain;
    }

    /**
     * Convert a BOA unit string into an amount
     * @param amount    The amount
     */
    public static fromString(amount: string): IWalletResult<Amount> {
        try {
            if (!amount || amount === "")
                return {
                    code: WalletResultCode.Success,
                    message: WalletMessage.Success,
                    data: new Amount(JSBI.BigInt(0)),
                };

            const numbers = amount.replace(/,/gi, "").split(".");
            if (JSBI.lessThan(JSBI.BigInt(numbers[0]), JSBI.BigInt(0))) {
                return {
                    code: WalletResultCode.InvalidAmount,
                    message: WalletMessage.InvalidAmount,
                };
            }

            if (numbers.length === 1) {
                const value = new Amount(JSBI.multiply(JSBI.BigInt(numbers[0]), Amount.UNIT_PER_COIN_JSBI));
                return {
                    code: WalletResultCode.Success,
                    message: WalletMessage.Success,
                    data: value,
                };
            } else if (numbers.length === 2) {
                let txRemain = numbers[1];
                if (txRemain.length > Amount.LENGTH_DECIMAL) txRemain = txRemain.slice(0, Amount.LENGTH_DECIMAL);
                else if (txRemain.length < Amount.LENGTH_DECIMAL)
                    txRemain = txRemain.padEnd(Amount.LENGTH_DECIMAL, "0");
                const share = JSBI.multiply(JSBI.BigInt(numbers[0]), Amount.UNIT_PER_COIN_JSBI);
                const value = new Amount(JSBI.add(share, JSBI.BigInt(txRemain)));
                return {
                    code: WalletResultCode.Success,
                    message: WalletMessage.Success,
                    data: value,
                };
            } else {
                return {
                    code: WalletResultCode.InvalidAmount,
                    message: WalletMessage.InvalidAmount,
                };
            }
        } catch (e) {
            return {
                code: WalletResultCode.InvalidAmount,
                message: e.message,
            };
        }
    }
}

/**
 * This class contains a function that validates the string of the public key, secret key and hash.
 */
export class WalletValidator {
    /**
     * Validate the public key string.
     * @param publicKey The string of public key
     */
    public static isValidPublicKey(publicKey: string): IWalletResult<void> {
        const key = publicKey.trim();
        if (key.length !== 63) {
            return {
                code: WalletResultCode.InvalidPublicKeyLength,
                message: "Invalid public key length",
            };
        }

        if (key.length < PublicKey.HumanReadablePart.length || key.slice(0, 3) !== PublicKey.HumanReadablePart)
            return {
                code: WalletResultCode.InvalidPublicKeyFormat,
                message: "Invalid in the human-readable part",
            };

        let decoded;
        try {
            decoded = bech32m.decode(key);
        } catch (e) {
            return {
                code: WalletResultCode.InvalidPublicKey,
                message: e.message,
            };
        }

        if (decoded.prefix !== PublicKey.HumanReadablePart)
            return {
                code: WalletResultCode.InvalidPublicKeyFormat,
                message: "Differ in the human-readable part",
            };

        const dec_data: number[] = [];
        if (!Utils.convertBits(dec_data, decoded.words, 5, 8, false))
            return {
                code: WalletResultCode.InvalidPublicKeyFormat,
                message: "Bech32 conversion of base failed",
            };

        if (dec_data.length !== 1 + SodiumHelper.sodium.crypto_core_ed25519_BYTES)
            return {
                code: WalletResultCode.InvalidPublicKey,
                message: "Decoded data size is not normal",
            };

        if (dec_data[0] !== VersionByte.AccountID)
            return {
                code: WalletResultCode.InvalidPublicKey,
                message: "This is not a valid address type",
            };

        const key_data = Buffer.from(dec_data.slice(1));
        if (!SodiumHelper.sodium.crypto_core_ed25519_is_valid_point(key_data))
            return {
                code: WalletResultCode.InvalidPublicKey,
                message: "This is not a valid Point",
            };

        try {
            const pk = new PublicKey(key);
            return {
                code: WalletResultCode.Success,
                message: WalletMessage.Success,
            };
        } catch (e) {
            return {
                code: WalletResultCode.InvalidPublicKey,
                message: "This key is not valid",
            };
        }
    }

    /**
     * Validate the secret key string.
     * @param secretKey The string of secret key
     */
    public static isValidSecretKey(secretKey: string): IWalletResult<void> {
        const key = secretKey.trim();
        if (key.length !== 56) {
            return {
                code: WalletResultCode.InvalidSecretKeyLength,
                message: "Invalid secret key length",
            };
        }

        let decoded: Buffer;
        try {
            decoded = Buffer.from(base32Decode(key.trim()));
        } catch (err) {
            return {
                code: WalletResultCode.InvalidSecretKeyFormat,
                message: "This is not a valid secret key format",
            };
        }

        if (decoded.length !== 1 + SodiumHelper.sodium.crypto_core_ed25519_SCALARBYTES + 2)
            return {
                code: WalletResultCode.InvalidSecretKey,
                message: "Decoded data size is not normal",
            };

        if (decoded[0] !== VersionByte.Seed)
            return {
                code: WalletResultCode.InvalidSecretKey,
                message: "This is not a valid secret key type",
            };

        const body = decoded.slice(0, -2);
        const check_sum = decoded.slice(-2);
        if (!validate(body, check_sum))
            return {
                code: WalletResultCode.InvalidSecretKey,
                message: "Checksum result do not match",
            };

        try {
            const sk = new SecretKey(key);
            return {
                code: WalletResultCode.Success,
                message: WalletMessage.Success,
            };
        } catch (e) {
            return {
                code: WalletResultCode.InvalidPublicKey,
                message: "This key is not valid",
            };
        }
    }

    /**
     * Validate secret key against public key
     * @param secretKey the string of the secret key
     * @param publicKey the string of the public key
     */
    public static isValidSecretKeyAgainstPublicKey(secretKey: string, publicKey: string): IWalletResult<void> {
        const validPublicKey: IWalletResult<void> = this.isValidPublicKey(publicKey);
        const validSecretKey: IWalletResult<void> = this.isValidSecretKey(secretKey);

        if (validPublicKey.code !== WalletResultCode.Success) return validPublicKey;
        if (validSecretKey.code !== WalletResultCode.Success) return validSecretKey;

        try {
            const pk = new PublicKey(publicKey);
            const sk = new SecretKey(secretKey);

            if (Buffer.compare(sk.scalar.toPoint().data, pk.data) === 0) {
                return {
                    code: WalletResultCode.Success,
                    message: WalletMessage.Success,
                };
            } else {
                return {
                    code: WalletResultCode.InvalidKeyPair,
                    message: "This is not a valid key pair",
                };
            }
        } catch (e) {
            return {
                code: WalletResultCode.InvalidKeyPair,
                message: "This is not a valid key pair",
            };
        }
    }

    /**
     * Validate the hash string
     * @param value The string of the hash
     */
    public static isValidHash(value: string): IWalletResult<void> {
        const h = value.trim();
        if (h.length !== 130)
            return {
                code: WalletResultCode.InvalidHashLength,
                message: "Invalid hash length",
            };

        if (h.substring(0, 2) !== "0x")
            return {
                code: WalletResultCode.InvalidHashFormat,
                message: "Invalid hash format",
            };

        try {
            const hs = new Hash(h);
            return {
                code: WalletResultCode.Success,
                message: WalletMessage.Success,
            };
        } catch (e) {
            return {
                code: WalletResultCode.InvalidHash,
                message: "This is not a valid hash",
            };
        }
    }
}
