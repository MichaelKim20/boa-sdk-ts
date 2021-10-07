/*******************************************************************************

    Contains a class to manage multiple accounts.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { PublicKey, SecretKey } from "../common/KeyPair";
import { Event, EventDispatcher } from "./EventDispatcher";
import { DefaultWalletOption, IWalletOption, WalletResultCode } from "./Types";
import { WalletBalance } from "./WalletBalance";
import { WalletClient } from "./WalletClient";

/**
 * Account Mode
 */
export enum AccountMode {
    READ_ONLY = 0,
    SUDO = 1,
}

/**
 * Class with account address, secret key and balance.
 */
export class Account extends EventDispatcher {
    private readonly owner: AccountContainer;
    private readonly _name: string;
    private readonly _address: PublicKey;
    private _secret?: SecretKey;
    private _balance: WalletBalance;

    /**
     * Constructor
     * @param owner The instance of AccountContainer
     * @param name The name of account
     * @param key The public key or secret key of account
     */
    constructor(owner: AccountContainer, name: string, key: PublicKey | SecretKey) {
        super();
        this.owner = owner;
        this._name = name;
        if (key instanceof PublicKey) {
            this._address = key;
            this._secret = undefined;
        } else {
            this._secret = key;
            this._address = new PublicKey(this._secret.scalar.toPoint());
        }
        this._balance = new WalletBalance(this._address.toString());
    }

    /**
     * The name of account
     */
    public get name(): string {
        return this._name;
    }

    /**
     * The public key of account
     */
    public get address(): PublicKey {
        return this._address;
    }

    /**
     * The secret key of account
     */
    public get secret(): SecretKey | undefined {
        return this._secret;
    }

    /**
     * The balance of account
     */
    public get balance(): WalletBalance {
        return this._balance;
    }

    /**
     * The mode of account
     */
    public get mode(): AccountMode {
        return this.secret !== undefined ? AccountMode.SUDO : AccountMode.READ_ONLY;
    }

