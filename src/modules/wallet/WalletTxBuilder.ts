/*******************************************************************************

    Contains a class that builds transactions of a wallet with multiple senders
        and multiple receivers.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { Hash, hashFull, makeUTXOKey } from "../common/Hash";
import { KeyPair, PublicKey } from "../common/KeyPair";
import { Transaction } from "../data/Transaction";
import { TxInput } from "../data/TxInput";
import { OutputType } from "../data/TxOutput";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { LockType } from "../script/Lock";
import { TxBuilder } from "../utils/TxBuilder";
import { TxPayloadFee } from "../utils/TxPayloadFee";
import { Utils } from "../utils/Utils";
import { Account, AccountMode } from "./Account";
import { Event, EventDispatcher } from "./EventDispatcher";
import {
    ITransactionOverview,
    ITransactionOverviewReceiver,
    ITransactionOverviewSender,
    IWalletReceiver,
    IWalletResult,
    IWalletSender,
    WalletMessage,
    WalletResultCode,
    WalletTransactionFeeOption,
} from "./Types";
import { WalletClient } from "./WalletClient";

import JSBI from "jsbi";

/**
 * Definition of a class with elements to be used as an output of a transaction
 */
export class WalletReceiver implements IWalletReceiver {
    /**
     * The address of the receiver
     */
    public address: PublicKey;

    /**
     * The amount to transfer
     */
    public amount: Amount;

    /**
     * Constructor
     * @param address The address of the receiver
     * @param amount  The amount to transfer
     */
    constructor(address: PublicKey, amount: Amount) {
        this.address = address;
        this.amount = amount;
    }
}

/**
 * Definition of a class with elements to be used as a input of a transaction
 */
export class WalletSender {
    /**
     * The instance of Account, It has the account's public key, secret key, and balance information.
     */
    public account: Account;

    /**
     * The amount to be spent
     */
    public drawn: Amount;

    /**
     * The amount not enough.
     */
    public remaining: Amount;

    /**
     * The amount that can be used in the account.
     */
    public spendable: Amount;

    /**
     * The array of UTXO
     */
    public utxos: UnspentTxOutput[];

    /**
     * The total amount of UTXOs
     */
    public total_amount_utxos: Amount;

    /**
     * The value that defines the validity of the data is valid if this value is true, otherwise it is invalid.
     */
    public enable: boolean;

    /**
     * Constructor
     * @param account The instance of Account. It has the account's public key, secret key, and balance information.
     */
    constructor(account: Account) {
        this.account = account;
        this.drawn = Amount.make(0);
        this.remaining = Amount.make(0);
        this.spendable = Amount.make(this.account.balance.spendable);
        this.utxos = [];
        this.total_amount_utxos = Amount.make(0);
        this.enable = false;
    }

    public calculateUTXOSum() {
        this.total_amount_utxos = this.utxos.reduce<Amount>(
            (prev, value) => Amount.add(prev, value.amount),
            Amount.make(0)
        );
    }
}

/**
 * The container for WalletReceiver.
 */
export class WalletReceiverContainer extends EventDispatcher {
    /**
     * The storage of the receivers
     */
    public items: WalletReceiver[] = [];

    /**
     * Add a receiver
     * @param receiver  the receiver to be added
     * @param replace   Specify whether to change the amount or ignore it when there is one with the same address.
     * If this value is true, if the same account address exists, it will be changed to a new amount.
     */
    public add(receiver: IWalletReceiver, replace: boolean = true): boolean {
        if (replace) {
            const elem = this.items.find((m) => PublicKey.equal(m.address, receiver.address));
            if (elem !== undefined) elem.amount = receiver.amount;
            else this.items.push(new WalletReceiver(receiver.address, receiver.amount));
        } else {
            this.items.push(new WalletReceiver(receiver.address, receiver.amount));
        }
        return true;
    }

    /**
     * Remove a receiver
     * @param receiver the receiver to be removed
     */
    public remove(receiver: IWalletReceiver): boolean {
        const idx = this.items.findIndex(
            (m) => PublicKey.equal(m.address, receiver.address) && Amount.equal(m.amount, receiver.amount)
        );
        if (idx < 0) return false;
        this.items.splice(idx, 1);
        return true;
    }

    /**
     * Remove a receiver by address
     * @param address the receiver to be removed with this address
     */
    public removeAddress(address: PublicKey): boolean {
        let changed = false;
        while (true) {
            const idx = this.items.findIndex((m) => PublicKey.equal(m.address, address));
            if (idx < 0) break;
            this.items.splice(idx, 1);
            changed = true;
        }
        return changed;
    }

    /**
     * Remove all receivers
     */
    public clear(): boolean {
        const changed = this.items.length > 0;
        this.items.length = 0;
        return changed;
    }

    /**
     * Return the number of receivers
     */
    public get length(): number {
        return this.items.length;
    }
}

/**
 * The container for several WalletSender.
 */
export class WalletSenderContainer extends EventDispatcher {
    /**
     * The storage of the senders
     */
    public items: WalletSender[] = [];

    /**
     * Add a sender
     * @param account The account of the sender to be added
     * @param drawn The amount to be withdrawn.
     */
    public add(account: Account, drawn: Amount): WalletSender | undefined {
        const elem = this.items.find((m) => PublicKey.equal(m.account.address, account.address));
        if (elem !== undefined) return undefined;
        const sender = new WalletSender(account);
        sender.drawn = Amount.make(drawn);
        this.items.push(sender);
        return sender;
    }

    /**
     * Remove a sender
     * @param account The account of the sender to be removed
     */
    public remove(account: Account): WalletSender | undefined {
        const idx = this.items.findIndex((m) => PublicKey.equal(m.account.address, account.address));
        if (idx < 0) return undefined;
        const sender = this.items[idx];
        this.items.splice(idx, 1);
        return sender;
    }

