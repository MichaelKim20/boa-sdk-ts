/*******************************************************************************

    Contains a class that enables integrated management of necessary classes
    in a wallet with multiple accounts.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { AccountContainer } from "./Account";
import { IWalletEndpoint } from "./Types";
import { WalletClient } from "./WalletClient";
import { WalletTxBuilder } from "./WalletTxBuilder";
import { WalletWatcher } from "./WalletWatcher";

/**
 * It is a Wallet with Multi Accounts
 * It is a class that enables integrated management of necessary classes in a wallet with multiple accounts.
 */
export class WalletMA {
    /**
     * The instance of the WalletClient
     */
    public client: WalletClient;

    /**
     * The instance of the AccountContainer
     */
    public accounts: AccountContainer;

    /**
     * The instance of the WalletWatcher
     */
    public watcher: WalletWatcher;

    /**
     * The instances of the WalletTxBuilder
     * One instance must be shared with each other on several screens.
     */
    public builders: Map<string, WalletTxBuilder>;

    /**
     * Constructor
     * @param endpoint The endpoints of wallet
     */
    constructor(endpoint: IWalletEndpoint) {
        this.client = new WalletClient(endpoint);
        this.accounts = new AccountContainer(this.client);
        this.watcher = new WalletWatcher(this.accounts, this.client, 10000);
        this.builders = new Map<string, WalletTxBuilder>();
        this.watcher.initialize();
    }

    /**
     * Set the endpoints of wallet, Agora's endpoint & Stoa's endpoint
     * @param endpoint The endpoints of wallet
     */
    public setEndpoint(endpoint: IWalletEndpoint) {
        this.client.setEndpoint(endpoint);
    }

    /**
     * Get the endpoints of wallet
     * @return The endpoints of wallet
     */
    public getEndpoint(): IWalletEndpoint {
        return this.client.getEndpoint();
    }

    private static _instance: WalletMA | null = null;

    /**
     * This function always allows access to only one object.
     */
    public static instance(): WalletMA {
        if (WalletMA._instance === null) {
            WalletMA._instance = new WalletMA(WalletMA.default_endpoint);
        }

        return WalletMA._instance;
    }

    private static default_endpoint: IWalletEndpoint = {
        agora: "http://127.0.0.1:2826",
        stoa: "http://127.0.0.1:3836",
    };

    /**
     * It is necessary to preset the options required when an object is created.
     * @param default_endpoint The endpoint of default
     */
    public static setDefaultEndpoint(default_endpoint: IWalletEndpoint) {
        WalletMA.default_endpoint = default_endpoint;
    }
}
