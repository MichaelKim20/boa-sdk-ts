/*******************************************************************************

    The wallet utility

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";

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
                message: e.message,
            };
        }
    }
}
