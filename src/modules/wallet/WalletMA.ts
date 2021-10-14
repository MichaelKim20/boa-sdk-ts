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
 * It is a class that enables integrated management of necessary classes in a wallet with multiple accounts.
 */
export class WalletMA {
    /**
     * The instance of the WalletClient
     * @private
     */
    private _client: WalletClient;

    /**
     * The instance of the AccountContainer
     * @private
     */
    private _accounts: AccountContainer;

    /**
     * The instance of the WalletWatcher
     * @private
     */
    private _watcher: WalletWatcher;

    /**
     * The instances of the WalletTxBuilder
     * One instance must be shared with each other on several screens.
     * @private
     */
    public builders: Map<string, WalletTxBuilder>;

    /**
     * The endpoints of wallet
     * @private
     */
    private _endpoint: IWalletEndpoint;

    /**
     * Constructor
     * @param endpoint The endpoints of wallet
     */
    constructor(endpoint: IWalletEndpoint) {
        this._endpoint = endpoint;
        this._client = new WalletClient(this._endpoint);
        this._accounts = new AccountContainer(this._client);
        this._watcher = new WalletWatcher(this._accounts, this._client, 10000);
        this.builders = new Map<string, WalletTxBuilder>();
        this.watcher.initialize();
    }

    /**
     * The instance of the WalletClient
     */
    public get client() {
        return this._client;
    }

    /**
     * The instance of the AccountContainer
     */
    public get accounts() {
        return this._accounts;
    }

    /**
     * The instance of the WalletWatcher
     */
    public get watcher() {
        return this._watcher;
    }

    /**
     * Set the endpoints of wallet, Agora's endpoint & Stoa's endpoint
     * @param endpoint    The endpoints of wallet
     */
    public setEndpoint(endpoint: IWalletEndpoint) {
        this._endpoint = endpoint;
        this._client = new WalletClient(this._endpoint);
    }

    /**
     * Get the endpoints of wallet
     * @return The endpoints of wallet
     */
    public getEndpoint(): IWalletEndpoint {
        return this._endpoint;
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
