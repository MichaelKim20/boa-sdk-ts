/*******************************************************************************

    Contains class for managing UTXO

    This class manages what is used and not used in payment for UTXO
    This calculates the sum of the UTXO amounts.
    This also provides UTXO for the required amount.
    This allows for the addition of a later UTXO.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { OutputType } from "../data/TxOutput";
import { Hash } from "../common/Hash";

import JSBI from 'jsbi';

/**
 * Class for managing UTXO
 * Manage what is used and not used in payment for UTXO
 */
export class UTXOManager
{
    /**
     * Internal UTXO Array
     */
    private readonly items: Array<InternalUTXO>;

    /**
     * Constructor
     * @param data The array containing UnspentTxOutput objects
     */
    constructor (data: Array<UnspentTxOutput>)
    {
        this.items = [];
        this.add(data);
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
    public add (data: Array<UnspentTxOutput>)
    {
        let old_length = this.items.length;
        this.items.push(
            ...data
                .filter(n => this.items.find(m => (m.utxo.data.compare(n.utxo.data) === 0)) === undefined)
                .map(n => new InternalUTXO(n.utxo, n.type, n.unlock_height, n.amount)));

        if (this.items.length > old_length)
            this.items.sort((a, b) =>
            {
                let cmp = (a: JSBI, b: JSBI) => (JSBI.greaterThan(a, b) ? 1 : (JSBI.lessThan(a, b) ? -1 : 0));
                if (JSBI.notEqual(a.unlock_height, b.unlock_height))
                    return cmp(a.unlock_height, b.unlock_height);
                return cmp(a.amount, b.amount);
            });
    }

    /**
     * Returns the sum of the amount.
     * @param height The height of the current block,
     * if this value is not specified, the total is calculated.
     * @returns Returns the sum of the amount.
     * The first is the sum of UTXO, whose type of transaction is Payment,
     * and the second is the sum of Freeze,
     * and the third is the amount that was released from the freeze
     * but locked to `unlock_height`.
     */
    public getSum (height?: JSBI): [JSBI, JSBI, JSBI]
    {
        if ((height !== undefined) && JSBI.lessThan(height, JSBI.BigInt(0)))
            throw new Error(`The height must be greater than or equal to zero, not ${height.toString()}`);

        return this.items
            .filter(n => !n.used)
            .reduce<[JSBI, JSBI, JSBI]>((sum, n) =>
            {
                if ((height !== undefined) && JSBI.greaterThan(JSBI.subtract(n.unlock_height, JSBI.BigInt(1)), height))
                    sum[2] = JSBI.add(sum[2], n.amount);
                else
                    sum[n.type] = JSBI.add(sum[n.type], n.amount);
                return sum;
            }, [JSBI.BigInt(0), JSBI.BigInt(0), JSBI.BigInt(0)]);
    }

    /**
     * Returns an array of UTXOs to be used for input of transactions
     * based on the amount entered.
     * @param amount The required amount
     * @param height The height of latest block
     * @param estimated_input_fee The estimated fee of the size of one TxInput
     * @returns Returns the available array of UTXO. If the available amount
     * is less than the requested amount, the empty array is returned.
     */
    public getUTXO (amount: JSBI, height: JSBI, estimated_input_fee: JSBI = JSBI.BigInt(0)): Array<UnspentTxOutput>
    {
        let target_amount = JSBI.BigInt(amount);
        if (JSBI.lessThanOrEqual(target_amount, JSBI.BigInt(0)))
            throw new Error(`Positive amount expected, not ${target_amount.toString()}`);

        if (JSBI.lessThan(height, JSBI.BigInt(0)))
            throw new Error(`The height must be greater than or equal to zero, not ${height.toString()}`);

        if (JSBI.greaterThan(target_amount, this.getSum(height)[OutputType.Payment]))
            return [];

        target_amount = JSBI.add(target_amount, estimated_input_fee);
        let sum = JSBI.BigInt(0);
        return this.items
            .filter(n => (!n.used && (n.type == OutputType.Payment)
                && JSBI.lessThanOrEqual(JSBI.subtract(n.unlock_height, JSBI.BigInt(1)), height)))
            .filter((n) =>
            {
                if (JSBI.greaterThanOrEqual(sum, target_amount))
                    return false;
                sum = JSBI.add(sum, n.amount);
                n.used = true;

                target_amount = JSBI.add(target_amount, estimated_input_fee);
                return true
            })
            .map(n => new UnspentTxOutput(
                n.utxo, n.type,
                n.unlock_height, n.amount));
    }
}

/**
 * Define the internal UTXO
 */
class InternalUTXO extends UnspentTxOutput
{
    /**
     * Status variable indicating whether it is used or not
     */
    public used: Boolean;

    /**
     * Constructor
     * @param utxo          The hash of the UTXO
     * @param type          The type of the transaction
     * @param unlock_height The height of the block that can be used
     * @param amount        The monetary value of UTXO
     */
    constructor (utxo: Hash, type: OutputType, unlock_height: JSBI, amount: JSBI)
    {
        super(utxo, type, unlock_height, amount);

        if (JSBI.lessThanOrEqual(this.unlock_height, JSBI.BigInt(0)))
            throw new Error(`Positive unlock_height expected, not ${unlock_height.toString()}`);

        if (JSBI.lessThanOrEqual(this.amount, JSBI.BigInt(0)))
            throw new Error(`Positive amount expected, not ${amount.toString()}`);

        this.used = false;
    }
}