    /**
     * Clear all sender
     */
    public clear(): boolean {
        const changed = this.items.length > 0;
        this.items.length = 0;
        return changed;
    }

    /**
     * Return the number of the senders
     */
    public get length(): number {
        return this.items.length;
    }

    /**
     * Return the senders without the secret key
     */
    public get readonly_accounts(): Account[] {
        return this.items.filter((m) => m.account.mode === AccountMode.READ_ONLY).map((m) => m.account);
    }

    /**
     * Return the senders with the secret key
     */
    public get sudo_accounts(): Account[] {
        return this.items.filter((m) => m.account.mode === AccountMode.SUDO).map((m) => m.account);
    }

    /**
     * Return the array of account
     */
    public get accounts(): Account[] {
        return this.items.map((m) => m.account);
    }

    public values(): IWalletSender[] {
        return this.items.map((m) => {
            return {
                address: m.account.address,
                drawn: m.drawn,
                remaining: m.remaining,
                spendable: m.spendable,
            };
        });
    }
}

/**
 * The transaction builder for multi sender, multi receiver
 */
export class WalletTxBuilder extends EventDispatcher {
    /**
     * The instance of the WalletClient
     */
    protected _client: WalletClient;

    /**
     * The storage of the receivers
     */
    protected readonly _receivers: WalletReceiverContainer;

    /**
     * The storage of the senders
     */
    protected readonly _senders: WalletSenderContainer;

    /**
     * The payload of a transaction
     */
    protected _payload: Buffer;

    /**
     * The option of fee
     */
    protected _fee_option: WalletTransactionFeeOption;

    /**
     * The fee of the transaction
     */
    protected _fee_tx: Amount;

    /**
     * The fee of _payload
     */
    protected _fee_payload: Amount;

    /**
     * The amount to be spent
     */
    protected _total_drawn: Amount;

    /**
     * The amount not enough.
     */
    protected _remaining: Amount;

    /**
     * The amount that can be used in the account.
     */
    private _total_spendable: Amount;

    /**
     * The ratio of fees to the size of the transaction
     */
    protected _fee_rate: number;

    /**
     * The size of transaction
     * @private
     */
    private _size_tx: number;

    /**
     * Constructor
     * @param client The wallet client to request
     */
    constructor(client: WalletClient) {
        super();
        this._client = client;
        this._receivers = new WalletReceiverContainer();
        this._senders = new WalletSenderContainer();
        this._fee_option = WalletTransactionFeeOption.Medium;
        this._fee_tx = Amount.make(0);
        this._fee_payload = Amount.make(0);
        this._payload = Buffer.alloc(0);

        this._total_spendable = Amount.make(0);
        this._total_drawn = Amount.make(0);
        this._remaining = Amount.make(0);

        this._fee_rate = Utils.FEE_RATE;
        this._size_tx = Transaction.getEstimatedNumberOfBytes(1, 2, 0);
        this._fee_tx = this.getEstimatedFee(1, 2, 0);

        const tx_size = this.getEstimatedSize(1, 2, 0);
        this._client.getTransactionFee(tx_size).then((res) => {
            if (res.code === WalletResultCode.Success && res.data !== undefined) {
                this._fee_rate = JSBI.toNumber(Amount.divide(res.data.getFee(this._fee_option), tx_size).value);
                if (this._fee_rate < Utils.FEE_RATE) this._fee_rate = Utils.FEE_RATE;
                this._fee_tx = this.getEstimatedFee(1, 2, 0);
            } else {
                this._fee_rate = Utils.FEE_RATE;
            }
        });
    }

    /**
     * Add a receiver
     * @param receiver  the receiver to be added
     * @param replace   Specify whether to change the amount or ignore it when there is one with the same address.
     * If this value is true, if the same account address exists, it will be changed to a new amount.
     */
    public async addReceiver(receiver: IWalletReceiver, replace: boolean = true) {
        if (this._receivers.add(receiver, replace)) {
            await this.calculate();
            this.dispatchEvent(Event.CHANGE_RECEIVER);
        }
    }

    /**
     * Remove a receiver
     * @param receiver the receiver to be removed
     */
    public async removeReceiver(receiver: IWalletReceiver) {
        if (this._receivers.remove(receiver)) {
            await this.calculate();
            this.dispatchEvent(Event.CHANGE_RECEIVER);
        }
    }

    /**
     * Remove a receiver by address
     * @param address
     */
    public async removeReceiverAddress(address: PublicKey) {
        if (this._receivers.removeAddress(address)) {
            await this.calculate();
            this.dispatchEvent(Event.CHANGE_RECEIVER);
        }
    }

    /**
     * Remove all receivers
     */
    public async clearReceiver(is_dispatch: boolean) {
        if (this._receivers.clear()) {
            if (is_dispatch) {
                await this.calculate();
                this.dispatchEvent(Event.CHANGE_RECEIVER);
            }
        }
    }

    /**
     * Return the number of receivers
     */
    public get lengthReceiver(): number {
        return this._receivers.length;
    }

    /**
     * Add a sender
     * @param account The account of the sender to be added
     * @param drawn The amount to be withdrawn.
     */
    public async addSender(account: Account, drawn: Amount) {
        const sender = this._senders.add(account, drawn);
        if (sender !== undefined) {
            if (!sender.account.balance.enable) await sender.account.checkBalance(false);
            if (Amount.equal(drawn, Amount.make(0))) sender.drawn = Amount.make(sender.account.balance.spendable);
            sender.utxos.length = 0;
            sender.account.addEventListener(Event.CHANGE_BALANCE, this.onAccountChangeBalance, this);
            sender.account.spendableUTXOProvider.clear();
            const res = await sender.account.spendableUTXOProvider.getUTXO(sender.drawn);
            if (res.code === WalletResultCode.Success && res.data !== undefined) {
                sender.utxos.push(...res.data);
                sender.calculateUTXOSum();
                sender.enable = true;
                await this.calculate(true);
            } else {
                this.dispatchEvent(Event.ERROR, res.code);
            }
        }
    }

