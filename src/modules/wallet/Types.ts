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
    FailedRequestUTXO = 1104,
    FailedRequestUTXOInfo = 1105,
    FailedRequestTransactionHistory = 1106,
    FailedRequestTransactionPending = 1107,
    FailedRequestTransactionDetail = 1108,
    FailedRequestTransactionOverview = 1109,
    FailedRequestTransaction = 1110,
    FailedRequestPendingTransaction = 1111,
    FailedRequestTxFee = 1112,
    FailedRequestVotingFee = 1113,
    FailedVerifyPayment = 1114,

    NotExistReceiver = 1200,
    NotEnoughAmount = 1201,

    // Unfreezing
    ExistNotFrozenUTXO = 1202,

    // Cancellation of Transaction
    Cancel_NotAllowCoinbase = 1500,
    Cancel_InvalidTransaction = 1501,
    Cancel_NotAllowUnfreezing = 1502,
    Cancel_NotFoundUTXO = 1503,
    Cancel_UnsupportedLockType = 1504,
    Cancel_NotFoundKey = 1505,
    Cancel_NotEnoughFee = 1506,
    Cancel_NotAssignedTx = 1507,
    Cancel_CancellationTx = 1508,

    NotAssignedReceiver = 1600,
    NotAssignedReceiverAmount = 1601,
    InsufficientAmount = 1602,
    ExistUnknownSecretKey = 1603,
    NotAssignedSender = 1604,
    AmountIsZero = 1605,

    Unfreeze_ExistNotFrozenUTXO = 1700,
    Unfreeze_UnsupportedLockType = 1701,
    Unfreeze_NotUTXOOwnedAccount = 1702,
    Unfreeze_NotFrozenUTXO = 1703,
    Unfreeze_NotFoundUTXO = 1704,
    Unfreeze_AlreadyAdded = 1705,
    Unfreeze_NotAssignedUTXO = 1706,

    FailedBuildTransaction = 1800,
    FailedSendTx = 2000,

    // Valid Public Key
    InvalidPublicKey = 3000,
    InvalidPublicKeyLength = 3001,
    InvalidPublicKeyFormat = 3002,

    // Valid Secret Key
    InvalidSecretKey = 3010,
    InvalidSecretKeyLength = 3011,
    InvalidSecretKeyFormat = 3012,

    // Valid KeyPair
    InvalidKeyPair = 3020,

    // Valid Hash
    InvalidHash = 3030,
    InvalidHashLength = 3031,
    InvalidHashFormat = 3032,

    // Valid Amount
    InvalidAmount = 3040,
    InvalidAmountFormat = 3041,

    // Other
    UnknownError = 9000,

    // System
    SystemError = 9100,
}

export enum WalletMessage {
    Success = "Success",
    FailedAccessToAgora = "Failed access to Agora.",
    FailedAccessToStoa = "Failed access to Stoa.",
    FailedRequestHeight = "Failed to process a request for block height.",
    FailedRequestBalance = "Failed to process a request for the balance of the account.",
    FailedRequestUTXO = "Failed to process a request for UTXOs.",
    FailedRequestUTXOInfo = "Failed to process a request for UTXO information.",
    FailedRequestTransactionHistory = "Failed to process a request for the history of the transactions.",
    FailedRequestTransactionPending = "Failed to process a request for the list of the pending transactions.",
    FailedRequestTransactionDetail = "Failed to process a request for the detail of a transaction.",
    FailedRequestTransactionOverview = "Failed to process a request for the overview of a transaction.",
    FailedRequestTransaction = "Failed to process a request for a transaction.",
    FailedRequestPendingTransaction = "Failed to process a request for a pending transaction.",
    FailedRequestTxFee = "Failed to process a request for the fee of the transaction.",
    FailedRequestVotingFee = "Failed to process a request for voting fee.",
    FailedVerifyPayment = "Failed to process a request for verify payment of the transaction.",

