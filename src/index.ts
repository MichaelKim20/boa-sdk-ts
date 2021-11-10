/*******************************************************************************

    This is the main file for exporting classes and functions provided
    by the BOA SDK.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { IWalletEndpoint } from "./modules/wallet/Types";

export { IBOASodium } from "boa-sodium-base-ts";
export { Amount, BOA } from "./modules/common/Amount";
export {
    Hash,
    VariableBytes,
    VariableType,
    hash,
    hashMulti,
    makeUTXOKey,
    hashFull,
    hashPart,
} from "./modules/common/Hash";
export { Height } from "./modules/common/Height";
export { KeyPair, PublicKey, SecretKey, VersionByte } from "./modules/common/KeyPair";
export { Signature } from "./modules/common/Signature";
export { Scalar, Point } from "./modules/common/ECC";
export { Pair, Schnorr, Message } from "./modules/common/Schnorr";

export { BitMask } from "./modules/data/BitMask";
export { Block } from "./modules/data/Block";
export { BlockHeader } from "./modules/data/BlockHeader";
export { Enrollment } from "./modules/data/Enrollment";
export { Transaction } from "./modules/data/Transaction";
export { TxInput } from "./modules/data/TxInput";
export { TxOutput, OutputType } from "./modules/data/TxOutput";
export { PreImageInfo } from "./modules/data/PreImageInfo";

export { ProposalFeeData } from "./modules/vote/ProposalFeeData";
export { ProposalType, ProposalData } from "./modules/vote/ProposalData";
export { VoterCard, BallotData } from "./modules/vote/BallotData";
export { Encrypt } from "./modules/vote/Encrypt";
export { EncryptionKey } from "./modules/vote/EncryptionKey";
export { LinkDataWithProposalFee, LinkDataWithProposalData, LinkDataWithVoteData } from "./modules/vote/LinkData";

export { LockType, Lock, Unlock } from "./modules/script/Lock";
export { OP, isOpcode, isConditional, isPayload } from "./modules/script/Opcodes";
export { ScriptType, Script } from "./modules/script/Script";
export { SigHash, SigPair } from "./modules/script/Signature";

export { Utils, Endian, ArrayRange, iota } from "./modules/utils/Utils";
export { SodiumHelper } from "./modules/utils/SodiumHelper";
export { checksum, validate } from "./modules/utils/CRC16";
export { TxPayloadFee } from "./modules/utils/TxPayloadFee";
export { UTXOManager, UTXOProvider } from "./modules/utils/UTXOManager";
export { TxBuilder, RawInput } from "./modules/utils/TxBuilder";
export { TxCanceller, TxCancelResultCode, ITxCancelResult } from "./modules/utils/TxCanceller";
export { VarInt } from "./modules/utils/VarInt";

export { JSONValidator } from "./modules/utils/JSONValidator";

export { Balance } from "./modules/net/response/Balance";
export { UnspentTxOutput } from "./modules/net/response/UnspentTxOutput";
export { Validator } from "./modules/net/response/Validator";
export { PreImage } from "./modules/net/response/PreImage";
export { TransactionFee } from "./modules/net/response/TransactionFee";
export { ITxHistoryElement, ITxOverview, IPendingTxs, BalanceType } from "./modules/net/response/Types";
export { BOAClient } from "./modules/net/BOAClient";
export { Request } from "./modules/net/Request";

export { NetworkError, NotFoundError, BadRequestError, handleNetworkError } from "./modules/net/error/ErrorTypes";

export {
    DefaultWalletOption,
    DefaultWalletEndpoint,
    WalletTransactionFeeOption,
    WalletMessage,
    WalletResultCode,
    IWalletReceiver,
    IWalletResult,
    IWalletOption,
    IWalletEndpoint,
} from "./modules/wallet/Types";

export { WalletBalance } from "./modules/wallet/WalletBalance";
export { WalletClient } from "./modules/wallet/WalletClient";
export { WalletTransactionFee } from "./modules/wallet/WalletTransactionFee";
export { Wallet } from "./modules/wallet/Wallet";
export { WalletUTXOProvider } from "./modules/wallet/WalletUTXOProvider";

export { Account, AccountContainer, AccountMode } from "./modules/wallet/Account";
export { Event, EventDispatcher, TListener } from "./modules/wallet/EventDispatcher";
export {
    WalletTxBuilder,
    WalletTxBuilderSingleReceiver,
    WalletUnfreezeBuilder,
    WalletCancelBuilder,
    AccountUTXOItem,
    AccountUTXOSummaryItem,
    AccountUTXOSummary,
} from "./modules/wallet/WalletTxBuilder";
export { IWalletWatcherEvent, WalletWatcher } from "./modules/wallet/WalletWatcher";
export { AmountConverter, WalletValidator, WalletUtils } from "./modules/wallet/WalletUtil";
export { WalletMA } from "./modules/wallet/WalletMA";

import JSBI from "jsbi";
export { JSBI };
