/*******************************************************************************

    Contains the class used to control the flash node,
    for example creating invoices and paying invoices.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Scalar } from "../common/ECC";
import { Hash } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";
import { handleNetworkError } from "../net/error/ErrorTypes";
import { Request } from "../net/Request";
import { ChannelConfig } from "./data/ChannelConfig";
import { ChannelInfo } from "./data/ChannelInfo";
import { Invoice } from "./data/Invoice";
import { IFlashControl } from "./interface/IFlashControl";
import { IFlashClientListener } from "./interface/IFlashListener";
import { ChannelState } from "./type/ChannelState";
import { ErrorCode } from "./type/ErrorCode";

import { BeginCloseRequest } from "./request/BeginCloseRequest";
import { ChangeFeeRequest } from "./request/ChangeFeeRequest";
import { CreateNewInvoiceRequest } from "./request/CreateNewInvoiceRequest";
import { OpenNewChannelRequest } from "./request/OpenNewChannelRequest";
import { PayInvoiceRequest } from "./request/PayInvoiceRequest";

import { AxiosResponse } from "axios";
import { io, Socket } from "socket.io-client";
import URI from "urijs";

/**
 * The class used to control the flash node,
 * for creating invoices and paying invoices.
 */
export class FlashClient implements IFlashControl {
    /**
     * The flash layer control server URL
     */
    public readonly flash_ctrl_url: URI;

    /**
     * The flash layer event server URL
     */
    public readonly flash_event_url: URI;

    /**
     * The web socket for flash layer event
     */
    public socket_client: Socket;

    /**
     * The listener for flash layer event
     */
    private flash_listener: IFlashClientListener;

    /**
     * constructor
     * @param flash_ctrl_url The flash layer control server URL
     * @param flash_event_url The flash layer event server URL
     * @param listener The listener to assign
     */
    constructor(flash_ctrl_url: string, flash_event_url: string, listener: IFlashClientListener) {
        this.flash_ctrl_url = URI(flash_ctrl_url);
        this.flash_event_url = URI(flash_event_url);
        this.flash_listener = listener;
        this.socket_client = io(this.flash_event_url.toString());
        this.socket_client.on("connect", () => {
            this.flash_listener.onConnect(this.socket_client);
        });
        this.processEvent();
    }

    /**
     * Start the Flash node. This starts internal timers such as the
     * periodic name registry timer.
     */
    start(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url).directory("start").toString();