    /**
     * Remove a sender
     * @param account The account of the sender to be removed
     */
    public async removeSender(account: Account) {
        const sender = this._senders.remove(account);
        if (sender !== undefined) {
            sender.account.removeEventListener(Event.CHANGE_BALANCE, this.onAccountChangeBalance, this);
            await this.calculate();
            this.dispatchEvent(Event.CHANGE_SENDER);
        }
    }

    /**
     * Clear all sender
     */
    public async clearSender(is_dispatch: boolean = true) {
        this._senders.items.forEach((m) =>
            m.account.removeEventListener(Event.CHANGE_BALANCE, this.onAccountChangeBalance, this)
        );
        if (this._senders.clear()) {
            if (is_dispatch) {
                await this.calculate(true);
            }
        }
    }

    /**
     * Return the number of the senders
     */
    public get lengthSender(): number {
        return this._senders.length;
    }

    /**
     * Get the sum of receiver's amounts
     */
    public getTotalReceiverAmount(): Amount {
        return this._receivers.items.reduce<Amount>((prev, m) => Amount.add(prev, m.amount), Amount.make(0));
    }

    /**
     * Calculate the amount to be withdrawn from all sending accounts.
     * At this time, the number of UTXO to be used increases, and accordingly,
     * the fee increases. Therefore, the withdrawn amount gradually increases as the used UTXO increases.
     * @private
     */
    protected async calculate(already_changed: boolean = false) {
        let out_count = this.lengthReceiver;
        if (out_count === 0) out_count = 2;
        else out_count++;

        let in_count = 0;
        const total_amount = this.getTotalReceiverAmount();

        const new_fee_payload: Amount = TxPayloadFee.getFeeAmount(this._payload.length);
        let changed = false;
        let new_fee_tx: Amount = Amount.make(0);

        let new_total_drawn = Amount.make(0);
        let new_remaining = Amount.make(0);
        let new_total_spendable = Amount.make(0);

        if (Amount.equal(total_amount, Amount.make(0))) {
            for (const sender of this._senders.items) {
                sender.drawn = sender.spendable;
                sender.remaining = Amount.make(0);
            }
        } else {
            let done = false; // If you have already made the amount to be transferred, this value is true.
            for (const sender of this._senders.items) {
                const sender_old_enable = sender.enable;
                const sender_old_spendable = sender.spendable;
                const sender_old_drawn = sender.drawn;
                const sender_old_remaining = sender.remaining;

                sender.spendable = sender.account.balance.spendable;
                new_total_spendable = Amount.add(new_total_spendable, sender.spendable);
                if (done) {
                    sender.drawn = Amount.make(0);
                    sender.remaining = Amount.make(0);
                    sender.account.spendableUTXOProvider.giveBack(sender.utxos);
                    sender.utxos.length = 0;
                    sender.total_amount_utxos = Amount.make(0);
                } else {
                    const cs_res: { done: boolean; fee: Amount } = await this.calculateSender(
                        sender,
                        total_amount,
                        new_total_drawn,
                        in_count,
                        out_count,
                        new_fee_payload
                    );
                    done = cs_res.done;
                    new_fee_tx = cs_res.fee;

                    // It is reflected in the total value.
                    if (sender.enable) {
                        in_count += sender.utxos.length;
                        new_total_drawn = Amount.add(new_total_drawn, sender.drawn);
                        new_remaining = Amount.make(sender.remaining);
                    }
                }

                // If the recipient's value has changed, indicate that it has changed.
                if (
                    sender_old_enable !== sender.enable ||
                    !Amount.equal(sender_old_spendable, sender.spendable) ||
                    !Amount.equal(sender_old_drawn, sender.drawn) ||
                    !Amount.equal(sender_old_remaining, sender.remaining)
                ) {
                    changed = true;
                }
            }
        }

        if (
            Amount.greaterThan(new_total_drawn, Amount.make(0)) &&
            Amount.equal(new_remaining, Amount.make(0)) &&
            Amount.greaterThan(new_total_spendable, Amount.make(0))
        ) {
            const key_pair = KeyPair.random();
            const builder = new TxBuilder(key_pair);
            if (this._payload.length > 0) builder.assignPayload(this._payload);
            this._senders.items.forEach((s) => {
                s.utxos.forEach((m) => {
                    builder.addInput(m.utxo, m.amount, s.account.secret);
                });
            });
            this._receivers.items.forEach((r) => {
                builder.addOutput(r.address, r.amount);
            });
            let transaction: Transaction;
            let tx_size: number;
            transaction = builder.sign(OutputType.Payment);
            tx_size = transaction.getNumberOfBytes();
            const actual_fee = Amount.make(this._fee_rate * tx_size);
        }
        // If the total value has been changed, indicate it.
        if (
            !Amount.equal(this._total_spendable, new_total_spendable) ||
            !Amount.equal(this._total_drawn, new_total_drawn) ||
            !Amount.equal(this._remaining, new_remaining)
        ) {
            changed = true;
            this._total_spendable = Amount.make(new_total_spendable);
            this._total_drawn = Amount.make(new_total_drawn);
            this._remaining = Amount.make(new_remaining);
        }

        // If the data has been changed, send an event that it has been changed.
        if (changed || already_changed) {
            this.dispatchEvent(Event.CHANGE_SENDER);
        }

        if (!Amount.equal(this._fee_tx, new_fee_tx)) {
            this._fee_tx = Amount.make(new_fee_tx);
            this.dispatchEvent(Event.CHANGE_TX_FEE, this._fee_tx);
        }

        if (!Amount.equal(this._fee_payload, new_fee_payload)) {
            this._fee_payload = Amount.make(new_fee_payload);
            this.dispatchEvent(Event.CHANGE_PAYLOAD_FEE, this._fee_payload);
        }
    }

