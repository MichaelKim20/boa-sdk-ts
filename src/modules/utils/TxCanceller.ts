/*******************************************************************************

    Includes class to cancel a transaction

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { Hash } from "../common/Hash";
import { KeyPair, PublicKey } from "../common/KeyPair";
import { Constant } from "../data/Constant";
import { Transaction } from "../data/Transaction";
import { OutputType } from "../data/TxOutput";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { LockType } from "../script/Lock";
import { TxBuilder } from "./TxBuilder";
import { TxPayloadFee } from "./TxPayloadFee";

/**
 * A class that creates a cancellation transaction.
 */
export class TxCanceller {
    public static double_spent_threshold_pct: number = 20;

    /**
     * The original transaction
     */
    private tx: Transaction;

    /**
     * The array of KeyPairs to be used for signing
     */
    private key_pairs: KeyPair[];

    /**
     * The array of UTXO information used in tx's inputs
     */
    private utxos: UnspentTxOutput[];

    /**
     * Constructor
     * @param tx           The original transaction
     * @param key_pairs    The array of KeyPairs to be used for signing
     * @param utxos        The array of UTXO information used in tx's inputs
     */
    constructor(tx: Transaction, utxos: UnspentTxOutput[], key_pairs: KeyPair[]) {
        this.tx = tx;
        this.utxos = utxos;
        this.key_pairs = key_pairs;
    }

    /**
     * Find the element in the array that corresponds to the hash of utxo.
     * @param utxo The hash of UTXO
     */
    private findUTXO(utxo: Hash): UnspentTxOutput | undefined {
        return this.utxos.find((m) => Hash.equal(m.utxo, utxo));
    }

    /**
     * Find the element corresponding to the public key in the array.
     * @param address The public key
     */
    private findKey(address: PublicKey): KeyPair | undefined {
        return this.key_pairs.find((m) => PublicKey.equal(m.address, address));
    }

    /**
     * Validate that the transaction is cancelable transaction.
     */
    private validate(): ITxCancelResult {
        if (this.tx.inputs.length === 0)
            return {
                code: TxCancelResultCode.Cancel_InvalidTransaction,
                message: "This transaction is invalid and cannot be canceled.",
            };

        if (this.key_pairs.length === 0)
            return { code: TxCancelResultCode.Cancel_NotFoundKey, message: "Secret key not found." };

        for (const input of this.tx.inputs) {
            const u = this.findUTXO(input.utxo);
            if (u === undefined)
                return { code: TxCancelResultCode.Cancel_NotFoundUTXO, message: "UTXO information not found." };

            if (u.lock_type !== LockType.Key)
                return {
                    code: TxCancelResultCode.Cancel_UnsupportedLockType,
                    message: "This LockType not supported by cancel feature.",
                };

            const pk = new PublicKey(Buffer.from(u.lock_bytes, "base64"));
            const found = this.findKey(pk);
            if (found === undefined)
                return { code: TxCancelResultCode.Cancel_NotFoundKey, message: "Secret key not found." };

            // Unfreezing transactions cannot be canceled.
            if (u.type === OutputType.Freeze)
                return {
                    code: TxCancelResultCode.Cancel_NotAllowUnfreezing,
                    message: "Unfreeze transactions cannot be canceled.",
                };
        }

        const amount_info = this.calculateAmount();
        const new_adjusted_fee = this.getNewAdjustedFee(amount_info);
        const tx_size = Transaction.getEstimatedNumberOfBytes(
            this.tx.inputs.length,
            this.tx.inputs.length,
            this.tx.payload.length
        );
        const total_fee = Amount.multiply(new_adjusted_fee, tx_size);

        // Fees for cancellation transactions can be set larger than existing fees.
        // Make sure it's big enough to work it out.
        if (Amount.lessThan(amount_info.sum_input, Amount.add(total_fee, Amount.make(this.tx.inputs.length))))
            return { code: TxCancelResultCode.Cancel_NotEnoughFee, message: "Not enough fees are needed to cancel." };

        return { code: TxCancelResultCode.Success, message: "Success." };
    }

