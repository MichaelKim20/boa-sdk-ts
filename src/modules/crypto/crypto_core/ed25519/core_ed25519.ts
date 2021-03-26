
import { randombytes_buf } from '../../';
import { ED25519Utils } from '../../';
import * as ref10 from './ref10/ed25519_ref10';

export function crypto_core_ed25519_scalar_reduce (s: Uint8Array): Uint8Array
{
    let t = new Uint8Array(ED25519Utils.crypto_core_ed25519_NONREDUCEDSCALARBYTES);
    let i: number;

    for (i = 0; i < t.length || i < s.length; i++)
        t[i] = s[i];

    ref10.sc25519_reduce(t);

    let r = new Uint8Array(ED25519Utils.crypto_core_ed25519_SCALARBYTES);
    for (i = 0; i < r.length; i++)
        r[i] = t[i];

    return r;
}

export function crypto_core_ed25519_random (): Uint8Array
{
    let h = randombytes_buf(ED25519Utils.crypto_core_ed25519_UNIFORMBYTES);
    return crypto_core_ed25519_from_uniform(h);
}

export function crypto_core_ed25519_from_uniform (r: Uint8Array): Uint8Array
{
    let s = new Uint8Array(ED25519Utils.crypto_core_ed25519_BYTES);
    ref10.ge25519_from_uniform(s, r);
    return s
}
