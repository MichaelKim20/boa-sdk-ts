/**
 *
 * A set of low-level APIs to perform computations over the edwards25519 curve
 *
 * ported from the C code in libsodium
 * (https://github.com/jedisct1/libsodium).
 *
 * Original_file: https://github.com/jedisct1/libsodium/blob/899c3a62b2860e81137830534311218b71f42f04/src/libsodium/include/sodium/crypto_core_ed25519.h
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

export const crypto_core_ed25519_BYTES: number = 32;
export const crypto_core_ed25519_UNIFORMBYTES: number = 32;
export const crypto_core_ed25519_SCALARBYTES: number = 32;
export const crypto_core_ed25519_NONREDUCEDSCALARBYTES: number = 64;
