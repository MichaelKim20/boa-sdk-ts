/*******************************************************************************

    Contains a class for watching new blocks and new transactions of account

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { PublicKey } from "../common/KeyPair";
import { Account, AccountContainer } from "./Account";
import { Event, EventDispatcher } from "./EventDispatcher";
import { WalletResultCode } from "./Types";
import { WalletClient } from "./WalletClient";

import JSBI from "jsbi";
import { io, Socket } from "socket.io-client";

/**
 * It monitors whether new blocks has been created.
 * It monitors whether transactions have occurred in accounts registered in Wallet in real time.
 */
export class WalletWatcher extends EventDispatcher {
    public accounts: AccountContainer;
    public client: WalletClient;
    private interval: any;
    private readonly duration: number;
    private height = 0;
    private socket: Socket;

    /**
     * Constructor
     * @param accounts  The account container of the wallet
     * @param client    The instance of WalletClient
     * @param duration  The milliseconds that pulling data.
     */
    constructor(accounts: AccountContainer, client: WalletClient, duration: number = 10000) {
        super();
        this.accounts = accounts;
        this.client = client;
        this.interval = undefined;
        this.duration = duration;
        this.socket = io(client.getOption().stoaEndpoint);
        this.socket.on("new_block", this.onNewBlock.bind(this));
        this.socket.on("new_tx_acc", this.onNewTransaction.bind(this));
        this.initialize();
    }

    /**
     * It is the tasks to be done at the beginning of the creation of this class. This is called from the constructor.
     */
    public initialize() {
        this.accounts.addEventListener(Event.ADDED, this.onChangedAccount, this);
        this.accounts.addEventListener(Event.REMOVED, this.onChangedAccount, this);

        this.socket.emit("subscribe", { address: "block" });
        for (const account of this.accounts.items) {
            this.subscribe(account.address);
        }

        this.startPulling();
    }

    /**
     * It is the tasks to be done before they are destroyed. It should be called when an instance of it is no longer needed.
     */
    public finalize() {
        this.accounts.removeEventListener(Event.ADDED, this.onChangedAccount, this);
        this.accounts.removeEventListener(Event.REMOVED, this.onChangedAccount, this);

        this.socket.emit("unsubscribe", { address: "block" });
        for (const account of this.accounts.items) {
            this.unsubscribe(account.address);
        }
        this.socket.disconnect();

        this.stopPulling();
    }

    /**
     * This is called when Wallet's account is added or deleted.
     */
    private onChangedAccount(type: string, account: Account) {
        if (type === Event.ADDED) {
            this.subscribe(account.address);
        } else if (type === Event.REMOVED) {
            this.unsubscribe(account.address);
        }
    }

    /**
     * Subscribe to Stoa to monitor new transactions.
     * @param address The address to monitor.
     */
    public subscribe(address: PublicKey) {
        this.socket.emit("subscribe", { address: address.toString() });
    }

    /**
     * Unsubscribed to Stoa to avoid monitoring new transactions
     * @param address The address to monitor.
     */
    public unsubscribe(address: PublicKey) {
        this.socket.emit("unsubscribe", { address: address.toString() });
    }

    /**
     * It is a message handler that delivers a new block on the server.
     * @param data { height: number }
     * @private
     */
    private onNewBlock(data: { height: number }) {
        if (data === undefined || data.height === undefined) return;

        if (data.height > this.height) {
            this.height = data.height;
            this.accounts.checkBalance();
            this.dispatchEvent(Event.NEW_BLOCK, this.height);
        }
    }

    /**
     * It is a message handler that delivers a new transaction occurs on the server.
     * @param data { address: string }
     * @private
     */
    private onNewTransaction(data: { address: string }) {
        if (data === undefined || data.address === undefined) return;

        const account = this.accounts.find(data.address);
        if (account !== undefined) {
            account.checkBalance();
            this.dispatchEvent(Event.NEW_TRANSACTION, account);
        }
    }

    public startPulling() {
        if (this.interval !== undefined) clearInterval(this.interval);
        this.interval = setInterval(this.pulling.bind(this), this.duration);
    }

    public async pulling() {
        try {
            const res = await this.client.getBlockHeight();
            if (res.code === WalletResultCode.Success && res.data !== undefined) {
                const height = JSBI.toNumber(res.data);
                if (height > this.height) {
                    this.height = height;
                    this.accounts.checkBalance();
                }
            }
        } catch (e) {
            //
        }

        try {
            this.socket.emit("ping", "{}");
        } catch (e) {
            this.reconnect();
        }
    }

    public stopPulling() {
        if (this.interval !== undefined) clearInterval(this.interval);
        this.interval = undefined;
    }

    public reconnect() {
        try {
            this.socket.disconnect();
        } catch (e) {
            //
        }
        this.socket = io(this.client.getOption().stoaEndpoint);
        this.socket.on("new_block", this.onNewBlock.bind(this));
        this.socket.on("new_tx_acc", this.onNewTransaction.bind(this));
        this.socket.emit("subscribe", { address: "block" });
        for (const account of this.accounts.items) {
            this.subscribe(account.address);
        }
    }
}
