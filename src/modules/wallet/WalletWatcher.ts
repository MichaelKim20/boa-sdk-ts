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
 * Definition of events that occur when balance changes.
 */
export interface IWalletWatcherEvent {
    /**
     * Address where the balance has changed.
     */
    address: string;

    /**
     * Transaction hash
     */
    tx_hash: string;

    /**
     * "pending" or "confirm"
     */
    type: string;
}

/**
 * It monitors whether new blocks has been created.
 * It monitors whether transactions have occurred in accounts registered in Wallet in real time.
 */
export class WalletWatcher extends EventDispatcher {
    public accounts: AccountContainer;
    public client: WalletClient;
    private pullingTimer: any;
    private pingTimer: any;
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
        this.pullingTimer = undefined;
        this.pingTimer = undefined;
        this.duration = duration;
        this.socket = io(this.client.getEndpoint().stoa);
    }

    /**
     * It is the tasks to be done at the beginning of the creation of this class. This is called from the constructor.
     */
    public initialize() {
        this.socket.on("new_tx_acc", this.onNewTransaction.bind(this));

        for (const account of this.accounts.items) {
            this.subscribe(account.address);
        }
        this.accounts.addEventListener(Event.ADDED, this.onChangedAccount, this);
        this.accounts.addEventListener(Event.REMOVED, this.onChangedAccount, this);

        this.startPulling();

        if (this.pingTimer !== undefined) clearInterval(this.pingTimer);
        this.pingTimer = setInterval(this.ping.bind(this), 30000);
    }

    /**
     * It is the tasks to be done before they are destroyed. It should be called when an instance of it is no longer needed.
     */
    public finalize() {
        if (this.pingTimer !== undefined) clearInterval(this.pingTimer);

        this.accounts.removeEventListener(Event.ADDED, this.onChangedAccount, this);
        this.accounts.removeEventListener(Event.REMOVED, this.onChangedAccount, this);

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
     * It is a message handler that delivers a new transaction occurs on the server.
     * @param data { address: string; tx_hash: string; type: string  }
     * @private
     */
    private onNewTransaction(data: IWalletWatcherEvent) {
        if (data === undefined || data.address === undefined) return;

        const account = this.accounts.find(data.address);
        if (account !== undefined) {
            account.checkBalance();
            this.dispatchEvent(Event.NEW_TRANSACTION, data);
        }
    }

    /**
     * Start pulling the block height
     */
    public startPulling() {
        if (this.pullingTimer !== undefined) clearInterval(this.pullingTimer);
        this.pullingTimer = setInterval(this.pulling.bind(this), this.duration);
    }

    /**
     * Periodically pull in case of failure in real-time notification.
     */
    public async pulling() {
        try {
            const res = await this.client.getBlockHeight();
            if (res.code === WalletResultCode.Success && res.data !== undefined) {
                const height = JSBI.toNumber(res.data);
                if (height > this.height) {
                    this.height = height;
                    this.accounts.checkBalance(false);
                    this.dispatchEvent(Event.NEW_BLOCK, this.height);
                }
            }
        } catch (e) {
            //
        }
    }

    /**
     * Stop pulling the block height
     */
    public stopPulling() {
        if (this.pullingTimer !== undefined) clearInterval(this.pullingTimer);
        this.pullingTimer = undefined;
    }

    /**
     * Periodically notify the server that the client is alive.
     * The server forcibly shuts down if it does not reach for one minute.
     */
    public ping() {
        try {
            this.socket.emit("ping", "");
        } catch (e) {
            this.reconnect();
        }
    }

    /**
     * When the connection is terminated, the connection is re-connected.
     */
    public reconnect() {
        try {
            this.socket.disconnect();
        } catch (e) {
            //
        }
        this.socket = io(this.client.getEndpoint().stoa);
        this.socket.on(
            "connect",
            (() => {
                this.initialize();
            }).bind(this)
        );
    }
}
