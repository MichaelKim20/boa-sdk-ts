
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

export function crypto_core_ed25519_add (p: Uint8Array, q: Uint8Array): Uint8Array
{
    let p_p3 = new ref10.GE25519_P3();
    let q_p3 = new ref10.GE25519_P3();
    let r_p3 = new ref10.GE25519_P3();

    let r_p1p1 = new ref10.GE25519_P1P1();
    let q_cached = new ref10.GE25519_Cached();

    let r = new Uint8Array(ED25519Utils.crypto_core_ed25519_BYTES);

    if (ref10.ge25519_frombytes(p_p3, p) != 0 || ref10.ge25519_is_on_curve(p_p3) == 0 ||
        ref10.ge25519_frombytes(q_p3, q) != 0 || ref10.ge25519_is_on_curve(q_p3) == 0) {
        throw new Error("Invalid input value");
    }

    ref10.ge25519_p3_to_cached(q_cached, q_p3);
    ref10.ge25519_add_cached(r_p1p1, p_p3, q_cached);
    ref10.ge25519_p1p1_to_p3(r_p3, r_p1p1);
    ref10.ge25519_p3_tobytes(r, r_p3);

    return r;
}

export function crypto_core_ed25519_sub (p: Uint8Array, q: Uint8Array): Uint8Array
{
    let p_p3 = new ref10.GE25519_P3();
    let q_p3 = new ref10.GE25519_P3();
    let r_p3 = new ref10.GE25519_P3();

    let r_p1p1 = new ref10.GE25519_P1P1();
    let q_cached = new ref10.GE25519_Cached();

    let r = new Uint8Array(ED25519Utils.crypto_core_ed25519_BYTES);

    if (ref10.ge25519_frombytes(p_p3, p) != 0 || ref10.ge25519_is_on_curve(p_p3) == 0 ||
        ref10.ge25519_frombytes(q_p3, q) != 0 || ref10.ge25519_is_on_curve(q_p3) == 0) {
        throw new Error("Invalid input value");
    }

    ref10.ge25519_p3_to_cached(q_cached, q_p3);
    ref10.ge25519_sub_cached(r_p1p1, p_p3, q_cached);
    ref10.ge25519_p1p1_to_p3(r_p3, r_p1p1);
    ref10.ge25519_p3_tobytes(r, r_p3);

    return r;
}

export function crypto_core_ed25519_is_valid_point (p: Uint8Array): boolean
{
    let p_p3 = new ref10.GE25519_P3();

    if (
            ref10.ge25519_is_canonical(p) == 0 ||
            ref10.ge25519_has_small_order(p) != 0 ||
            ref10.ge25519_frombytes(p_p3, p) != 0 ||
            ref10.ge25519_is_on_curve(p_p3) == 0 ||
            ref10.ge25519_is_on_main_subgroup(p_p3) == 0)
    {
        return false;
    }

    return true;
}
