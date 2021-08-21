/*******************************************************************************

    Contains a interface of Flash Listener

    Copyright:
        Copyright (c) 021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Socket } from "socket.io-client";
import { Hash } from "../../common/Hash";
import { PublicKey } from "../../common/KeyPair";
import { ChannelConfig } from "../data/ChannelConfig";
import { Invoice } from "../data/Invoice";
import { ChannelState } from "../type/ChannelState";
import { ErrorCode } from "../type/ErrorCode";

export interface IFlashClientListener {
    onConnect(socket: Socket): void;
    onChannelOpen(pk: PublicKey, chan_conf: ChannelConfig): void;
    onChannelNotify(pk: PublicKey, chan_id: Hash, state: ChannelState, error: ErrorCode): void;
    onPaymentSuccess(pk: PublicKey, invoice: Invoice): void;
    onPaymentFailure(pk: PublicKey, invoice: Invoice, error: ErrorCode): void;
}
