/*******************************************************************************

    Contains the types used in Wallet.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { Hash } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";

/**
 * A constant that defines the option of a fee.
 */
export enum WalletTransactionFeeOption {
    High,
    Medium,
    Low,
}

/**
 * When using the wallet function, it is a constant that defines the processing results.
 */
export enum WalletResultCode {
    Success = 0,
    FailedAccessToAgora = 1001,
    FailedAccessToStoa = 1002,
    FailedRequestHeight = 1100,
    FailedRequestBalance = 1101,
    FailedRequestPendingTransaction = 1103,
    FailedRequestUTXO = 1104,
    FailedRequestTxFee = 1105,
    FailedRequest = 1106,
    NotExistReceiver = 1200,
    NotEnoughAmount = 1201,
    ExistNotFrozenUTXO = 1202,
    NotAvailableAmount = 1300,
    CoinbaseCanNotCancel = 1500,
    InvalidTransaction = 1501,
    UnsupportedUnfreezing = 1502,
    NotFoundUTXO = 1503,
    UnsupportedLockType = 1504,
    NotFoundKey = 1505,
    NotEnoughFee = 1506,
    NotAssignedReceiver = 1600,
    NotAssignedReceiverAmount = 1601,
    NotAssignedSender = 1601,
    InsufficientAmount = 1602,
    FailedBuildTransaction = 1800,
    FailedSendTx = 2000,
    UnknownError = 9000,
}

/**
 * The interface of receiver
 */
export interface IWalletReceiver {
    /**
     * The address of the receiver
     */
    address: PublicKey;

    /**
     * The amount to transfer
     */
    amount: Amount;
}

/**
 * The interface of sender
 */
export interface IWalletSender {
    /**
     * The address of the receiver
     */
    address: PublicKey;

    /**
     * The amount to be spent
     */
    drawn: Amount;

    /**
     * The amount not enough.
     */
    remaining: Amount;

    /**
     * The amount that can be used in the account.
     */
    spendable: Amount;
}
/**
 * This is the return value that is delivered after processing the wallet function.
 */
export interface IWalletResult<T> {
    /**
     * The result code
     */
    code: WalletResultCode;

    /**
     * The result message
     */
    message: string;

    /**
     * The result data
     */
    data?: T;
}

/**
 * An interface that defines the options used in a wallet.
 */
export interface IWalletOption {
    /**
     * The address of Agora
     */
    agoraEndpoint: string;

    /**
     * The address of Stoa
     */
    stoaEndpoint: string;

    /**
     * Fee option to be used when transferring
     */
    fee: WalletTransactionFeeOption;
}

export function DefaultWalletOption(): IWalletOption {
    return {
        agoraEndpoint: "http://127.0.0.1:2826",
        stoaEndpoint: "http://127.0.0.1:3836",
        fee: WalletTransactionFeeOption.Medium,
    };
}

export enum WalletMessage {
    Success = "Success",
    FailedAccessToAgora = "Failed access to Agora.",
    FailedAccessToStoa = "Failed access to Stoa.",
    NotEnoughAmount = "Not enough amount.",
    NotExistReceiver = "Not exists any receiver.",
    ExistNotFrozenUTXO = "UTXO not frozen exists.",
    CoinbaseCanNotCancel = "Transactions of type Coinbase cannot be canceled.",
    UnknownError = "Unknown error occurred.",
    NotAssignedReceiver = "Not assigned any receiver",
    NotAssignedReceiverAmount = "Not assigned any receiver amount",
    InsufficientAmount = "Insufficient amount",
}

export interface ITransactionOverviewReceiver {
    utxo: Hash;
    address: PublicKey;
    amount: Amount;
}

export interface ITransactionOverviewSender {
    utxo: Hash;
    address: PublicKey;
    amount: Amount;
}

export interface ITransactionOverview {
    receivers: ITransactionOverviewReceiver[];
    senders: ITransactionOverviewSender[];
    payload: Buffer;
    fee_tx: Amount;
    fee_payload: Amount;
}