    /**
     * Set the secret key.
     * @param value The secret key to be set
     */
    public setSecret(value: SecretKey): boolean {
        const pk = new PublicKey(value.scalar.toPoint());
        if (pk.toString() === this.address.toString()) {
            this._secret = value;
            this.dispatchEvent(Event.CHANGE, this);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Check the balance.
     */
    public async checkBalance(): Promise<void> {
        const res = await this.owner.client.getBalance(this.address);
        if (res.code === WalletResultCode.Success && res.data !== undefined) {
            this._balance = new WalletBalance(
                this._address.toString(),
                Amount.make(res.data.balance),
                Amount.make(res.data.spendable),
                Amount.make(res.data.frozen),
                Amount.make(res.data.locked),
                true
            );
            this.dispatchEvent(Event.CHANGE_BALANCE, this);
        }
    }
}

/**
 * Class to manage multiple accounts.
 */
export class AccountContainer extends EventDispatcher {
    private readonly _items: Account[];
    private _balance: WalletBalance;
    private _selected_index: number;

    /**
     * The option of wallet
     * @private
     */
    private option: IWalletOption;

    /**
     * The instance of WalletClient
     */
    public client: WalletClient;

    /**
     * Constructor
     */
    constructor(option: IWalletOption = DefaultWalletOption()) {
        super();
        this.option = option;
        this._items = [];
        this._balance = new WalletBalance();
        this._selected_index = -1;
        this.client = new WalletClient(this.option);
    }

    /**
     * The array where the account is saved.
     */
    public get items(): Account[] {
        return this._items;
    }

    /**
     * The balance of all accounts
     */
    public get balance(): WalletBalance {
        return this._balance;
    }

    /**
     * The getter of selected_index
     */
    public get selected_index(): number {
        return this._selected_index;
    }

    /**
     * The setter of selected_index
     */
    public set selected_index(value: number) {
        if (value < 0 || value >= this._items.length) return;
        this._selected_index = value;
        this.dispatchEvent(Event.CHANGE_SELECTED, this.selected_index, this._items[this.selected_index]);
    }

    /**
     * The getter of selected_account
     */
    public get selected_account(): Account | null {
        if (this._selected_index < 0) return null;
        if (this._selected_index >= this._items.length) return null;
        return this._items[this._selected_index];
    }

    /**
     * Add one account.
     * @param name The name of the account
     * @param key  The public key or secret key of the account
     */
    public add(name: string, key: PublicKey | SecretKey): Account | undefined {
        let account = this._items.find((m) => m.name === name);
        if (account !== undefined) return undefined;

        if (key instanceof PublicKey) {
            account = this._items.find((m) => Buffer.compare(m.address.data, key.data) === 0);
            if (account !== undefined) return undefined;
        }

        if (key instanceof SecretKey) {
            const pk = new PublicKey(key.scalar.toPoint());
            account = this._items.find((m) => {
                if (m.secret !== undefined) {
                    return Buffer.compare(m.secret.data, key.data) === 0;
                } else {
                    return Buffer.compare(m.address.data, pk.data) === 0;
                }
            });
            if (account !== undefined) return undefined;
        }

        account = new Account(this, name, key);
        this._items.push(account);
        this.attachEventListener(account);

        this.dispatchEvent(Event.ADDED, account);
        this.dispatchEvent(Event.CHANGE);

        if (this.selected_index < 0) {
            this._selected_index = 0;
            this.dispatchEvent(Event.CHANGE_SELECTED, this.selected_index, this._items[this.selected_index]);
        }
        return account;
    }

    /**
     * Remove one account.
     * @param name Name of the account to be removed.
     */
    public remove(name: string): Account | undefined {
        const findIdx = this._items.findIndex((m) => m.name === name);
        if (findIdx < 0) return undefined;
        const account = this._items[findIdx];
        this._items.splice(findIdx, 1);
        this.detachEventListener(account);

        this.dispatchEvent(Event.REMOVED, account);
        this.dispatchEvent(Event.CHANGE);

        if (findIdx <= this.selected_index) {
            if (this._items.length === 0) {
                this._selected_index = -1;
                this.dispatchEvent(Event.CHANGE_SELECTED, this.selected_index, null);
            } else {
                this.dispatchEvent(Event.CHANGE_SELECTED, this.selected_index, this._items[this.selected_index]);
            }
        }

        return account;
    }

    /**
     * Find the account with the name or address of the account.
     * @param key The name or address of the account.
     */
    public find(key: string): Account | undefined {
        let account = this._items.find((m) => m.name === key);
        if (account !== undefined) return account;

        if (PublicKey.validate(key) === "") {
            const public_key = new PublicKey(key);
            account = this._items.find((m) => Buffer.compare(m.address.data, public_key.data) === 0);
            if (account !== undefined) return account;
        }

        if (SecretKey.validate(key) === "") {
            const secret_key = new SecretKey(key);
            const public_key = new PublicKey(secret_key.scalar.toPoint());
            account = this._items.find((m) => {
                if (m.secret !== undefined) {
                    return Buffer.compare(m.secret.data, secret_key.data) === 0;
                } else {
                    return Buffer.compare(m.address.data, public_key.data) === 0;
                }
            });
            if (account !== undefined) return account;
        } else {
            account = this._items.find((m) => m.secret !== undefined && m.secret.toString(false) === key);
            if (account !== undefined) return account;
        }

        return undefined;
    }

    /**
     * Clear all accounts
     */
    public clear(): void {
        this._items.forEach((m) => {
            this.dispatchEvent(Event.REMOVED, m);
            this.detachEventListener(m);
        });
        this._selected_index = -1;
        this._items.length = 0;
        this.dispatchEvent(Event.CHANGE);
        this.dispatchEvent(Event.CHANGE_SELECTED, this.selected_index, null);
    }

    /**
     * Return the length
     */
    public get length(): number {
        return this._items.length;
    }

    /**
     * Only the public address of the account is extracted and returned to the array.
     */
    public get addresses(): PublicKey[] {
        return this._items.map((m) => new PublicKey(m.address.point));
    }

    /**
     * Only the name of the account is extracted and returned to the array.
     */
    public get names(): string[] {
        return this._items.map((m) => m.name);
    }

    /**
     * Return only accounts that don't have a secret key.
     */
    public get readonly_accounts(): Account[] {
        return this._items.filter((m) => m.mode === AccountMode.READ_ONLY);
    }

    /**
     * Return only accounts that have a secret key.
     */
    public get sudo_accounts(): Account[] {
        return this._items.filter((m) => m.mode === AccountMode.SUDO);
    }

    /**
     * Return the number of accounts with the secret key.
     */
    public get sudo_length(): number {
        return this._items.reduce<number>((prev, m) => {
            return prev + (m.mode === AccountMode.SUDO ? 1 : 0);
        }, 0);
    }

    /**
     * Check the balance of all accounts.
     */
    public checkBalance(): void {
        this._items.forEach((m) => m.checkBalance());
    }

    /**
     * Attach the event listener
     * @param account
     */
    public attachEventListener(account: Account) {
        account.addEventListener(Event.CHANGE_BALANCE, this.onAccountChangeBalance, this);
    }

    /**
     * Detach the event listener
     * @param account
     */
    public detachEventListener(account: Account) {
        account.removeEventListener(Event.CHANGE_BALANCE, this.onAccountChangeBalance, this);
    }

    /**
     * The event listener on changed the balance
     * @param ev The event type
     * @param acc The account with changed balance
     */
    public onAccountChangeBalance(ev: Event, acc: Account) {
        let balance = Amount.make(0);
        let spendable = Amount.make(0);
        let frozen = Amount.make(0);
        let locked = Amount.make(0);

        for (const elem of this._items) {
            if (!elem.balance.enable) continue;
            balance = Amount.add(balance, elem.balance.balance);
            spendable = Amount.add(spendable, elem.balance.spendable);
            frozen = Amount.add(frozen, elem.balance.frozen);
            locked = Amount.add(locked, elem.balance.locked);
        }
        this._balance = new WalletBalance("", balance, spendable, frozen, locked, true);
        this.dispatchEvent(Event.CHANGE_BALANCE, this);
    }
}