    /**
     * Calculate the amount to be withdrawn from one sending accounts.
     * @param sender        The sender
     * @param total_amount  The total sending amount
     * @param total_drawn   The sum of the amount to be withdrawn
     * @param in_count      The number of the transaction input
     * @param out_count     The number of the transaction output
     * @param fee_payload   The fee of _payload
     * @private
     */
    protected async calculateSender(
        sender: WalletSender,
        total_amount: Amount,
        total_drawn: Amount,
        in_count: number,
        out_count: number,
        fee_payload: Amount
    ): Promise<{ done: boolean; fee: Amount }> {
        let done = false;
        let fee = Amount.make(0);

        // There are three attempts in case it's not ready yet.
        const max_count = 3;
        let sender_done = false;
        for (let try_count = 0; try_count < max_count || !sender_done; try_count++) {
            let sender_remaining = Amount.make(0);
            let sender_drawn = Amount.make(0);

            // Calculate the size of the transaction.
            this._size_tx = this.getEstimatedSize(in_count + sender.utxos.length, out_count, this._payload.length);

            // Calculate the fee of the transaction.
            fee = this.getEstimatedFee(in_count + sender.utxos.length, out_count, this._payload.length);

            // Calculate the total fee.
            const fee_total = Amount.add(fee, fee_payload);

            // Calculate the amount not drawn. = Total amount to be sent + Fee - Amount already drawn
            const amount = Amount.subtract(Amount.add(total_amount, fee_total), total_drawn);

            // If this sender can cover all of the balance,
            if (Amount.greaterThanOrEqual(sender.spendable, amount)) {
                sender_drawn = Amount.make(amount);
                sender_remaining = Amount.make(0);
                done = true;
            } else {
                sender_drawn = Amount.make(sender.spendable);
                sender_remaining = Amount.subtract(amount, sender.spendable);
                done = false;
            }

            // If the amount allocated to the sender is greater than the sum of the UTXO held by the sender,
            // the required UTXO must be additionally requested.
            if (done || Amount.greaterThan(sender_drawn, sender.total_amount_utxos)) {
                let required_amount: Amount;
                let fee_per_input: Amount;
                if (done) {
                    const new_fee_tx = this.getEstimatedFee(in_count, out_count, this._payload.length);
                    const new_fee_total = Amount.add(new_fee_tx, fee_payload);
                    required_amount = Amount.subtract(Amount.add(total_amount, new_fee_total), total_drawn);
                    fee_per_input = Amount.make(this._fee_rate * TxInput.getEstimatedNumberOfBytes());
                } else {
                    required_amount = sender_drawn;
                    fee_per_input = Amount.make(0);
                }

                sender.account.spendableUTXOProvider.giveBack(sender.utxos);
                sender.utxos.length = 0;
                sender.total_amount_utxos = Amount.make(0);
                const res = await sender.account.spendableUTXOProvider.getUTXO(required_amount, fee_per_input);
                if (res.code === WalletResultCode.Success && res.data !== undefined) {
                    if (res.data.length > 0) {
                        sender.utxos.push(...res.data);
                        sender.calculateUTXOSum();
                        sender.enable = true;
                        sender.drawn = sender_drawn;
                        sender.remaining = sender_remaining;
                        sender_done = true;
                    } else {
                        // This is when the balance is insufficient.
                        done = false;
                        sender.enable = false;

                        let new_fee_total = Amount.add(
                            this.getEstimatedFee(
                                in_count + sender.account.spendableUTXOProvider.length,
                                out_count,
                                this._payload.length
                            ),
                            fee_payload
                        );
                        required_amount = Amount.subtract(Amount.add(total_amount, new_fee_total), total_drawn);

                        await sender.account.checkBalance(false);

                        sender.spendable = Amount.make(sender.account.balance.spendable);
                        sender.drawn = Amount.make(sender.spendable);
                        if (Amount.greaterThanOrEqual(required_amount, sender.spendable)) {
                            sender.remaining = Amount.subtract(required_amount, sender.spendable);
                        } else {
                            sender.remaining = Amount.make(this._fee_rate * TxInput.getEstimatedNumberOfBytes() * 10);
                        }

                        sender.account.spendableUTXOProvider.clear();
                        sender.utxos.length = 0;
                        sender.total_amount_utxos = Amount.make(0);

                        const res2 = await sender.account.spendableUTXOProvider.getUTXO(sender.spendable);
                        if (res2.code === WalletResultCode.Success && res2.data !== undefined && res2.data.length > 0) {
                            sender.utxos.push(...res.data);
                            sender.calculateUTXOSum();

                            new_fee_total = Amount.add(
                                this.getEstimatedFee(in_count + sender.utxos.length, out_count, this._payload.length),
                                fee_payload
                            );
                            required_amount = Amount.subtract(Amount.add(total_amount, new_fee_total), total_drawn);

                            sender.enable = true;
                            sender.drawn = Amount.make(sender.spendable);
                            sender.remaining = Amount.subtract(required_amount, sender.spendable);
                            if (Amount.greaterThanOrEqual(required_amount, sender.spendable)) {
                                sender.remaining = Amount.subtract(required_amount, sender.spendable);
                            } else {
                                sender.remaining = Amount.make(
                                    this._fee_rate * TxInput.getEstimatedNumberOfBytes() * 10
                                );
                            }
                            sender_done = true;
                        }
                    }
                } else {
                    done = false;
                    sender.enable = false;
                    sender.spendable = Amount.make(0);
                    sender.drawn = Amount.make(0);
                    sender.remaining = Amount.make(amount);

                    sender.account.spendableUTXOProvider.clear();
                    sender.utxos.length = 0;
                    sender.total_amount_utxos = Amount.make(0);

                    this.dispatchEvent(Event.ERROR, res.code);
                }
            } else {
                sender.enable = true;
                sender.drawn = sender_drawn;
                sender.remaining = sender_remaining;
                sender_done = true;
            }
        }
        return {
            done,
            fee,
        };
    }

