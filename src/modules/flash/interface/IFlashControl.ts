/*******************************************************************************

    The interface used to control the flash node,
    for creating invoices and paying invoices.

    Copyright:
        Copyright (c) 021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Scalar } from "../../common/ECC";
import { Hash } from "../../common/Hash";
import { PublicKey } from "../../common/KeyPair";
import { ChannelConfig } from "../data/ChannelConfig";
import { ChannelInfo } from "../data/ChannelInfo";
import { Invoice } from "../data/Invoice";

import { BeginCloseRequest } from "../request/BeginCloseRequest";
import { ChangeFeeRequest } from "../request/ChangeFeeRequest";
import { CreateNewInvoiceRequest } from "../request/CreateNewInvoiceRequest";
import { OpenNewChannelRequest } from "../request/OpenNewChannelRequest";
import { PayInvoiceRequest } from "../request/PayInvoiceRequest";

/**
 * The interface used to control the flash node,
 * for creating invoices and paying invoices.
 */
export interface IFlashControl {
    start(): Promise<void>;
    registerKey(secret: Scalar): Promise<void>;
    getManagedChannels(keys: PublicKey[]): Promise<ChannelConfig[]>;
    getChannelInfo(chan_ids: Hash[]): Promise<ChannelInfo[]>;
    openNewChannel(data: OpenNewChannelRequest): Promise<Hash>;
    beginCollaborativeClose(data: BeginCloseRequest): Promise<boolean>;
    beginUnilateralClose(data: BeginCloseRequest): Promise<boolean>;
    createNewInvoice(data: CreateNewInvoiceRequest): Promise<Invoice>;
    payInvoice(data: PayInvoiceRequest): Promise<void>;
    changeFees(data: ChangeFeeRequest): Promise<void>;
}