    /**
     * Calculate the transaction fee.
     */
    private calculateAmount(): ITxAmountInfo {
        let sum_in: Amount = Amount.make(0);
        let sum_out: Amount = Amount.make(0);
        let freezing_fee: Amount = Amount.make(0);

        for (const input of this.tx.inputs) {
            const u = this.findUTXO(input.utxo);
            if (u !== undefined) {
                sum_in = Amount.add(sum_in, u.amount);
                if (u.type === OutputType.Freeze) sum_in = Amount.add(sum_in, Constant.SlashPenaltyAmount);
            }
        }

        for (const output of this.tx.outputs) {
            sum_out = Amount.add(sum_out, output.value);
            if (output.type === OutputType.Freeze) freezing_fee = Amount.add(freezing_fee, Constant.SlashPenaltyAmount);
        }

        const total_fee = Amount.subtract(sum_in, sum_out);
        const tx_payload_fee = Amount.subtract(total_fee, freezing_fee);
        const payload_fee = TxPayloadFee.getFeeAmount(this.tx.payload.length);
        const tx_fee = Amount.subtract(tx_payload_fee, payload_fee);
        const tx_size = this.tx.getNumberOfBytes();

        return {
            sum_input: sum_in,
            sum_output: sum_out,
            total_fee,
            payload_fee,
            freezing_fee,
            tx_fee,
            tx_size,
            adjusted_fee: Amount.divide(tx_payload_fee, tx_size),
        };
    }

    /**
     * Calculate the fees to be used in cancellation transactions.
     */
    private getNewAdjustedFee(amount_info: ITxAmountInfo): Amount {
        return Amount.divide(
            Amount.multiply(amount_info.adjusted_fee, 100 + TxCanceller.double_spent_threshold_pct),
            100
        );
    }

    /**
     * Builder a cancellation transaction.
     * @return If successful, res.code will have TxCancelResultCode.Success.
     * Otherwise, they have values based on the cause of the error.
     */
    public build(): ITxCancelResult {
        const result_val = this.validate();
        if (result_val.code !== TxCancelResultCode.Success) return result_val;

        const amount_info = this.calculateAmount();
        const new_adjusted_fee = this.getNewAdjustedFee(amount_info);

        const in_length = this.tx.inputs.length;
        const tx_size = Transaction.getEstimatedNumberOfBytes(in_length, in_length, this.tx.payload.length);
        const total_fee = Amount.multiply(new_adjusted_fee, tx_size);
        const payload_fee = TxPayloadFee.getFeeAmount(this.tx.payload.length);
        const tx_fee = Amount.subtract(total_fee, payload_fee);

        const divided_fee = Amount.divide(total_fee, in_length);
        const remain_fee = Amount.subtract(total_fee, Amount.multiply(divided_fee, in_length));

        const builder = new TxBuilder(this.key_pairs[0]);
        let new_tx;
        try {
            this.tx.inputs.forEach((input, idx) => {
                const u = this.findUTXO(input.utxo);
                if (u !== undefined) {
                    const k = this.findKey(new PublicKey(Buffer.from(u.lock_bytes, "base64")));
                    if (k !== undefined) {
                        let amount = Amount.subtract(u.amount, divided_fee);
                        if (idx === in_length - 1) amount = Amount.subtract(amount, remain_fee);

                        builder.addInput(u.type, u.utxo, u.amount, k.secret);
                        builder.addOutput(k.address, amount);
                    }
                }
            });
            new_tx = builder.sign(
                OutputType.Payment,
                tx_fee,
                payload_fee,
                Amount.make(0),
                this.tx.lock_height,
                this.tx.inputs[0].unlock_age
            );
        } catch (e) {
            return {
                code: TxCancelResultCode.FailedBuildTransaction,
                message: e.message,
            };
        }

        return {
            code: TxCancelResultCode.Success,
            message: "Success.",
            tx: new_tx,
        };
    }

    /**
     * PublicKey extract stored on the map of UTXO
     * @param utxo_map the map of UTXO
     */
    public static addresses(utxo_map: Map<string, UnspentTxOutput>): PublicKey[] {
        const res = new Array<PublicKey>();
        utxo_map.forEach((value) => {
            if (value.lock_type === LockType.Key) {
                res.push(new PublicKey(Buffer.from(value.lock_bytes, "base64")));
            }
        });
        return res;
    }
}

interface ITxAmountInfo {
    sum_input: Amount;
    sum_output: Amount;
    total_fee: Amount;
    payload_fee: Amount;
    freezing_fee: Amount;
    tx_fee: Amount;
    tx_size: number;
    adjusted_fee: Amount;
}

export enum TxCancelResultCode {
    Success,
    Cancel_InvalidTransaction,
    Cancel_NotAllowUnfreezing,
    Cancel_NotFoundUTXO,
    Cancel_UnsupportedLockType,
    Cancel_NotFoundKey,
    Cancel_NotEnoughFee,
    FailedBuildTransaction,
}

export interface ITxCancelResult {
    code: TxCancelResultCode;
    message: string;
    tx?: Transaction;
}
