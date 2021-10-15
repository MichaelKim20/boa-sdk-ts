/*******************************************************************************

    Contains the type of data provided by the Stoa API

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

/**
 * The interface of the transaction history
 */
export interface ITxHistory {
    header: ITxHistoryHeader;
    items: ITxHistoryItem[];
}

/**
 * The interface of the transaction history element
 */
export interface ITxHistoryHeader {
    /**
     * Address, Public key
     */
    address: string;

    /**
     * The maximum size that can be obtained from one query, default is 10
     */
    page_size: number;

    /**
     * The number on the page, this value begins with 1, default is 1
     */
    page: number;

    /**
     * The number of the last page
     */
    total_page: number;

    /**
     * The type of transaction to query.
     * This can include multiple types.
     * Transaction types include "inbound", "outbound", "freeze", "payload".
     * The "inbound" is an increased transaction of funds at the address.
     * The "outbound" is a transaction with reduced funds at the address.
     * Users can select only "inbound", "outbound".
     * The "freeze", "payload" are always included.
     * default is "inbound,outbound,freeze,payload"
     */
    type?: string[];

    /**
     * The start date of the range of dates to look up.
     */
    begin_date?: number;

    /**
     * The end date of the range of dates to look up.
     */
    end_date?: number;

    /**
     * This is used when users want to look up only specific
     * address of their counterparts.
     * Peer is the withdrawal address in the inbound transaction and
     * a deposit address in the outbound transaction
     */
    peer?: string;
}

/**
 * The interface of the transaction history item
 */
export interface ITxHistoryItem {
    /**
     * The transaction type of wallet ('inbound', 'outbound', 'freeze', 'payload')
     */
    display_tx_type: string;

    /**
     * Address, Public key
     */
    address: string;

    /**
     * The address that sent (or received) the funds
     */
    peer: string;

    /**
     * The number of the peer
     */
    peer_count: number;

    /**
     * Block height
     */
    height: string;

    /**
     * Transaction time
     */
    time: number;

    /**
     * Transaction hash
     */
    tx_hash: string;

    /**
     * Transaction type
     */
    tx_type: string;

    /**
     * Amount
     */
    amount: string;

    /**
     * Block height at which the output of the transaction becomes available
     */
    unlock_height: string;

    /**
     * Time at which the output of the transaction becomes available
     */
    unlock_time: number;

    /**
     * Transaction fee
     */
    tx_fee: number;

    /**
     * Transaction size
     */
    tx_size: number;
}

/**
 * The interface of the transactions history element
 */
export interface ITxHistoryElement {
    /**
     * The transaction type of wallet ('inbound', 'outbound', 'freeze', 'payload')
     */
    display_tx_type: string;

    /**
     * Address, Public key
     */
    address: string;

    /**
     * The address that sent (or received) the funds
     */
    peer: string;

    /**
     * The number of the peer
     */
    peer_count: number;

    /**
     * Block height
     */
    height: string;

    /**
     * Transaction time
     */
    time: number;

    /**
     * Transaction hash
     */
    tx_hash: string;

    /**
     * Transaction type
     */
    tx_type: string;

    /**
     * Amount
     */
    amount: string;

    /**
     * Block height at which the output of the transaction becomes available
     */
    unlock_height: string;

    /**
     * Time at which the output of the transaction becomes available
     */
    unlock_time: number;
}

/**
 * The interface of the transaction overview
 */
export interface ITxOverview {
    /**
     * Block height
     */
    height: string;

    /**
     * Transaction time
     */
    time: number;

    /**
     * Transaction hash
     */
    tx_hash: string;

    /**
     * Transaction type
     */
    tx_type: string;

    /**
     * Block height at which the output of the transaction becomes available
     */
    unlock_height: string;

    /**
     * Time at which the output of the transaction becomes available
     */
    unlock_time: number;

    /**
     * The transaction data payload
     */
    payload: string;

    /**
     * The address and amount of the output associated with the transaction input
     */
    senders: ITxOverviewElement[];

    /**
     * The address and amount of transaction output
     */
    receivers: ITxOverviewElement[];

    /**
     * Transaction fee
     */
    fee: string;
}

/**
 * The interface of the transaction overview element
 */
export interface ITxOverviewElement {
    /**
     * Address, Public key
     */
    address: string;

    /**
     * Amount
     */
    amount: string;

    /**
     * The hash of UTXO
     */
    utxo: string;
}

/**
 * The interface of the transaction detail
 */
export interface ITxDetail {
    /**
     * Block height
     */
    height: string;

    /**
     * Transaction time
     */
    time: number;

    /**
     * Transaction hash
     */
    tx_hash: string;

    /**
     * Transaction type
     */
    tx_type: string;

    /**
     * Block height at which the output of the transaction becomes available
     */
    unlock_height: string;

    /**
     * Time at which the output of the transaction becomes available
     */
    unlock_time: number;

    /**
     * The transaction data payload
     */
    payload: string;

    /**
     * The address and amount of the output associated with the transaction input
     */
    senders: ITxDetailElement[];

    /**
     * The address and amount of transaction output
     */
    receivers: ITxDetailElement[];

    /**
     * Total fee
     */
    fee: string;

    /**
     * Transaction fee
     */
    tx_fee: string;

    /**
     * Payload fee
     */
    payload_fee: string;
}

/**
 * The interface of the transaction detail element
 */
export interface ITxDetailElement {
    /**
     * Address, Public key
     */
    address: string;

    /**
     * Amount
     */
    amount: string;

    /**
     * The hash of UTXO
     */
    utxo: string;
}

/**
 * The interface of the pending transactions
 */
export interface IPendingTxs {
    tx_hash: string;
    submission_time: number;
    address: string;
    amount: string;
    fee: string;
}

/**
 * The interface of the SPV status
 */
export interface ISPVStatus {
    /**
     * True or false
     */
    result: boolean;

    /**
     * The message
     */
    message: string;
}

/**
 * The type of balance
 */
export enum BalanceType {
    spendable = 0,
    frozen = 1,
    locked = 2,
}