    NotExistReceiver = "Not exists any receiver.",
    NotEnoughAmount = "Not enough amount.",

    // Cancellation of Transaction
    Cancel_NotAllowCoinbase = "Transactions of type Coinbase cannot be canceled.",
    Cancel_InvalidTransaction = "This is not a valid transaction.",
    Cancel_NotAllowUnfreezing = "Unfreeze transactions cannot be canceled.",
    Cancel_NotFoundUTXO = "UTXO information not found.",
    Cancel_UnsupportedLockType = "This LockType not supported by cancel feature.",
    Cancel_NotFoundKey = "Secret key not found.",
    Cancel_NotEnoughFee = "Not enough fees are needed to cancel.",
    Cancel_NotAssignedTx = "Not assigned a transaction.",
    Cancel_CancellationTx = "This is a cancellation transaction.",

    NotAssignedReceiver = "Not assigned any receiver.",
    NotAssignedReceiverAmount = "Not assigned any receiver amount.",
    InsufficientAmount = "Insufficient amount.",
    ExistUnknownSecretKey = "An account exists where the secret key is unknown.",
    NotAssignedSender = "Not assigned any sender.",
    AmountIsZero = "The amount to be transferred is zero.",

    FailedBuildTransaction = "An exception occurred in the process of building a transaction.",
    FailedSendTx = "Failed to process a transfer transaction.",

    // Unfreezing of UTXO
    Unfreeze_UnsupportedLockType = "The key type of the entered UTXO is not supported by this function.",
    Unfreeze_NotUTXOOwnedAccount = "This is not UTXO owned by a registered account.",
    Unfreeze_NotFrozenUTXO = "The entered UTXO is not frozen.",
    Unfreeze_NotFoundUTXO = "The information on the entered UTXO could not be found on the server. Please check if it's already been used.",
    Unfreeze_AlreadyAdded = "The entered UTXO has already been added.",
    Unfreeze_NotAssignedUTXO = "No frozen UTXO has been added.",
    Unfreeze_ExistNotFrozenUTXO = "Among the entered UTXOs, there are some that are not frozen.",

    // Valid Public Key
    InvalidPublicKey = "This is not a valid public key.",
    InvalidPublicKeyLength = "This is not a valid public key length.",
    InvalidPublicKeyFormat = "This is not a valid public key format.",

    // Valid Secret Key
    InvalidSecretKey = "This is not a valid secret key.",
    InvalidSecretKeyLength = "This is not a valid secret key length.",
    InvalidSecretKeyFormat = "This is not a valid secret key format.",

    // Valid KeyPair
    InvalidKeyPair = "This is not a valid key pair.",

    // Valid Hash
    InvalidHash = "This is not a valid hash.",
    InvalidHashLength = "This is not a valid hash length.",
    InvalidHashFormat = "This is not a valid hash format.",

    // Valid Amount
    InvalidAmount = "This is not a valid amount.",
    InvalidAmountFormat = "This is not a valid amount format.",

    UnknownError = "Unknown error occurred.",

    SystemError = "System error occurred.",
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
 * An interface that defines the endpoints used in a wallet.
 */
export interface IWalletEndpoint {
    /**
     * The address of Agora
     */
    agora: string;

    /**
     * The address of Stoa
     */
    stoa: string;
}

/**
 * An interface that defines the options used in a wallet.
 */
export interface IWalletOption {
    /**
     * The endpoints of wallet
     */
    endpoint: IWalletEndpoint;

    /**
     * Fee option to be used when transferring
     */
    fee: WalletTransactionFeeOption;
}

export function DefaultWalletOption(): IWalletOption {
    return {
        endpoint: DefaultWalletEndpoint(),
        fee: WalletTransactionFeeOption.Medium,
    };
}

export function DefaultWalletEndpoint(): IWalletEndpoint {
    return {
        agora: "http://127.0.0.1:2826",
        stoa: "http://127.0.0.1:3836",
    };
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
