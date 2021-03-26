/*******************************************************************************

    This is the main file for exporting classes and functions provided
    by the BOA SDK.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

export { Hash, hash, hashMulti, makeUTXOKey, hashFull, hashPart } from './modules/common/Hash';
export { Height } from './modules/common/Height';
export { KeyPair, PublicKey, SecretKey } from './modules/common/KeyPair';
export { Signature } from './modules/common/Signature';
export { Scalar, Point } from './modules/common/ECC';
export { Sig, Pair, Schnorr, Message } from './modules/common/Schnorr';

export { BitField } from './modules/data/BitField';
export { Block } from './modules/data/Block';
export { BlockHeader } from './modules/data/BlockHeader';
export { Enrollment } from './modules/data/Enrollment';
export { Transaction, TxType } from './modules/data/Transaction';
export { TxInput } from './modules/data/TxInput';
export { TxOutput } from './modules/data/TxOutput';
export { DataPayload } from './modules/data/DataPayload';
export { PreImageInfo } from './modules/data/PreImageInfo';

export { ProposalFeeData } from './modules/vote/ProposalFeeData';
export { ProposalType, ProposalData } from './modules/vote/ProposalData';
export { VoterCard, BallotData } from './modules/vote/BallotData';
export { Encrypt } from './modules/vote/Encrypt';

export { LockType, Lock, Unlock } from './modules/script/Lock';
export { OP, isOpcode, isConditional, isPayload } from './modules/script/Opcodes';
export { ScriptType, Script } from './modules/script/Script';

export { Utils, Endian } from './modules/utils/Utils';
export { SodiumHelper } from './modules/utils/SodiumHelper';
export { checksum, validate } from './modules/utils/CRC16';
export { TxPayloadFee } from './modules/utils/TxPayloadFee';
export { UTXOManager } from './modules/utils/UTXOManager';
export { TxBuilder, RawInput } from './modules/utils/TxBuilder';
export { VarInt } from './modules/utils/VarInt';

export { JSONValidator } from './modules/utils/JSONValidator';

export { UnspentTxOutput } from './modules/net/response/UnspentTxOutput';
export { Validator } from './modules/net/response/Validator';
export { PreImage  } from './modules/net/response/PreImage';
export { ITxHistoryElement, ITxOverview, IPendingTxs } from './modules/net/response/Types';

export { BOAClient } from './modules/net/BOAClient';
export { Request } from './modules/net/Request';

export { NetworkError, NotFoundError, BadRequestError, handleNetworkError } from './modules/net/error/ErrorTypes';

export {
    FE25519,
    GE25519_P2,
    GE25519_P3,
    GE25519_P1P1,
    GE25519_PreComp,
    GE25519_Cached,
    fe25519_reduce,
    fe25519_tobytes,
    fe25519_frombytes,
    fe25519_0,
    fe25519_1,
    fe25519_add,
    fe25519_sub,
    fe25519_mul,
    fe25519_mul32,
    fe25519_sq,
    fe25519_sq2,
    fe25519_neg,
    fe25519_abs,
    fe25519_invert,
    fe25519_pow22523,
    fe25519_sqrt,
    fe25519_notsquare
} from './modules/crypto/crypto_core/ed25519/ref10/ed25519_ref10';

export {
    crypto_core_ed25519_scalar_reduce,
    crypto_core_ed25519_random,
    crypto_core_ed25519_from_uniform
} from './modules/crypto/crypto_core/ed25519/core_ed25519';
export { crypto_sign_ed25519_sk_to_curve25519 } from './modules/crypto/crypto_sign/ed25519/keypair';
export { ED25519Utils } from './modules/crypto/utils/ED25519Utils';
export { JSBIUtils } from './modules/crypto/utils/JSBIUtils';
export { randombytes_buf } from './modules/crypto/utils/random';

import JSBI from 'jsbi';
export { JSBI };
