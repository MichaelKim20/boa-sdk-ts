/**
 *
 * A set of low-level APIs to perform computations over the edwards25519 curve
 *
 * ported from the C code in libsodium
 * (https://github.com/jedisct1/libsodium).
 *
 * Original_file: https://github.com/jedisct1/libsodium/blob/899c3a62b2860e81137830534311218b71f42f04/src/libsodium/crypto_core/ed25519/ref10/ed25519_ref10.c
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

export class FE25519
{
    public static WIDTH = 10;

    public items: Int32Array;

    constructor (values?: Array<number> | Int32Array | FE25519)
    {
        this.items = new Int32Array(FE25519.WIDTH);
        if (values !== undefined)
        {
            if (values instanceof Int32Array)
                values.forEach((m, i) => this.items[i] = m);
            else if (values instanceof FE25519)
                values.items.forEach((m, i) => this.items[i] = m);
            else
                values.forEach((m, i) => this.items[i] = m);
        }
    }
}

export class GE25519_P2
{
    public X: FE25519 = new FE25519();
    public Y: FE25519 = new FE25519();
    public Z: FE25519 = new FE25519();
}

export class GE25519_P3
{
    public X: FE25519 = new FE25519();
    public Y: FE25519 = new FE25519();
    public Z: FE25519 = new FE25519();
    public T: FE25519 = new FE25519();
}

export class GE25519_P1P1
{
    public X: FE25519 = new FE25519();
    public Y: FE25519 = new FE25519();
    public Z: FE25519 = new FE25519();
    public T: FE25519 = new FE25519();
}

export class GE25519_PreComp
{
    public yplusx: FE25519;
    public yminusx: FE25519;
    public xy2d: FE25519;

    constructor (p?: FE25519, m?: FE25519, d?: FE25519)
    {
        if (p !== undefined)
            this.yplusx = p;
        else
            this.yplusx = new FE25519();

        if (m !== undefined)
            this.yminusx = m;
        else
            this.yminusx = new FE25519();

        if (d !== undefined)
            this.xy2d = d;
        else
            this.xy2d = new FE25519();
    }
}

export class GE25519_Cached
{
    public YplusX: FE25519 = new FE25519();
    public YminusX: FE25519 = new FE25519();
    public Z: FE25519 = new FE25519();
    public T2d: FE25519 = new FE25519();
}