            Request.post(url)
                .then((response: AxiosResponse) => {
                    resolve();
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Register the given secret key as being managed by the Flash node.
     * @param secret the secret to register
     */
    registerKey(secret: Scalar): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url).directory("register_key").toString();

            Request.post(url, { secret })
                .then((response: AxiosResponse) => {
                    resolve();
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Get the list of managed channels.
     * @param keys the keys to look up. If empty then all managed channels will
     * be returned.
     * @returns the list of all managed channels by this Flash node for the
     * given public keys (if any)
     */
    getManagedChannels(keys: PublicKey[]): Promise<ChannelConfig[]> {
        return new Promise<ChannelConfig[]>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url)
                .directory("managed_channels")
                .setSearch("keys", JSON.stringify(keys.map((m) => m.toString())))
                .toString();

            Request.get(url)
                .then((response: AxiosResponse) => {
                    resolve();
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Get the list of managed channels.
     * @param chan_ids the channel keys to look up. If empty then all managed
     * channel info will be returned.
     * @returns the list of all managed channels by this Flash node for the
     * given public keys (if any)
     */
    getChannelInfo(chan_ids: Hash[]): Promise<ChannelInfo[]> {
        return new Promise<ChannelInfo[]>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url)
                .directory("channel_info")
                .setSearch("chan_ids", JSON.stringify(chan_ids))
                .toString();

            Request.get(url)
                .then((response: AxiosResponse) => {
                    resolve();
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     *  Schedule opening a new channel with another flash node.
     *  If this funding_utxo is already used, an error is returned.
     *  Otherwise, the Listener will receive a notification through
     *  the onChannelNotify() API at a later point whenever the channel
     *  is accepted / rejected by the counter-party.
     *
     * @param data The data to request
     * @returns The channel ID, or an error if this funding UTXO is
     * already used for another pending / open channel.
     */
    public openNewChannel(data: OpenNewChannelRequest): Promise<Hash> {
        return new Promise<Hash>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url).directory("open_new_channel").toString();

            Request.post(url, data)
                .then((response: AxiosResponse) => {
                    if (response.data && response.data.error && response.data.message && response.data.value) {
                        if (response.data.error === ErrorCode.None) {
                            resolve(new Hash(response.data.value));
                        } else {
                            reject(new FlashLayerError(response.data.error, response.data.message));
                        }
                    } else {
                        reject(new FlashLayerError(ErrorCode.Unknown, "An unknown error has occurred"));
                    }
                    resolve(response.data);
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Begin a collaborative closure of a channel with the counter-party
     * for the given channel ID.
     *
     * @param data The data to request
     * @returns true if this channel ID exists and may be closed,
     * else an error
     */
    public beginCollaborativeClose(data: BeginCloseRequest): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url).directory("begin_collaborative_close").toString();

            Request.post(url, data)
                .then((response: AxiosResponse) => {
                    if (response.data && response.data.error && response.data.message && response.data.value) {
                        if (response.data.error === ErrorCode.None) {
                            resolve(response.data.value);
                        } else {
                            reject(new FlashLayerError(response.data.error, response.data.message));
                        }
                    } else {
                        reject(new FlashLayerError(ErrorCode.Unknown, "An unknown error has occurred"));
                    }
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * If the counter-party rejects a collaborative closure,
     * the wallet may initiate a unilateral closure of the channel.
     *
     * This will publish the latest update transaction to the blockchain,
     * and after the time lock expires the settlement transaction will be
     * published too.
     *
     * @param data The data to request
     * @returns true if this channel ID exists and may be closed,
     * else an error
     */
    public beginUnilateralClose(data: BeginCloseRequest): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url).directory("begin_unilateral_close").toString();

            Request.post(url, data)
                .then((response: AxiosResponse) => {
                    if (response.data && response.data.error && response.data.message && response.data.value) {
                        if (response.data.error === ErrorCode.None) {
                            resolve(response.data.value);
                        } else {
                            reject(new FlashLayerError(response.data.error, response.data.message));
                        }
                    } else {
                        reject(new FlashLayerError(ErrorCode.Unknown, "An unknown error has occurred"));
                    }
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Create an invoice that can be paid by another party. A preimage is
     * shared through a secure channel to the party which will pay the invoice.
     * The hash of the preimage is used in the contract, which is then shared
     * across zero or more channel hops. The invoice payer must reveal their
     * preimage to prove.
     *
     * @param data The data to request
     * @returns the invoice, or an error if this public key is not recognized
     */
    public createNewInvoice(data: CreateNewInvoiceRequest): Promise<Invoice> {
        return new Promise<Invoice>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url).directory("create_new_invoice").toString();

            Request.post(url, data)
                .then((response: AxiosResponse) => {
                    if (response.data && response.data.error && response.data.message && response.data.value) {
                        if (response.data.error === ErrorCode.None) {
                            resolve(Invoice.reviver("", response.data.value));
                        } else {
                            reject(new FlashLayerError(response.data.error, response.data.message));
                        }
                    } else {
                        reject(new FlashLayerError(ErrorCode.Unknown, "An unknown error has occurred"));
                    }
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Attempt to find a payment path for the invoice and pay for the
     * invoice.
     *
     * If a payment path cannot be found, or if the payment fails along
     * the payment path then the listener will be notified through the
     * `onPaymentFailure` endpoint.
     *
     * If the payment succeeds the `onPaymentSuccess` endpoint will be
     * called on the listener.
     *
     * @param data The data to request
     */
    public payInvoice(data: PayInvoiceRequest): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url).directory("pay_invoice").toString();

            Request.post(url, data)
                .then((response: AxiosResponse) => {
                    resolve();
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    /**
     * Broadcast a channel update to change the fees
     * @param data The data to request
     */
    public changeFees(data: ChangeFeeRequest): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const url = URI(this.flash_ctrl_url).directory("change_fees").toString();

            Request.post(url, data)
                .then((response: AxiosResponse) => {
                    resolve();
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }

    private processEvent() {
        this.socket_client.on("ChannelOpen", (data) => {
            if (data.pk && data.chan_conf) {
                const pk = new PublicKey(data.pk);
                const chan_conf = ChannelConfig.reviver("", data.chan_conf);
                this.flash_listener.onChannelOpen(pk, chan_conf);
            }
        });
        this.socket_client.on("ChannelNotify", (data) => {
            if (data.pk && data.chan_id && data.state && data.error) {
                const pk = new PublicKey(data.pk);
                const chan_id = new Hash(data.chan_id);
                const state = data.state as ChannelState;
                const error = data.error as ErrorCode;
                this.flash_listener.onChannelNotify(pk, chan_id, state, error);
            }
        });
        this.socket_client.on("onPaymentSuccess", (data) => {
            if (data.pk && data.invoice) {
                const pk = new PublicKey(data.pk);
                const invoice = Invoice.reviver("", data.invoice);
                this.flash_listener.onPaymentSuccess(pk, invoice);
            }
        });
        this.socket_client.on("PaymentFailure", (data) => {
            if (data.pk && data.invoice && data.error) {
                const pk = new PublicKey(data.pk);
                const invoice = Invoice.reviver("", data.invoice);
                const error = data.error as ErrorCode;
                this.flash_listener.onPaymentFailure(pk, invoice, error);
            }
        });
    }
}

class FlashLayerError extends Error {
    constructor(private code: number, message?: string) {
        super(message);
        this.name = `FlashLayerError`;
    }
}
