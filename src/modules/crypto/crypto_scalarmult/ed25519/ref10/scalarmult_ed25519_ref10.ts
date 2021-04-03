/**
 *
 * A set of low-level APIs to perform computations over the edwards25519 curve
 *
 * ported from the C code in libsodium
 * (https://github.com/jedisct1/libsodium).
 *
 * Original_file: https://github.com/jedisct1/libsodium/blob/899c3a62b2860e81137830534311218b71f42f04/src/libsodium/crypto_scalarmult/ed25519/ref10/scalarmult_ed25519_ref10.c
 *
 * The code is licensed as:
 *
 * Copyright (c) 2013-2020
 * Frank Denis <j at pureftpd dot org>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import {
    sodium_is_zero,
    GE25519_P3,
    ge25519_frombytes,
    ge25519_has_small_order,
    ge25519_is_canonical,
    ge25519_is_on_main_subgroup,
    ge25519_p3_tobytes,
    ge25519_scalarmult,
    ge25519_scalarmult_base
} from '../../../';

export function _crypto_scalarmult_ed25519_is_inf (s: Uint8Array): number
{
    let c: number;
    let i: number;

    c = s[0] ^ 0x01;
    for (i = 1; i < 31; i++) {
        c = (c | s[i]) & 0xff;
    }
    c =  (c | (s[31] & 0x7f)) & 0xff;

    return ((c - 1) >> 8) & 1;
}

export function _crypto_scalarmult_ed25519_clamp (k: Uint8Array)
{
    k[0] &= 248;
    k[31] |= 64;
}

export function _crypto_scalarmult_ed25519 (q: Uint8Array, n: Uint8Array,
                                            p: Uint8Array, clamp: number)
{
    let t = q;
    let Q = new GE25519_P3();
    let P = new GE25519_P3();
    let i: number;

    if (ge25519_is_canonical(p) == 0 ||
        ge25519_has_small_order(p) != 0 ||
        ge25519_frombytes(P, p) != 0 ||
        ge25519_is_on_main_subgroup(P) == 0)
    {
        return -1;
    }

    for (i = 0; i < 32; ++i) {
        t[i] = n[i];
    }
    if (clamp !== 0) {
        _crypto_scalarmult_ed25519_clamp(t);
    }
    t[31] &= 127;

    ge25519_scalarmult(Q, t, P);
    ge25519_p3_tobytes(q, Q);
    if (_crypto_scalarmult_ed25519_is_inf(q) != 0 || (sodium_is_zero(n, 32) != 0)) {
        return -1;
    }
    return 0;
}

export function crypto_scalarmult_ed25519 (q: Uint8Array, n: Uint8Array, p: Uint8Array): number
{
    return _crypto_scalarmult_ed25519(q, n, p, 1);
}

export function crypto_scalarmult_ed25519_noclamp (q: Uint8Array, n: Uint8Array, p: Uint8Array): number
{
    return _crypto_scalarmult_ed25519(q, n, p, 0);
}

export function _crypto_scalarmult_ed25519_base (q: Uint8Array, n: Uint8Array, clamp: number): number
{
    let t = q;
    let Q = new GE25519_P3();
    let i: number;

    for (i = 0; i < 32; ++i) {
        t[i] = n[i];
    }

    if (clamp != 0) {
        _crypto_scalarmult_ed25519_clamp(t);
    }

    t[31] &= 127;

    ge25519_scalarmult_base(Q, t);
    ge25519_p3_tobytes(q, Q);
    if (_crypto_scalarmult_ed25519_is_inf(q) != 0 || sodium_is_zero(n, 32)) {
        return -1;
    }
    return 0;
}

export function crypto_scalarmult_ed25519_base (q: Uint8Array, n: Uint8Array)
{
    return _crypto_scalarmult_ed25519_base(q, n, 1);
}

export function crypto_scalarmult_ed25519_base_noclamp (q: Uint8Array, n: Uint8Array)
{
    return _crypto_scalarmult_ed25519_base(q, n, 0);
}