    /**
     * Get the estimated fee
     * @param num_input         The number of the transaction inputs
     * @param num_output        The number of the transaction outputs
     * @param num_bytes_payload The size of the transaction _payload
     * @private
     */
    private getEstimatedFee(num_input: number, num_output: number, num_bytes_payload: number): Amount {
        return Amount.make(this._fee_rate * this.getEstimatedSize(num_input, num_output, num_bytes_payload));
    }

    /**
     * Get the estimated transaction size
     * @param num_input         The number of the transaction inputs
     * @param num_output        The number of the transaction outputs
     * @param num_bytes_payload The size of the transaction _payload
     * @private
     */
    private getEstimatedSize(num_input: number, num_output: number, num_bytes_payload: number): number {
        return Transaction.getEstimatedNumberOfBytes(
            Math.max(num_input, 1),
            Math.max(num_output, 2),
            num_bytes_payload
        );
    }

    /**
     * Event Handler on change balance of an account
     * @param type The event type
     * @param account The instance of an account
     */
    public async onAccountChangeBalance(type: string, account: Account) {
        const sender = this._senders.items.find((m) => m.account === account);
        if (sender === undefined) return;

        sender.spendable = sender.account.balance.spendable;
        sender.utxos.length = 0;
        await this.calculate();
    }

    /**
     * Aet the _payload
     * @param _payload The data to be stored in the transaction
     */
    public async setPayload(_payload: Buffer) {
        this._payload = _payload;
        await this.calculate();
    }

    /**
     * Set the option of transaction fee
     * @param value The option value  (High, Medium, Low)
     */
    public async setFeeOption(value: WalletTransactionFeeOption) {
        const fee_res = await this._client.getTransactionFee(this._size_tx);
        if (fee_res.code === WalletResultCode.Success && fee_res.data !== undefined) {
            this._fee_option = value;
            this._fee_rate = JSBI.toNumber(Amount.divide(fee_res.data.getFee(this._fee_option), this._size_tx).value);
            if (this._fee_rate < Utils.FEE_RATE) this._fee_rate = Utils.FEE_RATE;
        } else {
            this._fee_rate = Utils.FEE_RATE;
        }
        await this.calculate();
    }

    /**
     * Set the transaction fee, The adjusted value is returned.
     * After calculating internally, an event occurs about the change in fees.
     * @param tx_fee The fee of transaction
     */
    public async setTransactionFee(tx_fee: Amount): Promise<Amount> {
        let num_input = 0;
        for (const sender of this._senders.items) {
            num_input += sender.utxos.length;
        }
        const _fee_rate = JSBI.toNumber(Amount.divide(tx_fee, this._size_tx).value);
        if (_fee_rate < Utils.FEE_RATE) {
            this._fee_rate = Utils.FEE_RATE;
        } else {
            this._fee_rate = _fee_rate;
        }
        await this.calculate();

        return Amount.multiply(Amount.make(this._fee_rate), this._size_tx);
    }

    /**
     * Clear all data
     * @param is_dispatch
     */
    public async clear(is_dispatch: boolean = true) {
        await this.clearReceiver(is_dispatch);
        await this.clearSender(is_dispatch);

        this._fee_rate = Utils.FEE_RATE;
        this._fee_tx = this.getEstimatedFee(1, 2, 0);
        this._fee_payload = Amount.make(0);
        this._total_drawn = Amount.make(0);
        this._remaining = Amount.make(0);
        this._total_spendable = Amount.make(0);
        this._payload = Buffer.alloc(0);
        this._size_tx = Transaction.getEstimatedNumberOfBytes(1, 2, 0);
    }

    /**
     * The ratio of fees to the size of the transaction
     */
    public get fee_rate(): number {
        return this._fee_rate;
    }

    /**
     * The fee of the transaction
     */
    public get fee_tx(): Amount {
        return this._fee_tx;
    }

    /**
     * The fee of _payload
     */
    public get fee_payload(): Amount {
        return this._fee_payload;
    }

    /**
     * The amount to be spent
     */
    public get total_drawn(): Amount {
        return this._total_drawn;
    }

    /**
     * The amount not enough.
     */
    public get remaining(): Amount {
        return this._remaining;
    }

    /**
     * The amount that can be used in the account.
     */
    public get total_spendable(): Amount {
        return this._total_spendable;
    }

    /**
     * The payload of a transaction
     */
    public get payload(): Buffer {
        return this._payload;
    }

    /**
     * The option of fee
     */
    public get fee_option(): WalletTransactionFeeOption {
        return this._fee_option;
    }

    /**
     * The storage of the receivers
     */
    public get receivers(): WalletReceiverContainer {
        return this._receivers;
    }

    /**
     * The storage of the senders
     */
    public get senders(): WalletSenderContainer {
        return this._senders;
    }

