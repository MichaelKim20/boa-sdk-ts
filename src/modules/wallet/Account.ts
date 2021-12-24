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
import { BalanceType } from "../net/response/Types";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { Event, EventDispatcher } from "./EventDispatcher";
import { IWalletResult, WalletMessage, WalletResultCode } from "./Types";
import { WalletBalance } from "./WalletBalance";
import { WalletClient } from "./WalletClient";
import { WalletUTXOProvider } from "./WalletUTXOProvider";

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
     * The instance of UTXOProvider for the normal UTXO
     */
    public spendableUTXOProvider: WalletUTXOProvider;

    /**
     * The instance of UTXOProvider for the frozen UTXO
     */
    public frozenUTXOProvider: WalletUTXOProvider;

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

        this.spendableUTXOProvider = new WalletUTXOProvider(this._address, owner.client, BalanceType.spendable);
        this.frozenUTXOProvider = new WalletUTXOProvider(this._address, owner.client, BalanceType.frozen);
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
    public async checkBalance(is_dispatch: boolean = true): Promise<void> {
        const res = await this.owner.client.getBalance(this.address);
        if (res.code === WalletResultCode.Success && res.data !== undefined) {
            if (
                !Amount.equal(this._balance.balance, res.data.balance) ||
                !Amount.equal(this._balance.spendable, res.data.spendable) ||
                !Amount.equal(this._balance.frozen, res.data.frozen) ||
                !Amount.equal(this._balance.locked, res.data.locked) ||
                !this._balance.enable
            ) {
                this._balance = new WalletBalance(
                    this._address.toString(),
                    Amount.make(res.data.balance),
                    Amount.make(res.data.spendable),
                    Amount.make(res.data.frozen),
                    Amount.make(res.data.locked),
                    true
                );
                if (is_dispatch) this.dispatchEvent(Event.CHANGE_BALANCE, this);
                else this.owner.onAccountChangeBalance(Event.CHANGE_BALANCE, this);
            }
        }
    }

    /**
     * Returns an array of all frozen UTXOs for addresses already set
     */
    public async getFrozenUTXOs(): Promise<IWalletResult<UnspentTxOutput[]>> {
        let frozenUtxos: UnspentTxOutput[];
        try {
            await this.checkBalance();
            this.frozenUTXOProvider.clear();
            const utxo_res = await this.frozenUTXOProvider.getUTXO(this.balance.frozen);
            if (utxo_res.code !== WalletResultCode.Success || utxo_res.data === undefined) {
                return { code: utxo_res.code, message: utxo_res.message };
            }
            frozenUtxos = utxo_res.data;
        } catch (e) {
            return { code: WalletResultCode.FailedRequestUTXO, message: WalletMessage.FailedRequestUTXO };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: frozenUtxos,
        };
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
     * The instance of WalletClient
     */
    public client: WalletClient;

    /**
     * Constructor
     */
    constructor(client: WalletClient) {
        super();
        this._items = [];
        this._balance = new WalletBalance();
        this._selected_index = -1;
        this.client = client;
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
        this.dispatchEvent(Event.CHANGE_SELECTED, this.selected_index);
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
     * The getter of un_selected_accounts
     */
    public get un_select_accounts(): Account[] | null {
        if (this._selected_index < 0) return null;
        if (this._items.length <= 1) return null;
        const selAccount = this.selected_account;
        if (selAccount){
            return this._items.filter((m) => !PublicKey.equal(m.address, selAccount.address));
        } else {
            return null;
        }
    }

    /**
     * Add one account.
     * @param name The name of the account
     * @param key  The public key or secret key of the account
     * @param is_dispatch Set whether an event for changes will occur or not.
     * @param change_select Set whether an event will occur or not. The default value is true.
     */
    public add(
        name: string,
        key: PublicKey | SecretKey,
        is_dispatch: boolean = true,
        change_select: boolean = true
    ): Account | undefined {
        let account = this._items.find((m) => m.name === name);
        if (account !== undefined) return undefined;

        if (key instanceof PublicKey) {
            account = this._items.find((m) => PublicKey.equal(m.address, key));
            if (account !== undefined) return undefined;
        }

        if (key instanceof SecretKey) {
            const pk = new PublicKey(key.scalar.toPoint());
            account = this._items.find((m) => {
                if (m.secret !== undefined) {
                    return SecretKey.equal(m.secret, key);
                } else {
                    return PublicKey.equal(m.address, pk);
                }
            });
            if (account !== undefined) return undefined;
        }

        let changed = false;
        account = new Account(this, name, key);
        this._items.push(account);
        this.attachEventListener(account);

        if (this.selected_index < 0) {
            this._selected_index = 0;
            changed = true;
        }

        if (change_select) {
            this._selected_index = this._items.length - 1;
            changed = true;
        }

        if (is_dispatch) this.dispatchEvent(Event.ADDED, account);
        if (is_dispatch) this.dispatchEvent(Event.CHANGE);

        if (changed) {
            if (is_dispatch) this.dispatchEvent(Event.CHANGE_SELECTED, this.selected_index);
        }
        return account;
    }

    /**
     * Remove one account.
     * @param name Name of the account to be removed.
     * @param is_dispatch Set whether an event for changes will occur or not.
     */
    public remove(name: string, is_dispatch: boolean = true): Account | undefined {
        const findIdx = this._items.findIndex((m) => m.name === name);
        if (findIdx < 0) return undefined;
        const account = this._items[findIdx];
        this._items.splice(findIdx, 1);
        this.detachEventListener(account);

        let change_selected = false;
        if (findIdx <= this.selected_index) {
            if (this._items.length === 0) {
                this._selected_index = -1;
                change_selected = true;
            } else {
                if (this.selected_index > 0) {
                    this.selected_index--;
                    change_selected = true;
                }
            }
        }

        if (is_dispatch) this.dispatchEvent(Event.REMOVED, account);
        if (is_dispatch) this.dispatchEvent(Event.CHANGE);

        if (change_selected) {
            if (is_dispatch) this.dispatchEvent(Event.CHANGE_SELECTED, this.selected_index);
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
            account = this._items.find((m) => PublicKey.equal(m.address, public_key));
            if (account !== undefined) return account;
        }

        if (SecretKey.validate(key) === "") {
            const secret_key = new SecretKey(key);
            const public_key = new PublicKey(secret_key.scalar.toPoint());
            account = this._items.find((m) => {
                if (m.secret !== undefined) {
                    return SecretKey.equal(m.secret, secret_key);
                } else {
                    return PublicKey.equal(m.address, public_key);
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
     * Find the account by name
     * @param name The account name
     */
    public findByName(name: string): Account | undefined {
        return this._items.find((m) => m.name === name);
    }

    /**
     * Find the account by public key
     * @param pk The public key
     */
    public findByPublicKey(pk: PublicKey): Account | undefined {
        return this._items.find((m) => PublicKey.equal(m.address, pk));
    }

    /**
     * Find the account by secret key
     * @param sk The secret key
     */
    public findBySecretKey(sk: SecretKey): Account | undefined {
        const pk = new PublicKey(sk.scalar.toPoint());
        return this._items.find((m) => {
            if (m.secret !== undefined) {
                return SecretKey.equal(m.secret, sk);
            } else {
                return PublicKey.equal(m.address, pk);
            }
        });
    }

    /**
     * Clear all accounts
     * @param is_dispatch Set whether an event for changes will occur or not.
     */
    public clear(is_dispatch: boolean = true): void {
        this._items.forEach((m) => {
            if (is_dispatch) this.dispatchEvent(Event.REMOVED, m);
            this.detachEventListener(m);
        });
        this._selected_index = -1;
        this._items.length = 0;
        if (is_dispatch) {
            this.dispatchEvent(Event.CHANGE);
            this.dispatchEvent(Event.CHANGE_SELECTED, this.selected_index);
        }
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
    public checkBalance(calculate: boolean = true) {
        this._items.forEach((m) => m.checkBalance());
        if (calculate) {
            this.calculateTotalBalance();
            this.dispatchEvent(Event.CHANGE_BALANCE, this);
        }
    }

    /**
     * Attach the event listener
     * @param account
     */
    public attachEventListener(account: Account) {
        account.addEventListener(Event.CHANGE_BALANCE, this.onAccountChangeBalance, this);
        account.addEventListener(Event.CHANGE, this.onAccountChangeSecretKey, this);
    }

    /**
     * Detach the event listener
     * @param account
     */
    public detachEventListener(account: Account) {
        account.removeEventListener(Event.CHANGE_BALANCE, this.onAccountChangeBalance, this);
        account.removeEventListener(Event.CHANGE, this.onAccountChangeSecretKey, this);
    }

    /**
     * The event listener on changed the balance
     * @param type The event type
     * @param account The account with changed balance
     */
    public onAccountChangeBalance(type: string, account: Account) {
        this.calculateTotalBalance();
        this.dispatchEvent(Event.CHANGE_BALANCE, this);
    }

    /**
     * Sum all account balances.
     */
    private calculateTotalBalance() {
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
    }

    /**
     * The event listener on changed the secret key
     * @param type The event type
     * @param account The account with changed the secret key
     */
    public onAccountChangeSecretKey(type: string, account: Account) {
        this.dispatchEvent(Event.CHANGE_SECRET_KEY, account);
    }

    /**
     * Get a string to save it. The secret key is not saved, but only the public key is saved.
     */
    public toString(): string {
        return JSON.stringify(
            this._items.map((m) => {
                return {
                    name: m.name,
                    address: m.address.toString(),
                };
            })
        );
    }

    /**
     * Restores data stored in a string.
     * @param data
     */
    public fromString(data: string): boolean {
        try {
            const list: any[] = JSON.parse(data);
            this._selected_index = -1;
            this._items.length = 0;
            for (const elem of list) {
                if (elem.name !== undefined && elem.address !== undefined) {
                    const account = new Account(this, elem.name, new PublicKey(elem.address));
                    this._items.push(account);
                    this.attachEventListener(account);
                    this.dispatchEvent(Event.ADDED, account);
                }
            }
            if (this._items.length > 0) this._selected_index = 0;
        } catch (e) {
            return false;
        }
        return true;
    }
}
