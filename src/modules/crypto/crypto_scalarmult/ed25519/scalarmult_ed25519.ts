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
