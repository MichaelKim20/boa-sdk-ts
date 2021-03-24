
import { randombytes_buf } from '../../';
import { ED25519Utils } from '../../';
import * as ref10 from './ref10/ed25519_ref10';

export function crypto_core_ed25519_scalar_reduce (s: Uint8Array): Uint8Array
{
    return ref10.sc25519_reduce(s);
}

export function crypto_core_ed25519_random (p: Uint8Array)
{
    let h = randombytes_buf(ED25519Utils.crypto_core_ed25519_UNIFORMBYTES);
    return crypto_core_ed25519_from_uniform(h);
}

export function crypto_core_ed25519_from_uniform (r: Uint8Array): Uint8Array
{
    return new Uint8Array(0);
}
