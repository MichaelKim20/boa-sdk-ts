/*******************************************************************************

    Contains class for managing UTXO in the wallet

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { Hash } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";
import { OutputType } from "../data/TxOutput";
import { BalanceType } from "../net/response/Types";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { Utils } from "../utils/Utils";
import { IWalletResult, WalletMessage, WalletResultCode } from "./Types";
import { WalletClient } from "./WalletClient";

import JSBI from "jsbi";

/**
 * Class for managing UTXO
 * Manage what is used and not used in payment for UTXO
 */
export class WalletUTXOProvider {
    /**
     * Internal UTXO Array
     */
    private readonly items: InternalUTXO[];

    /**
     * UTXO Owner's Public Key
     * @private
     */
    private address: PublicKey;

    /**
     * It is a client to access Agora and Stoa.
     * @private
     */
    private client: WalletClient;

    /**
     * The type of balance (0: Spendable,, 1: Frozen, 2: Locked)
     * @private
     */
    private balance_type: BalanceType;

    /**
     * Constructor
     * @param address The instance of the PublicKey
     * @param client  The instance of the BOAClient
     * @param balance_type The balance type
     */
    constructor(address: PublicKey, client: WalletClient, balance_type: BalanceType = BalanceType.spendable) {
        this.address = address;
        this.items = [];
        this.client = client;
        this.balance_type = balance_type;
    }

    /**
     * Add UTXOs. If it already exists, ignore it.
     * After add, Two fields are used for sorting.
     * One is unlock_height and the other is amount.
     * The array is sorted in ascending order of unlock_height,
     * and in ascending order of amount when the same unlock_height is.
     * This allows a UTXO that is created first to be used first.
     * It also allows small amounts to be used first.
     * @param data The array of `UnspentTxOutput`
     */
    public add(data: UnspentTxOutput[]) {
        const old_length = this.items.length;
        this.items.push(
            ...data
                .filter((n) => this.items.find((m) => m.utxo.data.compare(n.utxo.data) === 0) === undefined)
                .map((n) => new InternalUTXO(n.utxo, n.type, n.unlock_height, n.amount, n.height))
        );

        if (this.items.length > old_length)
            this.items.sort((a, b) => {
                const cmp = (x: JSBI, y: JSBI) => (JSBI.greaterThan(x, y) ? 1 : JSBI.lessThan(x, y) ? -1 : 0);
                if (JSBI.notEqual(a.height, b.height)) return cmp(a.height, b.height);
                return Utils.compareBuffer(a.utxo.data, b.utxo.data);
            });
    }

    /**
     * Returns an array of UTXOs to be used for input of transactions
     * based on the amount entered.
     * @param amount The required amount
     * @param estimated_input_fee The estimated fee of the size of one TxInput
     * @returns Returns the available array of UTXO. If the available amount
     * is less than the requested amount, the empty array is returned.
     */
    public async getUTXO(
        amount: Amount,
        estimated_input_fee: Amount = Amount.make(0)
    ): Promise<IWalletResult<UnspentTxOutput[]>> {
        let target_amount: Amount;
        const result: UnspentTxOutput[] = [];

        target_amount = Amount.make(amount);
        while (true) {
            target_amount = Amount.add(target_amount, estimated_input_fee);
            let sum = Amount.make(0);
            const utxo = this.items
                .filter((n) => !n.used)
                .filter((n) => {
                    if (Amount.greaterThanOrEqual(sum, target_amount)) return false;
                    sum = Amount.add(sum, n.amount);
                    n.used = true;

                    target_amount = Amount.add(target_amount, estimated_input_fee);
                    return true;
                })
                .map((n) => new UnspentTxOutput(n.utxo, n.type, n.unlock_height, n.amount, n.height));
            result.push(...utxo);
            const res_sum = result.reduce<Amount>((prev, value) => Amount.add(prev, value.amount), Amount.make(0));
            const estimated_amount = Amount.add(amount, Amount.multiply(estimated_input_fee, result.length));
            if (Amount.greaterThanOrEqual(res_sum, estimated_amount)) break;

            target_amount = Amount.subtract(estimated_amount, res_sum);
            const res = await this.client.getUTXOs(this.address, target_amount, this.balance_type, this.getLastUTXO());
            if (res.code !== WalletResultCode.Success || res.data === undefined) {
                return res;
            }
            if (res.data.length === 0) {
                // Not Enough Amount
                this.items.forEach((m) => {
                    if (result.find((n) => m.utxo.data.compare(n.utxo.data) !== undefined)) {
                        m.used = false;
                    }
                });
                result.length = 0;
                break;
            }
            this.add(res.data);
        }
        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: result,
        };
    }

    private getLastUTXO(): Hash | undefined {
        return this.items.length === 0 ? undefined : this.items[this.items.length - 1].utxo;
    }

    public clear() {
        this.items.length = 0;
    }

    public get length(): number {
        return this.items.length;
    }

    /**
     * It is used to give back the previously taken UTXO without using it.
     * @param unused The array of UnspentTxOutput, previously taken UTXOs
     */
    public giveBack(unused: UnspentTxOutput[]) {
        for (const elem of unused) {
            const found = this.items.find((m) => m.utxo.data.compare(elem.utxo.data) === 0);
            if (found !== undefined) found.used = false;
        }
    }
}

/**
 * Define the internal UTXO
 */
class InternalUTXO extends UnspentTxOutput {
    /**
     * Status variable indicating whether it is used or not
     */
    public used: boolean;

    /**
     * Constructor
     * @param utxo          The hash of the UTXO
     * @param type          The type of the transaction
     * @param unlock_height The height of the block that can be used
     * @param amount        The monetary value of UTXO
     * @param height        The block height
     */
    constructor(utxo: Hash, type: OutputType, unlock_height: JSBI, amount: Amount, height: JSBI) {
        super(utxo, type, unlock_height, amount, height);

        if (JSBI.lessThanOrEqual(this.unlock_height, JSBI.BigInt(0)))
            throw new Error(`Positive unlock_height expected, not ${unlock_height.toString()}`);

        if (Amount.lessThanOrEqual(this.amount, Amount.ZERO_BOA))
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        this.used = false;
    }
}
