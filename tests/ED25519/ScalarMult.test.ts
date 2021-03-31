/*******************************************************************************

    Test for libsodium ported to TypeScript

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import {
    crypto_core_ed25519_BYTES,
    crypto_core_ed25519_UNIFORMBYTES,
    crypto_core_ed25519_HASHBYTES,
    crypto_core_ed25519_SCALARBYTES,
    crypto_core_ed25519_NONREDUCEDSCALARBYTES,

    crypto_scalarmult_ed25519,
    crypto_scalarmult_ed25519_noclamp,
    crypto_scalarmult_ed25519_base,
    crypto_scalarmult_ed25519_base_noclamp,
    JSBIUtils
} from '../../src/modules/crypto/'

import * as assert from 'assert';

describe ('Test crypto_scalarmult', () =>
{

});
