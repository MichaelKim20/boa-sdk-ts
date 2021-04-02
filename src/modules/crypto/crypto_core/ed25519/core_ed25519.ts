import {
    crypto_core_ed25519_BYTES,
    crypto_core_ed25519_UNIFORMBYTES,
    crypto_core_ed25519_SCALARBYTES,
    crypto_core_ed25519_NONREDUCEDSCALARBYTES,
    sodium_add,
    sodium_sub,
    sodium_is_zero,
    randombytes_buf
} from '../../';
import * as ref10 from './ref10/ed25519_ref10';

export function crypto_core_ed25519_scalar_random (): Uint8Array
{
    let r: Uint8Array;
    do {
        r = randombytes_buf(crypto_core_ed25519_SCALARBYTES);
        r[crypto_core_ed25519_SCALARBYTES - 1] &= 0x1f;
    } while (ref10.sc25519_is_canonical(r) == 0 || (sodium_is_zero(r, crypto_core_ed25519_SCALARBYTES) != 0));

    return r;
}

export function crypto_core_ed25519_scalar_add (x: Uint8Array, y: Uint8Array): Uint8Array
{
    if (x.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    if (y.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    let x_ = new Uint8Array(crypto_core_ed25519_NONREDUCEDSCALARBYTES);
    let y_ = new Uint8Array(crypto_core_ed25519_NONREDUCEDSCALARBYTES);

    let idx;
    for (idx = 0; idx < x.length || idx < x_.length; idx++)
        x_[idx] = x[idx];
    for (idx = 0; idx < y.length || idx < y_.length; idx++)
        y_[idx] = y[idx];

    sodium_add(x_, y_, crypto_core_ed25519_SCALARBYTES);
    return crypto_core_ed25519_scalar_reduce(x_);
}

export function crypto_core_ed25519_scalar_sub (x: Uint8Array, y: Uint8Array): Uint8Array
{
    if (x.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    if (y.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    let yn = crypto_core_ed25519_scalar_negate(y);
    return crypto_core_ed25519_scalar_add(x, yn);
}

const L = new Uint8Array([
    0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7,
    0xa2, 0xde, 0xf9, 0xde, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10
]);

export function crypto_core_ed25519_scalar_negate (s: Uint8Array): Uint8Array
{
    if (s.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    let t_ = new Uint8Array(crypto_core_ed25519_NONREDUCEDSCALARBYTES);
    let s_ = new Uint8Array(crypto_core_ed25519_NONREDUCEDSCALARBYTES);

    let i;
    for (i = 0; i < crypto_core_ed25519_SCALARBYTES; i++)
        t_[i + crypto_core_ed25519_SCALARBYTES] = L[i];
    for (i = 0; i < crypto_core_ed25519_SCALARBYTES; i++)
        s_[i] = s[i];

    sodium_sub(t_, s_, crypto_core_ed25519_NONREDUCEDSCALARBYTES);
    ref10.sc25519_reduce(t_);

    let r = new Uint8Array(crypto_core_ed25519_SCALARBYTES);
    for (i = 0; i < r.length; i++)
        r[i] = t_[i];

    return r;
}

export function crypto_core_ed25519_scalar_complement (s: Uint8Array): Uint8Array
{
    if (s.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    let t_ = new Uint8Array(crypto_core_ed25519_NONREDUCEDSCALARBYTES);
    let s_ = new Uint8Array(crypto_core_ed25519_NONREDUCEDSCALARBYTES);

    t_[0]++;
    let i;
    for (i = 0; i < crypto_core_ed25519_SCALARBYTES; i++)
        t_[i + crypto_core_ed25519_SCALARBYTES] = L[i];
    for (i = 0; i < crypto_core_ed25519_SCALARBYTES; i++)
        s_[i] = s[i];

    sodium_sub(t_, s_, crypto_core_ed25519_NONREDUCEDSCALARBYTES);
    ref10.sc25519_reduce(t_);

    let r = new Uint8Array(crypto_core_ed25519_SCALARBYTES);
    for (i = 0; i < r.length; i++)
        r[i] = t_[i];

    return r;
}

export function crypto_core_ed25519_scalar_mul (x: Uint8Array, y: Uint8Array): Uint8Array
{
    if (x.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    if (y.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    let z = new Uint8Array(crypto_core_ed25519_SCALARBYTES);
    ref10.sc25519_mul(z, x, y);
    return z;
}

export function crypto_core_ed25519_scalar_invert (s: Uint8Array): Uint8Array
{
    if (s.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    if (sodium_is_zero(s, crypto_core_ed25519_SCALARBYTES) != 0)
        throw new Error("Invalid input value");

    let r = new Uint8Array(crypto_core_ed25519_SCALARBYTES);
    ref10.sc25519_invert(r, s);
    return r;
}

export function crypto_core_ed25519_scalar_reduce (s: Uint8Array): Uint8Array
{
    let t = new Uint8Array(crypto_core_ed25519_NONREDUCEDSCALARBYTES);
    let i: number;

    for (i = 0; i < t.length || i < s.length; i++)
        t[i] = s[i];

    ref10.sc25519_reduce(t);

    let r = new Uint8Array(crypto_core_ed25519_SCALARBYTES);
    for (i = 0; i < r.length; i++)
        r[i] = t[i];

    return r;
}

export function crypto_core_ed25519_scalar_is_canonical(s: Uint8Array): boolean
{
    if (s.length != crypto_core_ed25519_SCALARBYTES)
        throw new Error("Invalid input size");

    return ref10.sc25519_is_canonical(s) != 0
}

export function crypto_core_ed25519_random (): Uint8Array
{
    let h = randombytes_buf(crypto_core_ed25519_UNIFORMBYTES);
    return crypto_core_ed25519_from_uniform(h);
}

export function crypto_core_ed25519_from_uniform (r: Uint8Array): Uint8Array
{
    let s = new Uint8Array(crypto_core_ed25519_BYTES);
    ref10.ge25519_from_uniform(s, r);
    return s
}

export function crypto_core_ed25519_add (p: Uint8Array, q: Uint8Array): Uint8Array
{
    if (p.length != crypto_core_ed25519_BYTES)
        throw new Error("Invalid input size");

    if (q.length != crypto_core_ed25519_BYTES)
        throw new Error("Invalid input size");

    let p_p3 = new ref10.GE25519_P3();
    let q_p3 = new ref10.GE25519_P3();
    let r_p3 = new ref10.GE25519_P3();

    let r_p1p1 = new ref10.GE25519_P1P1();
    let q_cached = new ref10.GE25519_Cached();

    let r = new Uint8Array(crypto_core_ed25519_BYTES);

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
    if (p.length != crypto_core_ed25519_BYTES)
        throw new Error("Invalid input size");

    if (q.length != crypto_core_ed25519_BYTES)
        throw new Error("Invalid input size");

    let p_p3 = new ref10.GE25519_P3();
    let q_p3 = new ref10.GE25519_P3();
    let r_p3 = new ref10.GE25519_P3();

    let r_p1p1 = new ref10.GE25519_P1P1();
    let q_cached = new ref10.GE25519_Cached();

    let r = new Uint8Array(crypto_core_ed25519_BYTES);

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
    if (p.length != crypto_core_ed25519_BYTES)
        throw new Error("Invalid input size");

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

export function crypto_core_ed25519_is_valid_scalar (x: Uint8Array): boolean
{
    if (x.length != crypto_core_ed25519_SCALARBYTES)
        return false;

    if ((ref10.ge25519_is_canonical(x) == 0) || (sodium_is_zero(x, crypto_core_ed25519_SCALARBYTES) != 0))
    {
        return false;
    }

    return true;
}

export function crypto_core_ed25519_is_valid_random_scalar (r: Uint8Array): boolean
{
    if (r.length != crypto_core_ed25519_SCALARBYTES)
        return false;

    let t = Uint8Array.from(r);
    t[crypto_core_ed25519_SCALARBYTES - 1] &= 0x1f;
    if ((ref10.ge25519_is_canonical(t) == 0) || (sodium_is_zero(t, crypto_core_ed25519_SCALARBYTES) != 0))
        return false;

    return true;
}
