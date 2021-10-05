/*******************************************************************************

    Contains the types used in Wallet.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { PublicKey } from "../common/KeyPair";

/**
 * A constant that defines the option of a fee.
 */
export enum WalletFeeOption {
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
    NotExistReceiver = 1200,
    NotEnoughAmount = 1201,
    ExistNotFrozenUTXO = 1202,
    CoinbaseCanNotCancel = 1500,
    InvalidTransaction = 1501,
    UnsupportedUnfreezing = 1502,
    NotFoundUTXO = 1503,
    UnsupportedLockType = 1504,
    NotFoundKey = 1505,
    NotEnoughFee = 1506,
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
    fee: WalletFeeOption;
}

export function DefaultWalletOption(): IWalletOption {
    return {
        agoraEndpoint: "http://127.0.0.1:2826",
        stoaEndpoint: "http://127.0.0.1:3836",
        fee: WalletFeeOption.Medium,
    };
}
