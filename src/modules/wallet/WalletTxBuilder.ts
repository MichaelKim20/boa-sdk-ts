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
import { Scalar } from "../common/ECC";
import { Hash, hashFull, makeUTXOKey } from "../common/Hash";
import { KeyPair, PublicKey, SecretKey } from "../common/KeyPair";
import { Constant } from "../data/Constant";
import { Transaction } from "../data/Transaction";
import { TxInput } from "../data/TxInput";
import { OutputType } from "../data/TxOutput";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { LockType } from "../script/Lock";
import { TxBuilder } from "../utils/TxBuilder";
import { TxCanceller, TxCancelResultCode } from "../utils/TxCanceller";
import { TxPayloadFee } from "../utils/TxPayloadFee";
import { Utils } from "../utils/Utils";
import { Account, AccountContainer, AccountMode } from "./Account";
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
import { WalletUtils } from "./WalletUtil";

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
     * If there's an element with a public key, return true, otherwise return false.
     * @param address The public key
     */
    public exist(address: PublicKey): boolean {
        return this.items.findIndex((m) => PublicKey.equal(m.address, address)) >= 0;
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
     * If there's an element with a public key, return true, otherwise return false.
     * @param address The public key
     */
    public exist(address: PublicKey): boolean {
        return this.items.findIndex((m) => PublicKey.equal(m.account.address, address)) >= 0;
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
     * The fee of payload
     */
    protected _fee_payload: Amount;

    /**
     * The fee of freezing
     */
    protected _fee_freezing: Amount;

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
     */
    private _size_tx: number;

    /**
     * The most recent time that Stoa brought in the fee rate.
     */
    private _latest_fee_rate_time: number;

    /**
     * This value is true when the user changes the fee manually.
     */
    private _manual_fee: boolean;

    /**
     * If an event has already occurred about the fee change, this value is true.
     */
    private _already_change_fee: boolean;


    private _output_type: number;

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
        this._fee_freezing = Amount.make(0);
        this._payload = Buffer.alloc(0);
        this._output_type = OutputType.Payment;

        this._total_spendable = Amount.make(0);
        this._total_drawn = Amount.make(0);
        this._remaining = Amount.make(0);

        this._fee_rate = Utils.FEE_RATE;
        this._size_tx = Transaction.getEstimatedNumberOfBytes(1, 2, 0);
        this._fee_tx = this.getEstimatedFee(1, 2, 0);

        this._latest_fee_rate_time = 0;
        this._manual_fee = false;
        this._already_change_fee = false;

        this._client.getTransactionFee(this._size_tx).then((res) => {
            if (res.code === WalletResultCode.Success && res.data !== undefined) {
                this._fee_rate = JSBI.toNumber(Amount.divide(res.data.getFee(this._fee_option), this._size_tx).value);
                if (this._fee_rate < Utils.FEE_RATE) this._fee_rate = Utils.FEE_RATE;
                this._fee_tx = this.getEstimatedFee(1, 2, 0);
            } else {
                this._fee_rate = Utils.FEE_RATE;
            }
        });
    }

    /**
     *
     * @param value
     */
    public async setOutputType(value: OutputType) {
        this._output_type = value;
        await this.calculate();
    }

    /**
     *
     */
    public getOutputType(): number {
        return this._output_type;
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
     */
    private async _calculate(already_changed: boolean = false) {
        const now = new Date().getTime();
        if (!this._manual_fee && now - this._latest_fee_rate_time > 60 * 1000) {
            this._client.getTransactionFee(this._size_tx).then((res) => {
                if (res.code === WalletResultCode.Success && res.data !== undefined) {
                    this._fee_rate = JSBI.toNumber(
                        Amount.divide(res.data.getFee(this._fee_option), this._size_tx).value
                    );
                    if (this._fee_rate < Utils.FEE_RATE) this._fee_rate = Utils.FEE_RATE;
                } else {
                    this._fee_rate = Utils.FEE_RATE;
                }
            });
            this._latest_fee_rate_time = now;
        }

        let out_count = this.lengthReceiver;
        if (out_count === 0) out_count = 2;
        else out_count++;

        let in_count = 0;
        const total_amount = this.getTotalReceiverAmount();

        const new_fee_payload: Amount = TxPayloadFee.getFeeAmount(this._payload.length);
        const new_fee_freezing: Amount = (this._output_type === OutputType.Freeze) ? Constant.SlashPenaltyAmount : Amount.make(0);
        let changed = false;
        let new_fee_tx: Amount = Amount.make(0);

        let new_total_drawn = Amount.make(0);
        let new_remaining = Amount.make(0);
        let new_total_spendable = Amount.make(0);

        let done = false; // If you have already made the amount to be transferred, this value is true.
        for (const sender of this._senders.items) {
            const sender_old_enable = sender.enable;
            const sender_old_spendable = sender.spendable;
            const sender_old_drawn = sender.drawn;
            const sender_old_remaining = sender.remaining;

            sender.spendable = sender.account.balance.spendable;
            if (done) {
                sender.drawn = Amount.make(0);
                sender.remaining = Amount.make(0);
                sender.account.spendableUTXOProvider.giveBack(sender.utxos);
                sender.utxos.length = 0;
                sender.total_amount_utxos = Amount.make(0);
                new_total_spendable = Amount.add(new_total_spendable, sender.spendable);
            } else {
                const cs_res: { done: boolean; fee: Amount } = await this.calculateSender(
                    sender,
                    total_amount,
                    new_total_drawn,
                    in_count,
                    out_count,
                    new_fee_payload,
                    new_fee_freezing
                );
                done = cs_res.done;
                new_fee_tx = cs_res.fee;

                // It is reflected in the total value.
                if (sender.enable) {
                    in_count += sender.utxos.length;
                    new_total_drawn = Amount.add(new_total_drawn, sender.drawn);
                    new_remaining = Amount.make(sender.remaining);
                    new_total_spendable = Amount.add(new_total_spendable, sender.spendable);
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

        if (!Amount.equal(this._fee_tx, new_fee_tx) || !this._already_change_fee) {
            this._fee_tx = Amount.make(new_fee_tx);
            this.dispatchEvent(Event.CHANGE_TX_FEE, this._fee_tx);
            this._already_change_fee = true;
        }

        if (!Amount.equal(this._fee_payload, new_fee_payload)) {
            this._fee_payload = Amount.make(new_fee_payload);
            this.dispatchEvent(Event.CHANGE_PAYLOAD_FEE, this._fee_payload);
        }

        if (!Amount.equal(this._fee_freezing, new_fee_freezing)) {
            this._fee_freezing = Amount.make(new_fee_freezing);
            this.dispatchEvent(Event.CHANGE_FREEZING_FEE, this._fee_freezing);
        }
    }

    /**
     * Calculate the amount to be withdrawn from all sending accounts.
     * At this time, the number of UTXO to be used increases, and accordingly,
     * the fee increases. Therefore, the withdrawn amount gradually increases as the used UTXO increases.
     * If an error occurs during calculation, initialize the data of all callers and try again.
     */
    protected async calculate(already_changed: boolean = false) {
        const max_try_cnt = 3;
        let success = false;
        for (let cnt = 0; cnt < max_try_cnt && !success; cnt++) {
            try {
                await this._calculate(already_changed);
                success = true;
            } catch (e) {
                success = false;
            }
            if (!success) {
                if (cnt < max_try_cnt - 1) await this.initializeSenders();
                else this.dispatchEvent(Event.ERROR, WalletResultCode.SystemError);
            }
        }
    }

    /**
     * Calculate the amount to be withdrawn from one sending accounts.
     * @param sender        The sender
     * @param total_amount  The total sending amount
     * @param total_drawn   The sum of the amount to be withdrawn
     * @param in_count      The number of the transaction input
     * @param out_count     The number of the transaction output
     * @param fee_payload   The fee of payload
     * @param fee_freezing  The fee of freezing
     */
    protected async calculateSender(
        sender: WalletSender,
        total_amount: Amount,
        total_drawn: Amount,
        in_count: number,
        out_count: number,
        fee_payload: Amount,
        fee_freezing: Amount
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
            const fee_total = Amount.add(Amount.add(fee, fee_payload), fee_freezing);

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
     * Check the balance of all senders. And initialize the data.
     */
    private async initializeSenders() {
        for (const sender of this._senders.items) {
            await sender.account.checkBalance(false);
            sender.drawn = Amount.make(sender.account.balance.spendable);
            sender.utxos.length = 0;
            sender.account.spendableUTXOProvider.clear();
            const res = await sender.account.spendableUTXOProvider.getUTXO(sender.drawn);
            if (res.code === WalletResultCode.Success && res.data !== undefined) {
                sender.utxos.push(...res.data);
                sender.enable = true;
            } else {
                sender.enable = false;
            }
            sender.calculateUTXOSum();
        }
    }

    /**
     * Get the estimated fee
     * @param num_input         The number of the transaction inputs
     * @param num_output        The number of the transaction outputs
     * @param num_bytes_payload The size of the transaction _payload
     */
    protected getEstimatedFee(num_input: number, num_output: number, num_bytes_payload: number): Amount {
        return Amount.make(this._fee_rate * this.getEstimatedSize(num_input, num_output, num_bytes_payload));
    }

    /**
     * Get the estimated transaction size
     * @param num_input         The number of the transaction inputs
     * @param num_output        The number of the transaction outputs
     * @param num_bytes_payload The size of the transaction _payload
     */
    protected getEstimatedSize(num_input: number, num_output: number, num_bytes_payload: number): number {
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

        sender.drawn = Amount.make(sender.spendable);
        sender.spendable = Amount.make(sender.account.balance.spendable);
        sender.total_amount_utxos = Amount.make(0);
        sender.utxos.length = 0;
        sender.account.spendableUTXOProvider.clear();
        const res = await sender.account.spendableUTXOProvider.getUTXO(sender.drawn);
        if (res.code === WalletResultCode.Success && res.data !== undefined) {
            sender.utxos.push(...res.data);
            sender.calculateUTXOSum();
            sender.enable = true;
            await this.calculate(true);
        } else {
            sender.enable = false;
            this.dispatchEvent(Event.ERROR, res.code);
        }
        await this.calculate();
    }

    /**
     * Set the payload
     * @param payload The data to be stored in the transaction
     */
    public async setPayload(payload: Buffer) {
        this._payload = payload;
        await this.calculate();
    }

    /**
     * Set the option of transaction fee
     * @param value The option value  (High, Medium, Low)
     */
    public async setFeeOption(value: WalletTransactionFeeOption) {
        this._manual_fee = false;
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
        this._manual_fee = true;
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
        this._latest_fee_rate_time = 0;
        this._manual_fee = false;
        this._already_change_fee = false;
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
        if (this._payload.length === 0) {
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
        }

        if (this.receivers.items.some((m) => Amount.equal(m.amount, Amount.ZERO_BOA)))
            return {
                code: WalletResultCode.AmountIsZero,
                message: WalletMessage.AmountIsZero,
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
    public buildTransaction(): IWalletResult<Transaction> {
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

        let tx: Transaction;
        try {
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
            tx = builder.sign(this._output_type, this._fee_tx, this._fee_payload, this._fee_freezing);
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
                address: tx.outputs[idx].address,
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
                fee_freezing: Amount.make(this._fee_freezing),
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
        this._receiver_amount = Amount.make(amount);
        if (this._receiver_address !== undefined) {
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

export interface AccountUTXOItem {
    account: Account;
    utxo: UnspentTxOutput;
    selected: boolean;
}

export interface AccountUTXOSummaryItem {
    account: Account;
    to_be_unfrozen: Amount;
    frozen_balance: Amount;
    total_balance: Amount;
}

export class AccountUTXOSummary {
    public items: AccountUTXOSummaryItem[] = [];

    public aggregate(account: Account, utxo: UnspentTxOutput) {
        const found = this.items.find((m) => PublicKey.equal(m.account.address, account.address));
        if (found !== undefined) {
            found.to_be_unfrozen = Amount.add(found.to_be_unfrozen, utxo.amount);
        } else {
            this.items.push({
                account,
                to_be_unfrozen: Amount.make(utxo.amount),
                frozen_balance: Amount.make(account.balance.frozen),
                total_balance: Amount.make(account.balance.balance),
            });
        }
    }

    public clear() {
        this.items.length = 0;
    }
}

/**
 * Create a transaction for unfreeze.
 * This provides a function to selectively unfreezing of the added account among frozen UTXOs.
 * Among the members, `WalletUnfreezeBuilder.utxo` provides all UTXO of the added account.
 * `WalletUnfreezeBuilder.summary` is information of selected UTXOs and the balance of the account.
 */
export class WalletUnfreezeBuilder extends WalletTxBuilder {
    /**
     * Account and frozen UTXO's list.
     */
    private readonly _utxos: AccountUTXOItem[];

    /**
     * Summary to be unfrozen by account.
     */
    private readonly _summary: AccountUTXOSummary;

    /**
     * The amount to be unfrozen, The amount excluding the fee from the frozen amount
     */
    private _unfreeze_amount: Amount;

    /**
     * Constructor
     * @param client The wallet client to request
     */
    constructor(client: WalletClient) {
        super(client);
        this._unfreeze_amount = Amount.make(0);
        this._utxos = [];
        this._summary = new AccountUTXOSummary();
    }

    /**
     * Add a sender
     * @param account The account of the sender to be added
     */
    public async addSender(account: Account) {
        const found = this._senders.items.find((value) => PublicKey.equal(value.account.address, account.address));
        if (found === undefined) {
            this._senders.items.forEach((m) =>
                m.account.removeEventListener(Event.CHANGE_BALANCE, this.onAccountChangeBalance, this)
            );
            this._senders.clear();
            const sender = this._senders.add(account, Amount.make(0));
            if (sender !== undefined) {
                if (!sender.account.balance.enable) await sender.account.checkBalance(false);
                sender.drawn = Amount.make(sender.account.balance.frozen);
                sender.utxos.length = 0;
                sender.account.addEventListener(Event.CHANGE_BALANCE, this.onAccountChangeBalance, this);
                sender.account.frozenUTXOProvider.clear();
                const res = await sender.account.frozenUTXOProvider.getUTXO(sender.drawn);
                if (res.code === WalletResultCode.Success && res.data !== undefined) {
                    sender.utxos.push(...res.data);
                    sender.calculateUTXOSum();
                    sender.enable = true;
                    this._utxos.push(
                        ...sender.utxos.map((u) => {
                            return { account: sender.account, utxo: u, selected: false };
                        })
                    );
                    await this.calculate();
                    this.dispatchEvent(Event.CHANGE_UTXO_ITEM);
                    this.dispatchEvent(Event.CHANGE_SENDER);
                } else {
                    this.dispatchEvent(Event.ERROR, res.code);
                }
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
            const filtered = this._utxos.filter((m) => !PublicKey.equal(m.account.address, sender.account.address));
            this._utxos.length = 0;
            this._utxos.push(...filtered);
            await this.calculate();
            this.dispatchEvent(Event.CHANGE_UTXO_ITEM);
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
            this._utxos.length = 0;
            if (is_dispatch) {
                await this.calculate();
            }
            this.dispatchEvent(Event.CHANGE_UTXO_ITEM);
            this.dispatchEvent(Event.CHANGE_SENDER);
        }
    }

    private getSelectedUTXO(): AccountUTXOItem[] {
        return this._utxos.filter((m) => m.selected);
    }

    private makeSummary() {
        this._summary.clear();
        this.getSelectedUTXO().forEach((m) => this._summary.aggregate(m.account, m.utxo));
    }

    public async selectUTXO(utxo: Hash, value: boolean) {
        const found = this._utxos.find((m) => Hash.equal(m.utxo.utxo, utxo));
        if (found !== undefined) {
            if (found.selected !== value) {
                found.selected = value;
                this.makeSummary();
                await this.calculate();
                this.dispatchEvent(Event.CHANGE_UTXO_SELECTION, found);
                this.dispatchEvent(Event.CHANGE_UTXO_SUMMARY);
            }
        }
    }

    /**
     * Get the estimated fee
     * @param num_input         The number of the transaction inputs
     * @param num_output        The number of the transaction outputs
     * @param num_bytes_payload The size of the transaction _payload
     */
    protected getEstimatedFee(num_input: number, num_output: number, num_bytes_payload: number): Amount {
        return Amount.make(this._fee_rate * this.getEstimatedSize(num_input, num_output, num_bytes_payload));
    }

    /**
     * Get the estimated transaction size
     * @param num_input         The number of the transaction inputs
     * @param num_output        The number of the transaction outputs
     * @param num_bytes_payload The size of the transaction _payload
     */
    protected getEstimatedSize(num_input: number, num_output: number, num_bytes_payload: number): number {
        return Transaction.getEstimatedNumberOfBytes(
            Math.max(num_input, 1),
            Math.max(num_output, 1),
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

        sender.drawn = Amount.make(sender.account.balance.frozen);
        sender.spendable = Amount.make(sender.account.balance.spendable);
        sender.total_amount_utxos = Amount.make(0);
        sender.utxos.length = 0;
        sender.account.frozenUTXOProvider.clear();
        const res = await sender.account.frozenUTXOProvider.getUTXO(sender.drawn);
        if (res.code === WalletResultCode.Success && res.data !== undefined) {
            sender.utxos.push(...res.data);
            sender.calculateUTXOSum();
            sender.enable = true;
            await this.calculate();
        } else {
            sender.enable = false;
            this.dispatchEvent(Event.ERROR, res.code);
        }
        await this.calculate();
    }

    /**
     * Set the option of transaction fee
     * @param value The option value  (High, Medium, Low)
     */
    public async setFeeOption(value: WalletTransactionFeeOption) {
        const selected = this.getSelectedUTXO();
        const tx_size = this.getEstimatedSize(selected.length, 1, 0);
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
        const selected = this.getSelectedUTXO();
        const tx_size = this.getEstimatedSize(selected.length, 1, 0);
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
     * The fee of _payload
     */
    public get fee_payload(): Amount {
        return Amount.make(0);
    }

    /**
     * Set the payload
     * @deprecated
     */
    public async setPayload() {
        // Do not use
    }

    /**
     * The payload of a transaction
     */
    public get payload(): Buffer {
        return Buffer.alloc(0);
    }

    /**
     * Account and frozen UTXO's list.
     */
    public get utxos(): AccountUTXOItem[] {
        return this._utxos;
    }

    /**
     * Summary to be unfrozen by account.
     */
    public get summary(): AccountUTXOSummary {
        return this._summary;
    }

    /**
     * The amount to be unfrozen
     */
    public get unfreeze_amount(): Amount {
        return Amount.make(this._unfreeze_amount);
    }

    /**
     * The amount of UTXO for freeze release is aggregated and fees are calculated.
     */
    protected async calculate() {
        const selected = this.getSelectedUTXO();
        const in_count = selected.length;
        const out_count = 1;
        const sumOfUTXO = selected.reduce<Amount>((sum, u) => Amount.add(sum, u.utxo.amount), Amount.make(0));

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
        await this.clearReceiver(is_dispatch);
        await this.clearSender(is_dispatch);

        this._fee_rate = Utils.FEE_RATE;
        this._fee_tx = this.getEstimatedFee(1, 1, 0);
        this._fee_payload = Amount.make(0);
        this._total_drawn = Amount.make(0);
        this._remaining = Amount.make(0);
        this._payload = Buffer.alloc(0);
        this._unfreeze_amount = Amount.make(0);
    }
    /**
     * Check if there is a condition to create a transaction.
     */
    public validate(): IWalletResult<any> {
        const selected = this.getSelectedUTXO();
        if (selected.length === 0)
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
    public buildTransaction(): IWalletResult<Transaction> {
        const res_valid: IWalletResult<Transaction> = this.validate();
        if (res_valid.code !== WalletResultCode.Success) return res_valid;

        if (this.getReadOnlyAccount().length > 0) {
            return { code: WalletResultCode.ExistUnknownSecretKey, message: WalletMessage.ExistUnknownSecretKey };
        }

        if (this.lengthSender === 0) {
            return { code: WalletResultCode.NotAssignedSender, message: WalletMessage.NotAssignedSender };
        }

        const account = this._senders.items[0].account;
        let keypair: KeyPair;
        if (account.secret !== undefined) {
            keypair = KeyPair.fromSeed(account.secret);
        } else {
            return { code: WalletResultCode.ExistUnknownSecretKey, message: WalletMessage.ExistUnknownSecretKey };
        }

        let tx: Transaction;
        try {
            const selected = this.getSelectedUTXO();
            const builder = new TxBuilder(keypair);
            selected.forEach((m) => {
                builder.addInput(m.utxo.utxo, m.utxo.amount, m.account.secret);
            });
            builder.addOutput(keypair.address, this._unfreeze_amount);
            tx = builder.sign(OutputType.Payment, this._fee_tx, Amount.make(0));
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
                address: tx.outputs[idx].address,
                amount: tx.outputs[idx].value,
            });
        }

        const s: ITransactionOverviewSender[] = [];
        for (const input of tx.inputs) {
            const found = this._utxos.find((m) => Hash.equal(m.utxo.utxo, input.utxo));
            if (found !== undefined) {
                s.push({
                    utxo: found.utxo.utxo,
                    address: found.account.address,
                    amount: found.utxo.amount,
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
                fee_freezing: Amount.make(0),
            },
        };
    }
}

/**
 * Create a transaction to cancel the pending transaction.
 */
export class WalletCancelBuilder extends WalletTxBuilder {
    private _accounts: AccountContainer;
    private _tx: Transaction | undefined;
    private _utxos: UnspentTxOutput[] = [];

    /**
     * Constructor
     * @param client The wallet client to request
     * @param accounts The accounts
     */
    constructor(client: WalletClient, accounts: AccountContainer) {
        super(client);
        this._accounts = accounts;
    }

    /**
     * Set up a pending transaction
     * @param tx The pending transaction
     */
    public async setTransaction(tx: Transaction): Promise<IWalletResult<any>> {
        this._tx = tx;
        const res = await this.makeUTXO();
        if (res.code !== WalletResultCode.Success) {
            return { code: res.code, message: res.message };
        }
        await this.makeSender();
        return { code: WalletResultCode.Success, message: WalletMessage.Success };
    }

    /**
     * Set the pending transaction hash
     * @param tx_hash The pending transaction hash
     */
    public async setTransactionHash(tx_hash: Hash): Promise<IWalletResult<any>> {
        try {
            const res = await this._client.getPendingTransaction(tx_hash);
            if (res.code !== WalletResultCode.Success || res.data === undefined) {
                return { code: res.code, message: res.message };
            }
            if (res.data.isCoinbase()) {
                return {
                    code: WalletResultCode.Cancel_NotAllowCoinbase,
                    message: WalletMessage.Cancel_NotAllowCoinbase,
                };
            }
            return this.setTransaction(res.data);
        } catch (e) {
            return {
                code: WalletResultCode.FailedRequestPendingTransaction,
                message: WalletMessage.FailedRequestPendingTransaction,
            };
        }
    }

    /**
     * Find UTXO information used in a set transaction.
     */
    private async makeUTXO(): Promise<IWalletResult<any>> {
        if (this._tx === undefined) {
            return {
                code: WalletResultCode.Cancel_NotAssignedTx,
                message: WalletMessage.Cancel_NotAssignedTx,
            };
        }

        // Requests the information of the UTXO used in the transaction.
        try {
            const utxo_res = await this._client.getUTXOInfo(this._tx.inputs.map((m) => m.utxo));
            if (utxo_res.code !== WalletResultCode.Success || utxo_res.data === undefined) {
                return { code: WalletResultCode.FailedRequestUTXO, message: WalletMessage.FailedRequestUTXO };
            }
            this._utxos.length = 0;
            this._utxos.push(...utxo_res.data);
            return { code: WalletResultCode.Success, message: WalletMessage.Success };
        } catch (e) {
            return { code: WalletResultCode.FailedRequestUTXO, message: WalletMessage.FailedRequestUTXO };
        }
    }

    /**
     * Extract the account needed for the cancellation transaction from the account container
     * and register it as a Sender.
     * If it cannot be found in the account container, create an account without a secret key.
     */
    private async makeSender() {
        await this.clearSender(false);
        this._utxos
            .filter((m) => m.lock_type === LockType.Key)
            .map((u) => new PublicKey(Buffer.from(u.lock_bytes, "base64")))
            .forEach((address) => {
                if (!this.senders.exist(address)) {
                    let account = this._accounts.findByPublicKey(address);
                    if (account === undefined)
                        account = this._accounts.add(WalletUtils.getShortAddress(address), address, true, false);
                    if (account !== undefined) this.addSender(account, Amount.make(0));
                }
            });
    }

    protected async calculate(already_changed: boolean = false): Promise<void> {
        // Do not use
    }

    /**
     * Set the payload
     * @deprecated
     */
    public async setPayload() {
        // Do not use
    }

    public get tx(): Transaction | undefined {
        return this._tx;
    }

    /**
     * The payload of a transaction
     */
    public get payload(): Buffer {
        return Buffer.alloc(0);
    }

    /**
     * Clear all data
     * @param is_dispatch
     */
    public async clear(is_dispatch: boolean = true) {
        await this.clearReceiver(is_dispatch);
        await this.clearSender(is_dispatch);

        this._payload = Buffer.alloc(0);
        this._tx = undefined;
        this._utxos.length = 0;
    }

    /**
     * Determine whether the set transaction is a cancellation transaction.
     * If it is made for cancellation of another transaction, return true. Otherwise, return false.
     */
    public isCancelTx(): boolean {
        if (this._tx !== undefined) {
            for (const sender of this.senders.items) {
                if (
                    this._tx.outputs.find((output) => PublicKey.equal(output.address, sender.account.address)) ===
                    undefined
                )
                    return false;
            }
            for (const output of this._tx.outputs) {
                if (
                    this.senders.items.find((sender) => PublicKey.equal(output.address, sender.account.address)) ===
                    undefined
                )
                    return false;
            }
        } else {
            return false;
        }
        return true;
    }

    /**
     * Check if there is a condition to create a transaction.
     */
    public validate(): IWalletResult<any> {
        if (this._tx === undefined)
            return {
                code: WalletResultCode.Cancel_NotAssignedTx,
                message: WalletMessage.Cancel_NotAssignedTx,
            };

        const key_pairs = this.senders.items.map((m) => {
            return new KeyPair(
                m.account.address,
                m.account.secret !== undefined ? m.account.secret : new SecretKey(Scalar.random())
            );
        });

        // Create a cancellation transaction.
        const canceller = new TxCanceller(this._tx, this._utxos, key_pairs);
        const res = canceller.build();

        // Check for errors that occurred during the cancellation transaction creation process.
        switch (res.code) {
            case TxCancelResultCode.Cancel_NotAllowUnfreezing:
                return {
                    code: WalletResultCode.Cancel_NotAllowUnfreezing,
                    message: WalletMessage.Cancel_NotAllowUnfreezing,
                };
            case TxCancelResultCode.Cancel_InvalidTransaction:
                return {
                    code: WalletResultCode.Cancel_InvalidTransaction,
                    message: WalletMessage.Cancel_InvalidTransaction,
                };
            case TxCancelResultCode.Cancel_NotFoundUTXO:
                return {
                    code: WalletResultCode.Cancel_NotFoundUTXO,
                    message: WalletMessage.Cancel_NotFoundUTXO,
                };
            case TxCancelResultCode.Cancel_UnsupportedLockType:
                return {
                    code: WalletResultCode.Cancel_UnsupportedLockType,
                    message: WalletMessage.Cancel_UnsupportedLockType,
                };
            case TxCancelResultCode.Cancel_NotFoundKey:
                return {
                    code: WalletResultCode.Cancel_NotFoundKey,
                    message: WalletMessage.Cancel_NotFoundKey,
                };
            case TxCancelResultCode.Cancel_NotEnoughFee:
                return {
                    code: WalletResultCode.Cancel_NotEnoughFee,
                    message: WalletMessage.Cancel_NotEnoughFee,
                };
            case TxCancelResultCode.FailedBuildTransaction:
                return {
                    code: WalletResultCode.FailedBuildTransaction,
                    message: WalletMessage.FailedBuildTransaction,
                };
        }
        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
        };
    }

    /**
     * Build a transaction.
     */
    public buildTransaction(): IWalletResult<Transaction> {
        if (this._tx === undefined)
            return {
                code: WalletResultCode.Cancel_NotAssignedTx,
                message: WalletMessage.Cancel_NotAssignedTx,
            };
        const res_valid: IWalletResult<Transaction> = this.validate();
        if (res_valid.code !== WalletResultCode.Success) return res_valid;

        if (this.getReadOnlyAccount().length > 0) {
            return { code: WalletResultCode.ExistUnknownSecretKey, message: WalletMessage.ExistUnknownSecretKey };
        }

        try {
            const key_pairs: KeyPair[] = [];
            for (const sender of this.senders.items) {
                if (sender.account.secret !== undefined) key_pairs.push(KeyPair.fromSeed(sender.account.secret));
            }

            // Create a cancellation transaction.
            const canceller = new TxCanceller(this._tx, this._utxos, key_pairs);
            const res = canceller.build();

            // If there are no errors, send
            if (res.code === TxCancelResultCode.Success && res.tx !== undefined) {
                return {
                    code: WalletResultCode.Success,
                    message: WalletMessage.Success,
                    data: res.tx,
                };
            } else {
                return {
                    code: WalletResultCode.UnknownError,
                    message: WalletMessage.UnknownError,
                };
            }
        } catch (e) {
            return { code: WalletResultCode.FailedBuildTransaction, message: WalletMessage.FailedBuildTransaction };
        }
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
                address: tx.outputs[idx].address,
                amount: tx.outputs[idx].value,
            });
        }

        const s: ITransactionOverviewSender[] = [];
        for (const input of tx.inputs) {
            const found = this._utxos.find((m) => Hash.equal(m.utxo, input.utxo));
            if (found !== undefined) {
                s.push({
                    utxo: found.utxo,
                    address: new PublicKey(Buffer.from(found.lock_bytes, "base64")),
                    amount: found.amount,
                });
            }
        }

        const sum_s = s.reduce<Amount>((prev, value) => Amount.add(prev, value.amount), Amount.make(0));
        const sum_r = r.reduce<Amount>((prev, value) => Amount.add(prev, value.amount), Amount.make(0));
        const fee = Amount.subtract(sum_s, sum_r);

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: {
                receivers: r,
                senders: s,
                payload: this.payload,
                fee_tx: fee,
                fee_payload: this.fee_payload,
                fee_freezing: Amount.make(0),
            },
        };
    }

    /**
     * Get the overview of the original transaction
     */
    public getOriginalTransactionOverview(): IWalletResult<ITransactionOverview> {
        if (this._tx === undefined) {
            return {
                code: WalletResultCode.Cancel_NotAssignedTx,
                message: WalletMessage.Cancel_NotAssignedTx,
            };
        }
        const tx = this._tx;
        const tx_hash = hashFull(tx);
        const r: ITransactionOverviewReceiver[] = [];
        for (let idx = 0; idx < tx.outputs.length; idx++) {
            r.push({
                utxo: makeUTXOKey(tx_hash, JSBI.BigInt(idx)),
                address: tx.outputs[idx].address,
                amount: tx.outputs[idx].value,
            });
        }

        const s: ITransactionOverviewSender[] = [];
        for (const input of tx.inputs) {
            const found = this._utxos.find((m) => Hash.equal(m.utxo, input.utxo));
            if (found !== undefined) {
                s.push({
                    utxo: found.utxo,
                    address: new PublicKey(Buffer.from(found.lock_bytes, "base64")),
                    amount: found.amount,
                });
            }
        }

        const sum_s = s.reduce<Amount>((prev, value) => Amount.add(prev, value.amount), Amount.make(0));
        const sum_r = r.reduce<Amount>((prev, value) => Amount.add(prev, value.amount), Amount.make(0));
        const fee = Amount.subtract(sum_s, sum_r);
        const fee_payload = TxPayloadFee.getFeeAmount(this._tx.payload.length);
        const fee_freezing = tx.isFreeze() ? Constant.SlashPenaltyAmount : Amount.make(0);
        let fee_tx: Amount;
        if (Amount.greaterThanOrEqual(fee, fee_payload)) {
            const fee_tx_freezing = Amount.subtract(fee, fee_payload);
            if (Amount.greaterThanOrEqual(fee_tx_freezing, fee_freezing)) {
                fee_tx = Amount.subtract(fee_tx_freezing, fee_freezing);
            } else {
                fee_tx = Amount.make(0);
            }
        } else {
            fee_tx = Amount.make(0);
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: {
                receivers: r,
                senders: s,
                payload: this._tx.payload,
                fee_tx,
                fee_payload,
                fee_freezing,
            },
        };
    }
}
