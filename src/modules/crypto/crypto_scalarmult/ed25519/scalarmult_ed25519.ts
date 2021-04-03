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

import { crypto_core_ed25519_BYTES, crypto_core_ed25519_SCALARBYTES } from '../../';
import * as ref from "./ref10/scalarmult_ed25519_ref10";

export function crypto_scalarmult_ed25519 (n: Uint8Array, p: Uint8Array): Uint8Array
{
    if (n.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");
    if (p.length != crypto_core_ed25519_BYTES)
        throw new Error("Invalid input size");

    let q = new Uint8Array(crypto_core_ed25519_BYTES);

    if (ref.crypto_scalarmult_ed25519(q, n, p) != 0)
        throw new Error("Invalid point or scalar is 0");

    return q;
}

export function crypto_scalarmult_ed25519_noclamp (n: Uint8Array, p: Uint8Array): Uint8Array
{
    if (n.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");
    if (p.length != crypto_core_ed25519_BYTES)
        throw new Error("Invalid input size");

    let q = new Uint8Array(crypto_core_ed25519_BYTES);

    if (ref.crypto_scalarmult_ed25519_noclamp(q, n, p) != 0)
        throw new Error("Invalid point or scalar is 0");

    return q;
}

export function crypto_scalarmult_ed25519_base (n: Uint8Array)
{
    if (n.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    let q = new Uint8Array(crypto_core_ed25519_BYTES);

    if (ref.crypto_scalarmult_ed25519_base(q, n) != 0)
        throw new Error("Scalar is 0");

    return q;
}

export function crypto_scalarmult_ed25519_base_noclamp (n: Uint8Array)
{
    if (n.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    let q = new Uint8Array(crypto_core_ed25519_BYTES);

    if (ref.crypto_scalarmult_ed25519_base_noclamp(q, n) != 0)
        throw new Error("Scalar is 0");

    return q;
}
