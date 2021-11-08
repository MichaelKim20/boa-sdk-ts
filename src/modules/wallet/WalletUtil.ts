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
import { KeyPair, PublicKey, SecretKey } from "../common/KeyPair";
import { IWalletResult, WalletMessage, WalletResultCode } from "./Types";

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
                message: WalletMessage.InvalidAmount,
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
                message: WalletMessage.InvalidPublicKeyLength,
            };
        }

        try {
            const pk = new PublicKey(key);
            return {
                code: WalletResultCode.Success,
                message: WalletMessage.Success,
            };
        } catch (e) {
            return {
                code: WalletResultCode.InvalidPublicKey,
                message: WalletMessage.InvalidPublicKey,
            };
        }
    }

    /**
     * Validate the secret key string.
     * @param secretKey The string of secret key
     */
    public static isValidSecretKey(secretKey: string): IWalletResult<any> {
        const key = secretKey.trim();
        if (key.length !== 56) {
            return {
                code: WalletResultCode.InvalidSecretKeyLength,
                message: WalletMessage.InvalidSecretKeyLength,
            };
        }

        try {
            const sk = new SecretKey(key);
            return {
                code: WalletResultCode.Success,
                message: WalletMessage.Success,
            };
        } catch (e) {
            return {
                code: WalletResultCode.InvalidSecretKey,
                message: WalletMessage.InvalidSecretKey,
            };
        }
    }

    /**
     * Validate secret key against public key
     * @param secretKey the string of the secret key
     * @param publicKey the string of the public key
     */
    public static isValidSecretKeyAgainstPublicKey(secretKey: string, publicKey: string): IWalletResult<any> {
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
                    message: WalletMessage.InvalidKeyPair,
                };
            }
        } catch (e) {
            return {
                code: WalletResultCode.InvalidKeyPair,
                message: WalletMessage.InvalidKeyPair,
            };
        }
    }

    /**
     * Validate the hash string
     * @param value The string of the hash
     */
    public static isValidHash(value: string): IWalletResult<any> {
        const h = value.trim();
        if (h.length !== 130)
            return {
                code: WalletResultCode.InvalidHashLength,
                message: WalletMessage.InvalidHashLength,
            };

        if (h.substring(0, 2) !== "0x")
            return {
                code: WalletResultCode.InvalidHashFormat,
                message: WalletMessage.InvalidHashFormat,
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
                message: WalletMessage.InvalidHash,
            };
        }
    }
}

/**
 * This class contains utility for the wallet
 */
export class WalletUtils {
    /**
     * Create a new keypair
     */
    public static createKeyPair(): IWalletResult<KeyPair> {
        let key: KeyPair;
        try {
            key = KeyPair.random();
        } catch (e) {
            return {
                code: WalletResultCode.SystemError,
                message: WalletMessage.SystemError,
            };
        }
        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: key,
        };
    }

    /**
     * Restore a keypair using the secret key.
     */
    public static createKeyPairFromSecretKey(secret: string): IWalletResult<KeyPair> {
        const res: IWalletResult<KeyPair> = WalletValidator.isValidSecretKey(secret);
        if (res.code !== WalletResultCode.Success) return res;

        let key: KeyPair;
        try {
            const secretKey = new SecretKey(secret);
            key = KeyPair.fromSeed(secretKey);
        } catch (e) {
            return {
                code: WalletResultCode.SystemError,
                message: WalletMessage.SystemError,
            };
        }
        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: key,
        };
    }

    /**
     * Get short address (boa11234....12)
     * @param address The public key
     */
    public static getShortAddress(address: PublicKey) {
        const full = address.toString();
        return full.substring(0, 8) + "..." + full.substring(full.length - 2);
    }
}