    /**
     * Check if there is a condition to create a transaction.
     */
    public validate(): IWalletResult<any> {
        if (this.lengthReceiver < 1)
            return {
                code: WalletResultCode.NotAssignedReceiver,
                message: WalletMessage.NotAssignedReceiver,
            };

        const totalAmount = this.getTotalReceiverAmount();
        if (Amount.lessThanOrEqual(totalAmount, Amount.make(0)))
            return {
                code: WalletResultCode.NotAssignedReceiverAmount,
                message: WalletMessage.NotAssignedReceiverAmount,
            };

        if (Amount.greaterThan(this._remaining, Amount.make(0)))
            return {
                code: WalletResultCode.InsufficientAmount,
                message: WalletMessage.InsufficientAmount,
            };

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
        };
    }

    /**
     * Build a transaction.
     */
    public buildTransaction(type: OutputType = OutputType.Payment): IWalletResult<Transaction> {
        const res_valid: IWalletResult<Transaction> = this.validate();
        if (res_valid.code !== WalletResultCode.Success) return res_valid;

        if (this.getReadOnlyAccount().length > 0) {
            return { code: WalletResultCode.ExistUnknownSecretKey, message: WalletMessage.ExistUnknownSecretKey };
        }

        const refund_account = this._senders.items
            .filter((m) => m.enable)
            .find((m, idx, obj) => {
                return Amount.equal(m.remaining, Amount.ZERO_BOA) || idx === obj.length - 1;
            });

        if (refund_account === undefined) {
            return { code: WalletResultCode.NotAssignedSender, message: WalletMessage.NotAssignedSender };
        }

        let refund_keypair: KeyPair;
        if (refund_account.account.secret !== undefined) {
            refund_keypair = KeyPair.fromSeed(refund_account.account.secret);
        } else {
            return { code: WalletResultCode.ExistUnknownSecretKey, message: WalletMessage.ExistUnknownSecretKey };
        }

        const builder = new TxBuilder(refund_keypair);

        if (this._payload.length > 0) builder.assignPayload(this._payload);
        this._senders.items.forEach((s) => {
            s.utxos.forEach((m) => {
                builder.addInput(m.utxo, m.amount, s.account.secret);
            });
        });

        this._receivers.items.forEach((r) => {
            builder.addOutput(r.address, r.amount);
        });

        let tx: Transaction;
        try {
            tx = builder.sign(type, this._fee_tx, this._fee_payload);
        } catch (e) {
            return { code: WalletResultCode.FailedBuildTransaction, message: WalletMessage.FailedBuildTransaction };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: tx,
        };
    }

    /**
     * Get the overview of the transaction built
     */
    public getTransactionOverview(): IWalletResult<ITransactionOverview> {
        const res: IWalletResult<Transaction> = this.buildTransaction();
        if (res.code !== WalletResultCode.Success || res.data === undefined)
            return {
                code: res.code,
                message: res.message,
            };

        const tx = res.data;
        const tx_hash = hashFull(tx);
        const r: ITransactionOverviewReceiver[] = [];
        for (let idx = 0; idx < tx.outputs.length; idx++) {
            r.push({
                utxo: makeUTXOKey(tx_hash, JSBI.BigInt(idx)),
                address: new PublicKey(tx.outputs[idx].lock.bytes),
                amount: tx.outputs[idx].value,
            });
        }

        const s: ITransactionOverviewSender[] = [];
        for (const input of tx.inputs) {
            let found;
            for (const sender of this._senders.items) {
                found = sender.utxos.find((utxo) => Hash.equal(utxo.utxo, input.utxo));
                if (found !== undefined) {
                    s.push({
                        utxo: found.utxo,
                        address: sender.account.address,
                        amount: found.amount,
                    });
                    break;
                }
            }
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: {
                receivers: r,
                senders: s,
                payload: Buffer.from(this._payload),
                fee_tx: Amount.make(this._fee_tx),
                fee_payload: Amount.make(this._fee_payload),
            },
        };
    }

    /**
     * Returns accounts that require a secret key input.
     */
    public getReadOnlyAccount(): Account[] {
        return this._senders.readonly_accounts;
    }
}

/**
 * The transaction builder for multi sender, single receiver
 */
export class WalletTxBuilderSingleReceiver extends WalletTxBuilder {
    private _receiver_address: PublicKey | undefined;
    private _receiver_amount: Amount | undefined;

    /**
     * Set the address of receiver
     */
    public async setReceiverAddress(address: PublicKey) {
        let changed = false;
        if (this._receiver_address === undefined || !PublicKey.equal(this._receiver_address, address)) {
            changed = true;
        }
        this._receiver_address = new PublicKey(address.data);
        if (this._receiver_amount !== undefined) {
            this._receivers.clear();
            this._receivers.add({
                address: this._receiver_address,
                amount: this._receiver_amount,
            });
            if (changed) await this.calculate();
        }
        if (changed) this.dispatchEvent(Event.CHANGE_RECEIVER);
    }

    /**
     * Set the amount of receiver
     */
    public async setReceiverAmount(amount: Amount) {
        let changed = false;
        if (this._receiver_amount === undefined || Amount.notEqual(this._receiver_amount, amount)) {
            changed = true;
        }
        if (this._receiver_address !== undefined) {
            this._receiver_amount = Amount.make(amount);
            this._receivers.clear();
            this._receivers.add({
                address: this._receiver_address,
                amount: this._receiver_amount,
            });
            if (changed) await this.calculate();
        }
        if (changed) this.dispatchEvent(Event.CHANGE_RECEIVER);
    }

    /**
     * Add a receiver
     * @param receiver  the receiver to be added
     * @param replace   Specify whether to change the amount or ignore it when there is one with the same address.
     * If this value is true, if the same account address exists, it will be changed to a new amount.
     */
    public async addReceiver(receiver: IWalletReceiver, replace: boolean = true) {
        if (this._receivers.length > 0) this._receivers.clear();
        if (this._receivers.add(receiver, replace)) {
            await this.calculate();
            this.dispatchEvent(Event.CHANGE_RECEIVER);
        }
    }

    /**
     * Remove all receivers
     */
    public async clearReceiver(is_dispatch: boolean) {
        if (this._receivers.clear()) {
            if (is_dispatch) {
                await this.calculate();
                this.dispatchEvent(Event.CHANGE_RECEIVER);
            }
        }
    }

    public get receiver_address(): PublicKey | undefined {
        return this._receiver_address;
    }

    public get receiver_amount(): Amount | undefined {
        return this._receiver_amount;
    }
}

/**
 *
 */
export class WalletUnfreeze extends EventDispatcher {
    /**
     * The account to release frozen UTXO.
     */
    private readonly _account: Account;

    /**
     * The instance of the WalletClient
     */
    private readonly _client: WalletClient;

    /**
     * The UTXOs to be unfrozen
     */
    private readonly _utxos: UnspentTxOutput[];

    /**
     * The option of fee
     */
    private _fee_option: WalletTransactionFeeOption;

