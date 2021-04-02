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
    crypto_core_ed25519_BYTES,
    crypto_core_ed25519_UNIFORMBYTES,
    crypto_core_ed25519_SCALARBYTES,
    crypto_core_ed25519_NONREDUCEDSCALARBYTES,
    crypto_core_ed25519_random,
    crypto_core_ed25519_from_uniform,
    crypto_core_ed25519_add,
    crypto_core_ed25519_sub,
    crypto_core_ed25519_is_valid_point,
    crypto_core_ed25519_scalar_random,
    crypto_core_ed25519_scalar_add,
    crypto_core_ed25519_scalar_sub,
    crypto_core_ed25519_scalar_negate,
    crypto_core_ed25519_scalar_complement,
    crypto_core_ed25519_scalar_mul,
    crypto_core_ed25519_scalar_invert,
    crypto_core_ed25519_scalar_reduce,
    crypto_core_ed25519_scalar_is_canonical,
    crypto_core_ed25519_is_valid_scalar,
    crypto_core_ed25519_is_valid_random_scalar,
    crypto_scalarmult_ed25519,
    crypto_scalarmult_ed25519_base,
    crypto_scalarmult_ed25519_base_noclamp,
    crypto_scalarmult_ed25519_noclamp,
    randombytes_buf,
} from './modules/crypto';

import JSBI from 'jsbi';
export { JSBI };