    /**
     * The fee of the transaction
     */
    private _fee_tx: Amount;

    /**
     * The amount to be unfrozen, The amount excluding the fee from the frozen amount
     */
    private _unfreeze_amount: Amount;

    /**
     * The ratio of fees to the size of the transaction
     */
    private _fee_rate: number;

    /**
     * Construction
     * @param owner The account to release frozen UTXO.
     * @param client The instance of the WalletClient
     */
    constructor(owner: Account, client: WalletClient) {
        super();
        this._account = owner;
        this._client = client;
        this._utxos = [];
        this._fee_option = WalletTransactionFeeOption.Medium;
        this._unfreeze_amount = Amount.make(0);
        this._fee_rate = Utils.FEE_RATE;
        this._fee_tx = this.getEstimatedFee(1, 1, 0);

        const tx_size = this.getEstimatedSize(1, 1, 0);
        this._client.getTransactionFee(tx_size).then((res) => {
            if (res.code === WalletResultCode.Success && res.data !== undefined) {
                this._fee_rate = JSBI.toNumber(Amount.divide(res.data.getFee(this._fee_option), tx_size).value);
                if (this._fee_rate < Utils.FEE_RATE) this._fee_rate = Utils.FEE_RATE;
                this._fee_tx = this.getEstimatedFee(1, 1, 0);
            } else {
                this._fee_rate = Utils.FEE_RATE;
            }
        });
    }

    /**
     * Add a UTXO
     * @param utxo The UTXO to add
     */
    public async addUTXO(utxo: Hash): Promise<IWalletResult<void>> {
        if (this._utxos.findIndex((m) => Hash.equal(m.utxo, utxo)) < 0) {
            const res: IWalletResult<any> = await this._client.getUTXOInfo([utxo]);
            if (res.code === WalletResultCode.Success && res.data !== undefined) {
                if (res.data.length >= 0) {
                    const received_utxo: UnspentTxOutput = res.data[0];
                    const lock_type = received_utxo.lock_type;
                    const lock_bytes = Buffer.from(received_utxo.lock_bytes, "base64");
                    if (lock_type !== LockType.Key) {
                        return {
                            code: WalletResultCode.Unfreeze_UnsupportedLockType,
                            message: WalletMessage.Unfreeze_UnsupportedLockType,
                        };
                    } else if (Buffer.compare(this._account.address.data, lock_bytes) !== 0) {
                        return {
                            code: WalletResultCode.Unfreeze_NotUTXOOwnedAccount,
                            message: WalletMessage.Unfreeze_NotUTXOOwnedAccount,
                        };
                    } else if (received_utxo.type !== OutputType.Freeze) {
                        return {
                            code: WalletResultCode.Unfreeze_NotFrozenUTXO,
                            message: WalletMessage.Unfreeze_NotFrozenUTXO,
                        };
                    } else {
                        this._utxos.push(received_utxo);
                        await this.calculate();
                        return {
                            code: WalletResultCode.Success,
                            message: WalletMessage.Success,
                        };
                    }
                } else {
                    return {
                        code: WalletResultCode.Unfreeze_NotFoundUTXO,
                        message: WalletMessage.Unfreeze_NotFoundUTXO,
                    };
                }
            } else {
                return {
                    code: res.code,
                    message: res.message,
                };
            }
        } else {
            return {
                code: WalletResultCode.Unfreeze_AlreadyAdded,
                message: WalletMessage.Unfreeze_AlreadyAdded,
            };
        }
    }

    /**
     * Remove a UTXO
     * @param utxo The UTXO to remove
     */
    public async removeUTXO(utxo: Hash): Promise<IWalletResult<void>> {
        const found = this._utxos.findIndex((m) => Hash.equal(m.utxo, utxo));
        if (found >= 0) {
            this._utxos.splice(found, 1);
            await this.calculate();
            return {
                code: WalletResultCode.Success,
                message: WalletMessage.Success,
            };
        } else {
            return {
                code: WalletResultCode.Unfreeze_NotFoundUTXO,
                message: WalletMessage.Unfreeze_NotFoundUTXO,
            };
        }
    }

    /**
     * Clear all UTXO
     */
    public async clearUTXO() {
        this._utxos.length = 0;
        await this.calculate();
    }

    /**
     * Get the estimated fee
     * @param num_input         The number of the transaction inputs
     * @param num_output        The number of the transaction outputs
     * @param num_bytes_payload The size of the transaction _payload
     * @private
     */
    private getEstimatedFee(num_input: number, num_output: number, num_bytes_payload: number): Amount {
        return Amount.make(this._fee_rate * this.getEstimatedSize(num_input, num_output, num_bytes_payload));
    }

    /**
     * Get the estimated transaction size
     * @param num_input         The number of the transaction inputs
     * @param num_output        The number of the transaction outputs
     * @param num_bytes_payload The size of the transaction _payload
     * @private
     */
    private getEstimatedSize(num_input: number, num_output: number, num_bytes_payload: number): number {
        return Transaction.getEstimatedNumberOfBytes(
            Math.max(num_input, 1),
            Math.max(num_output, 1),
            num_bytes_payload
        );
    }

    /**
     * Set the option of transaction fee
     * @param value The option value  (High, Medium, Low)
     */
    public async setFeeOption(value: WalletTransactionFeeOption) {
        const tx_size = this.getEstimatedSize(this._utxos.length, 1, 0);
        const fee_res = await this._client.getTransactionFee(tx_size);
        if (fee_res.code === WalletResultCode.Success && fee_res.data !== undefined) {
            this._fee_option = value;
            this._fee_rate = JSBI.toNumber(Amount.divide(fee_res.data.getFee(this._fee_option), tx_size).value);
            if (this._fee_rate < Utils.FEE_RATE) this._fee_rate = Utils.FEE_RATE;
        } else {
            this._fee_rate = Utils.FEE_RATE;
        }
        await this.calculate();
    }

    /**
     * Set the transaction fee, The adjusted value is returned.
     * After calculating internally, an event occurs about the change in fees.
     * @param tx_fee The fee of transaction
     */
    public async setTransactionFee(tx_fee: Amount): Promise<Amount> {
        const tx_size = this.getEstimatedSize(this._utxos.length, 1, 0);
        const _fee_rate = JSBI.toNumber(Amount.divide(tx_fee, tx_size).value);
        if (_fee_rate < Utils.FEE_RATE) {
            this._fee_rate = Utils.FEE_RATE;
        } else {
            this._fee_rate = _fee_rate;
        }
        await this.calculate();

        return Amount.multiply(Amount.make(this._fee_rate), tx_size);
    }

    /**
     * The ratio of fees to the size of the transaction
     */
    public get fee_rate(): number {
        return this._fee_rate;
    }

    /**
     * The fee of the transaction
     */
    public get fee_tx(): Amount {
        return Amount.make(this._fee_tx);
    }

    /**
     * The fee of _payload
     */
    public get fee_payload(): Amount {
        return Amount.make(0);
    }

    /**
     * The payload of a transaction
     */
    public get payload(): Buffer {
        return Buffer.alloc(0);
    }

    /**
     * The option of fee
     */
    public get fee_option(): WalletTransactionFeeOption {
        return this._fee_option;
    }

    /**
     * The amount to be unfrozen
     */
    public get unfreeze_amount(): Amount {
        return Amount.make(this._unfreeze_amount);
    }

    /**
     * Get Sum of UTXO
     * @private
     */
    private getSumOfUTXO(): Amount {
        return this._utxos.reduce<Amount>((sum, u) => Amount.add(sum, u.amount), Amount.make(0));
    }

    /**
     * The amount of UTXO for freeze release is aggregated and fees are calculated.
     */
    protected async calculate() {
        const in_count = this._utxos.length;
        const out_count = 1;
        const sumOfUTXO = this.getSumOfUTXO();
        const tx_size = this.getEstimatedSize(in_count, out_count, 0);

        const new_fee_tx = Amount.make(this._fee_rate * tx_size);
        if (Amount.greaterThanOrEqual(sumOfUTXO, new_fee_tx)) {
            const new_unfreeze_amount = Amount.subtract(sumOfUTXO, new_fee_tx);

            if (!Amount.equal(this._fee_tx, new_fee_tx)) {
                this._fee_tx = Amount.make(new_fee_tx);
                this.dispatchEvent(Event.CHANGE_TX_FEE, this._fee_tx);
            }

            if (!Amount.equal(this._unfreeze_amount, new_unfreeze_amount)) {
                this._unfreeze_amount = Amount.make(new_unfreeze_amount);
                this.dispatchEvent(Event.CHANGE_RECEIVER);
            }
        }
    }

    /**
     * Clear all data
     * @param is_dispatch
     */
    public async clear(is_dispatch: boolean = true) {
        await this.clearUTXO();

        this._fee_rate = Utils.FEE_RATE;
        this._fee_tx = this.getEstimatedFee(1, 1, 0);
        this._unfreeze_amount = Amount.make(0);
    }

    /**
     * Check if there is a condition to create a transaction.
     */
    public validate(): IWalletResult<any> {
        if (this._utxos.length === 0)
            return {
                code: WalletResultCode.Unfreeze_NotAssignedUTXO,
                message: WalletMessage.Unfreeze_NotAssignedUTXO,
            };
        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
        };
    }

    /**
     * Build a transaction.
     */
    public buildTransaction(type: OutputType = OutputType.Payment): IWalletResult<Transaction> {
        const res_valid: IWalletResult<Transaction> = this.validate();
        if (res_valid.code !== WalletResultCode.Success) return res_valid;

        if (this.getReadOnlyAccount().length > 0) {
            return { code: WalletResultCode.ExistUnknownSecretKey, message: WalletMessage.ExistUnknownSecretKey };
        }

        const key_pair = KeyPair.random();
        const builder = new TxBuilder(key_pair);

        this._utxos.forEach((m) => {
            builder.addInput(m.utxo, m.amount, this._account.secret);
        });

        builder.addOutput(this._account.address, this._unfreeze_amount);

        let tx: Transaction;
        try {
            tx = builder.sign(type, this._fee_tx, Amount.make(0));
        } catch (e) {
            return { code: WalletResultCode.FailedBuildTransaction, message: WalletMessage.FailedBuildTransaction };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: tx,
        };
    }

    /**
     * Get the overview of the transaction built
     */
    public getTransactionOverview(): IWalletResult<ITransactionOverview> {
        const res: IWalletResult<Transaction> = this.buildTransaction();
        if (res.code !== WalletResultCode.Success || res.data === undefined)
            return {
                code: res.code,
                message: res.message,
            };

        const tx = res.data;
        const tx_hash = hashFull(tx);
        const r: ITransactionOverviewReceiver[] = [];
        for (let idx = 0; idx < tx.outputs.length; idx++) {
            r.push({
                utxo: makeUTXOKey(tx_hash, JSBI.BigInt(idx)),
                address: new PublicKey(tx.outputs[idx].lock.bytes),
                amount: tx.outputs[idx].value,
            });
        }

        const s: ITransactionOverviewSender[] = [];
        for (const input of tx.inputs) {
            const found = this._utxos.find((utxo) => Hash.equal(utxo.utxo, input.utxo));
            if (found !== undefined) {
                s.push({
                    utxo: found.utxo,
                    address: this._account.address,
                    amount: found.amount,
                });
            }
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: {
                receivers: r,
                senders: s,
                payload: this.payload,
                fee_tx: this.fee_tx,
                fee_payload: this.fee_payload,
            },
        };
    }

    /**
     * Returns accounts that require a secret key input.
     */
    public getReadOnlyAccount(): Account[] {
        if (this._account.mode === AccountMode.READ_ONLY) return [this._account];
        else return [];
    }
}
