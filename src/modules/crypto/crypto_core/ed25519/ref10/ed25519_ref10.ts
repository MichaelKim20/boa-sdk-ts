import { ED25519Utils, JSBIUtils } from "../../../";
import JSBI from "jsbi";

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

/* sqrt(-1) */
export const fe25519_sqrtm1 =
    new FE25519([-32595792, -7943725,  9377950,  3500415, 12389472, -272473, -25146209, -2005654, 326686, 11406482]);

/* sqrt(-486664) */
export const ed25519_sqrtam2 =
    new FE25519([-12222970, -8312128, -11511410, 9067497, -15300785, -241793, 25456130, 14121551, -12187136, 3972024]);

/* 37095705934669439343138083508754565189542113879843219016388785533085940283555 */
export const ed25519_d =
    new FE25519([-10913610, 13857413, -15372611, 6949391,   114729, -8787816, -6275908, -3247719, -18696448, -12055116]);

/* 2 * d =
* 16295367250680780974490674513165176452449235426866156013048779062215315747161
*/
export const ed25519_d2 =
    new FE25519([-21827239, -5839606,  -30745221, 13898782, 229458, 15978800, -12551817, -6495438, 29715968, 9444199]);

export const ed25519_A_32 = 486662;

/* A = 486662 */
export const ed25519_A =
    new FE25519([ed25519_A_32, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

/* sqrt(ad - 1) with a = -1 (mod p) */
export const ed25519_sqrtadm1 =
    new FE25519([24849947, -153582, -23613485, 6347715, -21072328, -667138, -25271143, -15367704, -870347, 14525639]);

/* 1 / sqrt(a - d) */
export const ed25519_invsqrtamd =
    new FE25519([6111485, 4156064, -27798727, 12243468, -25904040, 120897, 20826367, -7060776, 6093568, -1986012]);

/* 1 - d ^ 2 */
export const ed25519_onemsqd =
    new FE25519([6275446, -16617371, -22938544, -3773710, 11667077, 7397348, -27922721, 1766195, -24433858, 672203]);

/* (d - 1) ^ 2 */
export const ed25519_sqdmone =
    new FE25519([15551795, -11097455, -13425098, -10125071, -11896535, 10178284, -26634327, 4729244, -5282110, -10116402]);

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
    public yplusx: FE25519 = new FE25519();
    public yminusx: FE25519 = new FE25519();
    public xy2d: FE25519 = new FE25519();
}

export class GE25519_Cached
{
    public YplusX: FE25519 = new FE25519();
    public YminusX: FE25519 = new FE25519();
    public Z: FE25519 = new FE25519();
    public T2d: FE25519 = new FE25519();
}

function load_3 (s: Uint8Array, offset: number): JSBI
{
    let result = JSBI.BigInt(s[offset]);
    result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(8)));
    result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(16)));
    return result;
}

function load_4 (s: Uint8Array, offset: number): JSBI
{
    let result = JSBI.BigInt(s[offset]);
    result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(8)));
    result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(16)));
    result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(24)));
    return result;
}

export function fe25519_reduce (h: FE25519, f: FE25519)
{
    let h0 = f.items[0];
    let h1 = f.items[1];
    let h2 = f.items[2];
    let h3 = f.items[3];
    let h4 = f.items[4];
    let h5 = f.items[5];
    let h6 = f.items[6];
    let h7 = f.items[7];
    let h8 = f.items[8];
    let h9 = f.items[9];

    let q;
    let carry0, carry1, carry2, carry3, carry4, carry5, carry6, carry7, carry8, carry9;

    q = (19 * h9 + (1 << 24)) >> 25;
    q = (h0 + q) >> 26;
    q = (h1 + q) >> 25;
    q = (h2 + q) >> 26;
    q = (h3 + q) >> 25;
    q = (h4 + q) >> 26;
    q = (h5 + q) >> 25;
    q = (h6 + q) >> 26;
    q = (h7 + q) >> 25;
    q = (h8 + q) >> 26;
    q = (h9 + q) >> 25;

    /* Goal: Output h-(2^255-19)q, which is between 0 and 2^255-20. */
    h0 += 19 * q;
    /* Goal: Output h-2^255 q, which is between 0 and 2^255-20. */

    carry0 = h0 >> 26;
    h1 += carry0;
    h0 -= carry0 * (1 << 26);

    carry1 = h1 >> 25;
    h2 += carry1;
    h1 -= carry1 * (1 << 25);

    carry2 = h2 >> 26;
    h3 += carry2;
    h2 -= carry2 * (1 << 26);
    carry3 = h3 >> 25;
    h4 += carry3;
    h3 -= carry3 * (1 << 25);

    carry4 = h4 >> 26;
    h5 += carry4;
    h4 -= carry4 * (1 << 26);
    carry5 = h5 >> 25;
    h6 += carry5;
    h5 -= carry5 * (1 << 25);

    carry6 = h6 >> 26;
    h7 += carry6;
    h6 -= carry6 * (1 << 26);
    carry7 = h7 >> 25;
    h8 += carry7;
    h7 -= carry7 * (1 << 25);

    carry8 = h8 >> 26;
    h9 += carry8;
    h8 -= carry8 * (1 << 26);
    carry9 = h9 >> 25;
    h9 -= carry9 * (1 << 25);

    h.items[0] = h0;
    h.items[1] = h1;
    h.items[2] = h2;
    h.items[3] = h3;
    h.items[4] = h4;
    h.items[5] = h5;
    h.items[6] = h6;
    h.items[7] = h7;
    h.items[8] = h8;
    h.items[9] = h9;
}

export function fe25519_tobytes (s: Uint8Array, h: FE25519)
{
    let t = new FE25519();
    fe25519_reduce(t, h);

    s[0]  = t.items[0] >> 0;
    s[1]  = t.items[0] >> 8;
    s[2]  = t.items[0] >> 16;
    s[3]  = (t.items[0] >> 24) | (t.items[1] * (1 << 2));
    s[4]  = t.items[1] >> 6;
    s[5]  = t.items[1] >> 14;
    s[6]  = (t.items[1] >> 22) | (t.items[2] * (1 << 3));
    s[7]  = t.items[2] >> 5;
    s[8]  = t.items[2] >> 13;
    s[9]  = (t.items[2] >> 21) | (t.items[3] * (1 << 5));
    s[10] = t.items[3] >> 3;
    s[11] = t.items[3] >> 11;
    s[12] = (t.items[3] >> 19) | (t.items[4] * (1 << 6));
    s[13] = t.items[4] >> 2;
    s[14] = t.items[4] >> 10;
    s[15] = t.items[4] >> 18;
    s[16] = t.items[5] >> 0;
    s[17] = t.items[5] >> 8;
    s[18] = t.items[5] >> 16;
    s[19] = (t.items[5] >> 24) | (t.items[6] * (1 << 1));
    s[20] = t.items[6] >> 7;
    s[21] = t.items[6] >> 15;
    s[22] = (t.items[6] >> 23) | (t.items[7] * (1 << 3));
    s[23] = t.items[7] >> 5;
    s[24] = t.items[7] >> 13;
    s[25] = (t.items[7] >> 21) | (t.items[8] * (1 << 4));
    s[26] = t.items[8] >> 4;
    s[27] = t.items[8] >> 12;
    s[28] = (t.items[8] >> 20) | (t.items[9] * (1 << 6));
    s[29] = t.items[9] >> 2;
    s[30] = t.items[9] >> 10;
    s[31] = t.items[9] >> 18;
}

export function fe25519_frombytes (h: FE25519, s: Uint8Array)
{
    let H: Array<JSBI> = [];
    let Carry: Array<JSBI> = [];

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        H.push(JSBI.BigInt(0));

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        Carry.push(JSBI.BigInt(0))

    H[0] = load_4(s, 0);
    H[1] = JSBI.leftShift(load_3(s, 4), JSBI.BigInt(6));
    H[2] = JSBI.leftShift(load_3(s, 7), JSBI.BigInt(5));
    H[3] = JSBI.leftShift(load_3(s, 10), JSBI.BigInt(3));
    H[4] = JSBI.leftShift(load_3(s, 13), JSBI.BigInt(2));
    H[5] = load_4(s, 16);
    H[6] = JSBI.leftShift(load_3(s, 20), JSBI.BigInt(7));
    H[7] = JSBI.leftShift(load_3(s, 23), JSBI.BigInt(5));
    H[8] = JSBI.leftShift(load_3(s, 26), JSBI.BigInt(4));
    H[9] = JSBI.leftShift(JSBI.bitwiseAnd(load_3(s, 29), JSBI.BigInt(8388607)), JSBI.BigInt(2));

    let func24_19 = (i: number) => {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], JSBI.multiply(Carry[i], JSBI.BigInt(19)));
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    let func24 = (i: number) => {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    let func25 = (i: number) => {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 25)), JSBI.BigInt(26));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 26)));
    }

    func24_19(9);
    func24(1);
    func24(3);
    func24(5);
    func24(7);

    func25(0);
    func25(2);
    func25(4);
    func25(6);
    func25(8);

    H.forEach((v, idx) => h.items[idx] = JSBIUtils.toInt32(H[idx]));
}

/**
 h = 0
 **/
export function fe25519_0 (h: FE25519)
{
    h.items.fill(0);
}

/**
 h = 1
 **/
export function fe25519_1 (h: FE25519)
{
    h.items[0] = 1;
    h.items[1] = 0;
    h.items.fill(0, 2);
}

/**
 * h = f + g
 * Can overlap h with f or g.
 *
 * Preconditions:
 * |f| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 * |g| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 *
 * Postconditions:
 * |h| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
 **/
export function fe25519_add (h: FE25519, f: FE25519, g: FE25519)
{
    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        h.items[idx] = f.items[idx] + g.items[idx];
}

/**
 * h = f - g
 * Can overlap h with f or g.
 *
 * Preconditions:
 * |f| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 * |g| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 *
 * Postconditions:
 * |h| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
 **/
export function fe25519_sub (h: FE25519, f: FE25519, g: FE25519)
{
    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        h.items[idx] = f.items[idx] - g.items[idx];
}

/**
 * h = -f
 *
 * Preconditions:
 * |f| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 *
 * Postconditions:
 * |h| bounded by 1.1*2^25,1.1*2^24,1.1*2^25,1.1*2^24,etc.
 **/
export function fe25519_neg (h: FE25519, f: FE25519)
{
    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        h.items[idx] = - f.items[idx];
}

/**
 * Replace (f,g) with (g,g) if b == 1;
 * Replace (f,g) with (f,g) if b == 0.
 */
export function fe25519_cmov (f: FE25519, g: FE25519, b: number)
{
    let mask = -b;
    let x = new FE25519();
    let i: number;

    for (i = 0; i < FE25519.WIDTH; i++)
        x.items[i] = f.items[i] ^ g.items[i];

    for (i = 0; i < FE25519.WIDTH; i++)
        x.items[i] &= mask;

    for (i = 0; i < FE25519.WIDTH; i++)
        f.items[i] ^= x.items[i];
}

/**
 h = f
 **/
export function fe25519_copy (h: FE25519, f: FE25519)
{
    for (let i = 0; i < FE25519.WIDTH; i++)
        h.items[i] = f.items[i];
}

/**
 * return 1 if f is in {1,3,5,...,q-2}
 * return 0 if f is in {0,2,4,...,q-1}
 *
 * Preconditions:
 * |f| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
 **/
export function fe25519_isnegative (f: FE25519): number
{
    let s = new Uint8Array(32);
    fe25519_tobytes(s, f);
    return s[0] & 1;
}

/**
 * return 1 if f == 0
 * return 0 if f != 0
 *
 * Preconditions:
 * |f| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
 **/
export function fe25519_iszero (f: FE25519): number
{
    let s = new Uint8Array(32);
    fe25519_tobytes(s, f);
    return ED25519Utils.sodium_is_zero(s, 32);
}

/**
 * h = f * g
 * Can overlap h with f or g.
 *
 * Preconditions:
 * |f| bounded by 1.65*2^26,1.65*2^25,1.65*2^26,1.65*2^25,etc.
 * |g| bounded by 1.65*2^26,1.65*2^25,1.65*2^26,1.65*2^25,etc.
 *
 * Postconditions:
 * |h| bounded by 1.01*2^25,1.01*2^24,1.01*2^25,1.01*2^24,etc.
 */
export function fe25519_mul (h: FE25519, f: FE25519, g: FE25519)
{
    let f0 = JSBI.BigInt(f.items[0]);
    let f1 = JSBI.BigInt(f.items[1]);
    let f2 = JSBI.BigInt(f.items[2]);
    let f3 = JSBI.BigInt(f.items[3]);
    let f4 = JSBI.BigInt(f.items[4]);
    let f5 = JSBI.BigInt(f.items[5]);
    let f6 = JSBI.BigInt(f.items[6]);
    let f7 = JSBI.BigInt(f.items[7]);
    let f8 = JSBI.BigInt(f.items[8]);
    let f9 = JSBI.BigInt(f.items[9]);

    let g0 = JSBI.BigInt(g.items[0]);
    let g1 = JSBI.BigInt(g.items[1]);
    let g2 = JSBI.BigInt(g.items[2]);
    let g3 = JSBI.BigInt(g.items[3]);
    let g4 = JSBI.BigInt(g.items[4]);
    let g5 = JSBI.BigInt(g.items[5]);
    let g6 = JSBI.BigInt(g.items[6]);
    let g7 = JSBI.BigInt(g.items[7]);
    let g8 = JSBI.BigInt(g.items[8]);
    let g9 = JSBI.BigInt(g.items[9]);

    let g1_19 = JSBI.BigInt(19 * g.items[1]); /* 1.959375*2^29 */
    let g2_19 = JSBI.BigInt(19 * g.items[2]); /* 1.959375*2^30; still ok */
    let g3_19 = JSBI.BigInt(19 * g.items[3]);
    let g4_19 = JSBI.BigInt(19 * g.items[4]);
    let g5_19 = JSBI.BigInt(19 * g.items[5]);
    let g6_19 = JSBI.BigInt(19 * g.items[6]);
    let g7_19 = JSBI.BigInt(19 * g.items[7]);
    let g8_19 = JSBI.BigInt(19 * g.items[8]);
    let g9_19 = JSBI.BigInt(19 * g.items[9]);
    let f1_2  = JSBI.BigInt(2 * f.items[1]);
    let f3_2  = JSBI.BigInt(2 * f.items[3]);
    let f5_2  = JSBI.BigInt(2 * f.items[5]);
    let f7_2  = JSBI.BigInt(2 * f.items[7]);
    let f9_2  = JSBI.BigInt(2 * f.items[9]);

    let f0g0    = JSBI.multiply(f0, g0);
    let f0g1    = JSBI.multiply(f0, g1);
    let f0g2    = JSBI.multiply(f0, g2);
    let f0g3    = JSBI.multiply(f0, g3);
    let f0g4    = JSBI.multiply(f0, g4);
    let f0g5    = JSBI.multiply(f0, g5);
    let f0g6    = JSBI.multiply(f0, g6);
    let f0g7    = JSBI.multiply(f0, g7);
    let f0g8    = JSBI.multiply(f0, g8);
    let f0g9    = JSBI.multiply(f0, g9);
    let f1g0    = JSBI.multiply(f1, g0);
    let f1g1_2  = JSBI.multiply(f1_2, g1);
    let f1g2    = JSBI.multiply(f1, g2);
    let f1g3_2  = JSBI.multiply(f1_2, g3);
    let f1g4    = JSBI.multiply(f1, g4);
    let f1g5_2  = JSBI.multiply(f1_2, g5);
    let f1g6    = JSBI.multiply(f1, g6);
    let f1g7_2  = JSBI.multiply(f1_2, g7);
    let f1g8    = JSBI.multiply(f1, g8);
    let f1g9_38 = JSBI.multiply(f1_2, g9_19);
    let f2g0    = JSBI.multiply(f2, g0);
    let f2g1    = JSBI.multiply(f2, g1);
    let f2g2    = JSBI.multiply(f2, g2);
    let f2g3    = JSBI.multiply(f2, g3);
    let f2g4    = JSBI.multiply(f2, g4);
    let f2g5    = JSBI.multiply(f2, g5);
    let f2g6    = JSBI.multiply(f2, g6);
    let f2g7    = JSBI.multiply(f2, g7);
    let f2g8_19 = JSBI.multiply(f2, g8_19);
    let f2g9_19 = JSBI.multiply(f2, g9_19);
    let f3g0    = JSBI.multiply(f3, g0);
    let f3g1_2  = JSBI.multiply(f3_2, g1);
    let f3g2    = JSBI.multiply(f3, g2);
    let f3g3_2  = JSBI.multiply(f3_2, g3);
    let f3g4    = JSBI.multiply(f3, g4);
    let f3g5_2  = JSBI.multiply(f3_2, g5);
    let f3g6    = JSBI.multiply(f3, g6);
    let f3g7_38 = JSBI.multiply(f3_2, g7_19);
    let f3g8_19 = JSBI.multiply(f3, g8_19);
    let f3g9_38 = JSBI.multiply(f3_2, g9_19);
    let f4g0    = JSBI.multiply(f4, g0);
    let f4g1    = JSBI.multiply(f4, g1);
    let f4g2    = JSBI.multiply(f4, g2);
    let f4g3    = JSBI.multiply(f4, g3);
    let f4g4    = JSBI.multiply(f4, g4);
    let f4g5    = JSBI.multiply(f4, g5);
    let f4g6_19 = JSBI.multiply(f4, g6_19);
    let f4g7_19 = JSBI.multiply(f4, g7_19);
    let f4g8_19 = JSBI.multiply(f4, g8_19);
    let f4g9_19 = JSBI.multiply(f4, g9_19);
    let f5g0    = JSBI.multiply(f5, g0);
    let f5g1_2  = JSBI.multiply(f5_2, g1);
    let f5g2    = JSBI.multiply(f5, g2);
    let f5g3_2  = JSBI.multiply(f5_2, g3);
    let f5g4    = JSBI.multiply(f5, g4);
    let f5g5_38 = JSBI.multiply(f5_2, g5_19);
    let f5g6_19 = JSBI.multiply(f5, g6_19);
    let f5g7_38 = JSBI.multiply(f5_2, g7_19);
    let f5g8_19 = JSBI.multiply(f5, g8_19);
    let f5g9_38 = JSBI.multiply(f5_2, g9_19);
    let f6g0    = JSBI.multiply(f6, g0);
    let f6g1    = JSBI.multiply(f6, g1);
    let f6g2    = JSBI.multiply(f6, g2);
    let f6g3    = JSBI.multiply(f6, g3);
    let f6g4_19 = JSBI.multiply(f6, g4_19);
    let f6g5_19 = JSBI.multiply(f6, g5_19);
    let f6g6_19 = JSBI.multiply(f6, g6_19);
    let f6g7_19 = JSBI.multiply(f6, g7_19);
    let f6g8_19 = JSBI.multiply(f6, g8_19);
    let f6g9_19 = JSBI.multiply(f6, g9_19);
    let f7g0    = JSBI.multiply(f7, g0);
    let f7g1_2  = JSBI.multiply(f7_2, g1);
    let f7g2    = JSBI.multiply(f7, g2);
    let f7g3_38 = JSBI.multiply(f7_2, g3_19);
    let f7g4_19 = JSBI.multiply(f7, g4_19);
    let f7g5_38 = JSBI.multiply(f7_2, g5_19);
    let f7g6_19 = JSBI.multiply(f7, g6_19);
    let f7g7_38 = JSBI.multiply(f7_2, g7_19);
    let f7g8_19 = JSBI.multiply(f7, g8_19);
    let f7g9_38 = JSBI.multiply(f7_2, g9_19);
    let f8g0    = JSBI.multiply(f8, g0);
    let f8g1    = JSBI.multiply(f8, g1);
    let f8g2_19 = JSBI.multiply(f8, g2_19);
    let f8g3_19 = JSBI.multiply(f8, g3_19);
    let f8g4_19 = JSBI.multiply(f8, g4_19);
    let f8g5_19 = JSBI.multiply(f8, g5_19);
    let f8g6_19 = JSBI.multiply(f8, g6_19);
    let f8g7_19 = JSBI.multiply(f8, g7_19);
    let f8g8_19 = JSBI.multiply(f8, g8_19);
    let f8g9_19 = JSBI.multiply(f8, g9_19);
    let f9g0    = JSBI.multiply(f9, g0);
    let f9g1_38 = JSBI.multiply(f9_2, g1_19);
    let f9g2_19 = JSBI.multiply(f9, g2_19);
    let f9g3_38 = JSBI.multiply(f9_2, g3_19);
    let f9g4_19 = JSBI.multiply(f9, g4_19);
    let f9g5_38 = JSBI.multiply(f9_2, g5_19);
    let f9g6_19 = JSBI.multiply(f9, g6_19);
    let f9g7_38 = JSBI.multiply(f9_2, g7_19);
    let f9g8_19 = JSBI.multiply(f9, g8_19);
    let f9g9_38 = JSBI.multiply(f9_2, g9_19);

    let H: Array<JSBI> = [];
    let Carry: Array<JSBI> = [];

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        H.push(JSBI.BigInt(0));

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        Carry.push(JSBI.BigInt(0));

    H[0] = JSBIUtils.Sum([f0g0, f1g9_38, f2g8_19, f3g7_38, f4g6_19, f5g5_38, f6g4_19, f7g3_38, f8g2_19, f9g1_38]);
    H[1] = JSBIUtils.Sum([f0g1, f1g0, f2g9_19, f3g8_19, f4g7_19, f5g6_19, f6g5_19, f7g4_19, f8g3_19, f9g2_19]);
    H[2] = JSBIUtils.Sum([f0g2, f1g1_2, f2g0, f3g9_38, f4g8_19, f5g7_38, f6g6_19, f7g5_38, f8g4_19, f9g3_38]);
    H[3] = JSBIUtils.Sum([f0g3, f1g2, f2g1, f3g0, f4g9_19, f5g8_19, f6g7_19, f7g6_19, f8g5_19, f9g4_19]);
    H[4] = JSBIUtils.Sum([f0g4, f1g3_2, f2g2, f3g1_2, f4g0, f5g9_38, f6g8_19, f7g7_38, f8g6_19, f9g5_38]);
    H[5] = JSBIUtils.Sum([f0g5, f1g4, f2g3, f3g2, f4g1, f5g0, f6g9_19, f7g8_19, f8g7_19, f9g6_19]);
    H[6] = JSBIUtils.Sum([f0g6, f1g5_2, f2g4, f3g3_2, f4g2, f5g1_2, f6g0, f7g9_38, f8g8_19, f9g7_38]);
    H[7] = JSBIUtils.Sum([f0g7, f1g6, f2g5, f3g4, f4g3, f5g2, f6g1, f7g0, f8g9_19, f9g8_19]);
    H[8] = JSBIUtils.Sum([f0g8, f1g7_2, f2g6, f3g5_2, f4g4, f5g3_2, f6g2, f7g1_2, f8g0, f9g9_38]);
    H[9] = JSBIUtils.Sum([f0g9, f1g8, f2g7, f3g6, f4g5, f5g4, f6g3, f7g2, f8g1, f9g0]);

    let func25 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 25)), JSBI.BigInt(26));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 26)));
    }

    let func24 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    let func24_19 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], JSBI.multiply(Carry[i], JSBI.BigInt(19)));
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    /*
     |h0| <= (1.65*1.65*2^52*(1+19+19+19+19)+1.65*1.65*2^50*(38+38+38+38+38))
     i.e. |h0| <= 1.4*2^60; narrower ranges for h2, h4, h6, h8
     |h1| <= (1.65*1.65*2^51*(1+1+19+19+19+19+19+19+19+19))
     i.e. |h1| <= 1.7*2^59; narrower ranges for h3, h5, h7, h9
     */
    func25(0);
    func25(4);
    /* |h0| <= 2^25 */
    /* |h4| <= 2^25 */
    /* |h1| <= 1.71*2^59 */
    /* |h5| <= 1.71*2^59 */
    func24(1);
    func24(5);
    /* |h1| <= 2^24; from now on fits into int32 */
    /* |h5| <= 2^24; from now on fits into int32 */
    /* |h2| <= 1.41*2^60 */
    /* |h6| <= 1.41*2^60 */
    func25(2);
    func25(6);
    /* |h2| <= 2^25; from now on fits into int32 unchanged */
    /* |h6| <= 2^25; from now on fits into int32 unchanged */
    /* |h3| <= 1.71*2^59 */
    /* |h7| <= 1.71*2^59 */
    func24(3);
    func24(7);
    /* |h3| <= 2^24; from now on fits into int32 unchanged */
    /* |h7| <= 2^24; from now on fits into int32 unchanged */
    /* |h4| <= 1.72*2^34 */
    /* |h8| <= 1.41*2^60 */
    func25(4);
    func25(8);
    /* |h4| <= 2^25; from now on fits into int32 unchanged */
    /* |h8| <= 2^25; from now on fits into int32 unchanged */
    /* |h5| <= 1.01*2^24 */
    /* |h9| <= 1.71*2^59 */
    func24_19(9);
    /* |h9| <= 2^24; from now on fits into int32 unchanged */
    /* |h0| <= 1.1*2^39 */
    func25(0);
    /* |h0| <= 2^25; from now on fits into int32 unchanged */
    /* |h1| <= 1.01*2^24 */

    H.forEach((mh, i) => h.items[i] = JSBIUtils.toInt32(mh));
}

/**
 * h = f * f
 * Can overlap h with f.
 *
 * Preconditions:
 * |f| bounded by 1.65*2^26,1.65*2^25,1.65*2^26,1.65*2^25,etc.
 *
 * Postconditions:
 * |h| bounded by 1.01*2^25,1.01*2^24,1.01*2^25,1.01*2^24,etc.
 **/
export function fe25519_sq (h: FE25519, f: FE25519)
{
    let f0 = JSBI.BigInt(f.items[0]);
    let f1 = JSBI.BigInt(f.items[1]);
    let f2 = JSBI.BigInt(f.items[2]);
    let f3 = JSBI.BigInt(f.items[3]);
    let f4 = JSBI.BigInt(f.items[4]);
    let f5 = JSBI.BigInt(f.items[5]);
    let f6 = JSBI.BigInt(f.items[6]);
    let f7 = JSBI.BigInt(f.items[7]);
    let f8 = JSBI.BigInt(f.items[8]);
    let f9 = JSBI.BigInt(f.items[9]);

    let f0_2  = JSBI.multiply(JSBI.BigInt(2), f0);
    let f1_2  = JSBI.multiply(JSBI.BigInt(2), f1);
    let f2_2  = JSBI.multiply(JSBI.BigInt(2), f2);
    let f3_2  = JSBI.multiply(JSBI.BigInt(2), f3);
    let f4_2  = JSBI.multiply(JSBI.BigInt(2), f4);
    let f5_2  = JSBI.multiply(JSBI.BigInt(2), f5);
    let f6_2  = JSBI.multiply(JSBI.BigInt(2), f6);
    let f7_2  = JSBI.multiply(JSBI.BigInt(2), f7);
    let f5_38 = JSBI.multiply(JSBI.BigInt(38), f5); /* 1.959375*2^30 */
    let f6_19 = JSBI.multiply(JSBI.BigInt(19), f6); /* 1.959375*2^30 */
    let f7_38 = JSBI.multiply(JSBI.BigInt(38), f7); /* 1.959375*2^30 */
    let f8_19 = JSBI.multiply(JSBI.BigInt(19), f8); /* 1.959375*2^30 */
    let f9_38 = JSBI.multiply(JSBI.BigInt(38), f9); /* 1.959375*2^30 */

    let f0f0    = JSBI.multiply(f0, f0);
    let f0f1_2  = JSBI.multiply(f0_2, f1);
    let f0f2_2  = JSBI.multiply(f0_2, f2);
    let f0f3_2  = JSBI.multiply(f0_2, f3);
    let f0f4_2  = JSBI.multiply(f0_2, f4);
    let f0f5_2  = JSBI.multiply(f0_2, f5);
    let f0f6_2  = JSBI.multiply(f0_2, f6);
    let f0f7_2  = JSBI.multiply(f0_2, f7);
    let f0f8_2  = JSBI.multiply(f0_2, f8);
    let f0f9_2  = JSBI.multiply(f0_2, f9);
    let f1f1_2  = JSBI.multiply(f1_2, f1);
    let f1f2_2  = JSBI.multiply(f1_2, f2);
    let f1f3_4  = JSBI.multiply(f1_2, f3_2);
    let f1f4_2  = JSBI.multiply(f1_2, f4);
    let f1f5_4  = JSBI.multiply(f1_2, f5_2);
    let f1f6_2  = JSBI.multiply(f1_2, f6);
    let f1f7_4  = JSBI.multiply(f1_2, f7_2);
    let f1f8_2  = JSBI.multiply(f1_2, f8);
    let f1f9_76 = JSBI.multiply(f1_2, f9_38);
    let f2f2    = JSBI.multiply(f2, f2);
    let f2f3_2  = JSBI.multiply(f2_2, f3);
    let f2f4_2  = JSBI.multiply(f2_2, f4);
    let f2f5_2  = JSBI.multiply(f2_2, f5);
    let f2f6_2  = JSBI.multiply(f2_2, f6);
    let f2f7_2  = JSBI.multiply(f2_2, f7);
    let f2f8_38 = JSBI.multiply(f2_2, f8_19);
    let f2f9_38 = JSBI.multiply(f2, f9_38);
    let f3f3_2  = JSBI.multiply(f3_2, f3);
    let f3f4_2  = JSBI.multiply(f3_2, f4);
    let f3f5_4  = JSBI.multiply(f3_2, f5_2);
    let f3f6_2  = JSBI.multiply(f3_2, f6);
    let f3f7_76 = JSBI.multiply(f3_2, f7_38);
    let f3f8_38 = JSBI.multiply(f3_2, f8_19);
    let f3f9_76 = JSBI.multiply(f3_2, f9_38);
    let f4f4    = JSBI.multiply(f4, f4);
    let f4f5_2  = JSBI.multiply(f4_2, f5);
    let f4f6_38 = JSBI.multiply(f4_2, f6_19);
    let f4f7_38 = JSBI.multiply(f4, f7_38);
    let f4f8_38 = JSBI.multiply(f4_2, f8_19);
    let f4f9_38 = JSBI.multiply(f4, f9_38);
    let f5f5_38 = JSBI.multiply(f5, f5_38);
    let f5f6_38 = JSBI.multiply(f5_2, f6_19);
    let f5f7_76 = JSBI.multiply(f5_2, f7_38);
    let f5f8_38 = JSBI.multiply(f5_2, f8_19);
    let f5f9_76 = JSBI.multiply(f5_2, f9_38);
    let f6f6_19 = JSBI.multiply(f6, f6_19);
    let f6f7_38 = JSBI.multiply(f6, f7_38);
    let f6f8_38 = JSBI.multiply(f6_2, f8_19);
    let f6f9_38 = JSBI.multiply(f6, f9_38);
    let f7f7_38 = JSBI.multiply(f7, f7_38);
    let f7f8_38 = JSBI.multiply(f7_2, f8_19);
    let f7f9_76 = JSBI.multiply(f7_2, f9_38);
    let f8f8_19 = JSBI.multiply(f8, f8_19);
    let f8f9_38 = JSBI.multiply(f8, f9_38);
    let f9f9_38 = JSBI.multiply(f9, f9_38);

    let H: Array<JSBI> = [];
    let Carry: Array<JSBI> = [];

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        H.push(JSBI.BigInt(0));

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        Carry.push(JSBI.BigInt(0));

    H[0] = JSBIUtils.Sum([f0f0, f1f9_76, f2f8_38, f3f7_76, f4f6_38, f5f5_38]);
    H[1] = JSBIUtils.Sum([f0f1_2, f2f9_38, f3f8_38, f4f7_38, f5f6_38]);
    H[2] = JSBIUtils.Sum([f0f2_2, f1f1_2, f3f9_76, f4f8_38, f5f7_76, f6f6_19]);
    H[3] = JSBIUtils.Sum([f0f3_2, f1f2_2, f4f9_38, f5f8_38, f6f7_38]);
    H[4] = JSBIUtils.Sum([f0f4_2, f1f3_4, f2f2, f5f9_76, f6f8_38, f7f7_38]);
    H[5] = JSBIUtils.Sum([f0f5_2, f1f4_2, f2f3_2, f6f9_38, f7f8_38]);
    H[6] = JSBIUtils.Sum([f0f6_2, f1f5_4, f2f4_2, f3f3_2, f7f9_76, f8f8_19]);
    H[7] = JSBIUtils.Sum([f0f7_2, f1f6_2, f2f5_2, f3f4_2, f8f9_38]);
    H[8] = JSBIUtils.Sum([f0f8_2, f1f7_4, f2f6_2, f3f5_4, f4f4, f9f9_38]);
    H[9] = JSBIUtils.Sum([f0f9_2, f1f8_2, f2f7_2, f3f6_2, f4f5_2]);

    let func25 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 25)), JSBI.BigInt(26));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 26)));
    }

    let func24 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    let func24_19 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], JSBI.multiply(Carry[i], JSBI.BigInt(19)));
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    func25(0);
    func25(4);

    func24(1);
    func24(5);

    func25(2);
    func25(6);

    func24(3);
    func24(7);

    func25(4);
    func25(8);

    func24_19(9);
    func25(0);

    H.forEach((mh, i) => h.items[i] = JSBIUtils.toInt32(mh));
}

/**
 * h = 2 * f * f
 * Can overlap h with f.
 *
 * Preconditions:
 * |f| bounded by 1.65*2^26,1.65*2^25,1.65*2^26,1.65*2^25,etc.
 *
 * Postconditions:
 * |h| bounded by 1.01*2^25,1.01*2^24,1.01*2^25,1.01*2^24,etc.
 **/
export function fe25519_sq2 (h: FE25519, f: FE25519)
{
    let f0 = JSBI.BigInt(f.items[0]);
    let f1 = JSBI.BigInt(f.items[1]);
    let f2 = JSBI.BigInt(f.items[2]);
    let f3 = JSBI.BigInt(f.items[3]);
    let f4 = JSBI.BigInt(f.items[4]);
    let f5 = JSBI.BigInt(f.items[5]);
    let f6 = JSBI.BigInt(f.items[6]);
    let f7 = JSBI.BigInt(f.items[7]);
    let f8 = JSBI.BigInt(f.items[8]);
    let f9 = JSBI.BigInt(f.items[9]);

    let f0_2  = JSBI.multiply(JSBI.BigInt(2), f0);
    let f1_2  = JSBI.multiply(JSBI.BigInt(2), f1);
    let f2_2  = JSBI.multiply(JSBI.BigInt(2), f2);
    let f3_2  = JSBI.multiply(JSBI.BigInt(2), f3);
    let f4_2  = JSBI.multiply(JSBI.BigInt(2), f4);
    let f5_2  = JSBI.multiply(JSBI.BigInt(2), f5);
    let f6_2  = JSBI.multiply(JSBI.BigInt(2), f6);
    let f7_2  = JSBI.multiply(JSBI.BigInt(2), f7);
    let f5_38 = JSBI.multiply(JSBI.BigInt(38), f5); /* 1.959375*2^30 */
    let f6_19 = JSBI.multiply(JSBI.BigInt(19), f6); /* 1.959375*2^30 */
    let f7_38 = JSBI.multiply(JSBI.BigInt(38), f7); /* 1.959375*2^30 */
    let f8_19 = JSBI.multiply(JSBI.BigInt(19), f8); /* 1.959375*2^30 */
    let f9_38 = JSBI.multiply(JSBI.BigInt(38), f9); /* 1.959375*2^30 */

    let f0f0    = JSBI.multiply(f0, f0);
    let f0f1_2  = JSBI.multiply(f0_2, f1);
    let f0f2_2  = JSBI.multiply(f0_2, f2);
    let f0f3_2  = JSBI.multiply(f0_2, f3);
    let f0f4_2  = JSBI.multiply(f0_2, f4);
    let f0f5_2  = JSBI.multiply(f0_2, f5);
    let f0f6_2  = JSBI.multiply(f0_2, f6);
    let f0f7_2  = JSBI.multiply(f0_2, f7);
    let f0f8_2  = JSBI.multiply(f0_2, f8);
    let f0f9_2  = JSBI.multiply(f0_2, f9);
    let f1f1_2  = JSBI.multiply(f1_2, f1);
    let f1f2_2  = JSBI.multiply(f1_2, f2);
    let f1f3_4  = JSBI.multiply(f1_2, f3_2);
    let f1f4_2  = JSBI.multiply(f1_2, f4);
    let f1f5_4  = JSBI.multiply(f1_2, f5_2);
    let f1f6_2  = JSBI.multiply(f1_2, f6);
    let f1f7_4  = JSBI.multiply(f1_2, f7_2);
    let f1f8_2  = JSBI.multiply(f1_2, f8);
    let f1f9_76 = JSBI.multiply(f1_2, f9_38);
    let f2f2    = JSBI.multiply(f2, f2);
    let f2f3_2  = JSBI.multiply(f2_2, f3);
    let f2f4_2  = JSBI.multiply(f2_2, f4);
    let f2f5_2  = JSBI.multiply(f2_2, f5);
    let f2f6_2  = JSBI.multiply(f2_2, f6);
    let f2f7_2  = JSBI.multiply(f2_2, f7);
    let f2f8_38 = JSBI.multiply(f2_2, f8_19);
    let f2f9_38 = JSBI.multiply(f2, f9_38);
    let f3f3_2  = JSBI.multiply(f3_2, f3);
    let f3f4_2  = JSBI.multiply(f3_2, f4);
    let f3f5_4  = JSBI.multiply(f3_2, f5_2);
    let f3f6_2  = JSBI.multiply(f3_2, f6);
    let f3f7_76 = JSBI.multiply(f3_2, f7_38);
    let f3f8_38 = JSBI.multiply(f3_2, f8_19);
    let f3f9_76 = JSBI.multiply(f3_2, f9_38);
    let f4f4    = JSBI.multiply(f4, f4);
    let f4f5_2  = JSBI.multiply(f4_2, f5);
    let f4f6_38 = JSBI.multiply(f4_2, f6_19);
    let f4f7_38 = JSBI.multiply(f4, f7_38);
    let f4f8_38 = JSBI.multiply(f4_2, f8_19);
    let f4f9_38 = JSBI.multiply(f4, f9_38);
    let f5f5_38 = JSBI.multiply(f5, f5_38);
    let f5f6_38 = JSBI.multiply(f5_2, f6_19);
    let f5f7_76 = JSBI.multiply(f5_2, f7_38);
    let f5f8_38 = JSBI.multiply(f5_2, f8_19);
    let f5f9_76 = JSBI.multiply(f5_2, f9_38);
    let f6f6_19 = JSBI.multiply(f6, f6_19);
    let f6f7_38 = JSBI.multiply(f6, f7_38);
    let f6f8_38 = JSBI.multiply(f6_2, f8_19);
    let f6f9_38 = JSBI.multiply(f6, f9_38);
    let f7f7_38 = JSBI.multiply(f7, f7_38);
    let f7f8_38 = JSBI.multiply(f7_2, f8_19);
    let f7f9_76 = JSBI.multiply(f7_2, f9_38);
    let f8f8_19 = JSBI.multiply(f8, f8_19);
    let f8f9_38 = JSBI.multiply(f8, f9_38);
    let f9f9_38 = JSBI.multiply(f9, f9_38);

    let H: Array<JSBI> = [];
    let Carry: Array<JSBI> = [];

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        H.push(JSBI.BigInt(0));

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        Carry.push(JSBI.BigInt(0));

    H[0] = JSBIUtils.Sum([f0f0, f1f9_76, f2f8_38, f3f7_76, f4f6_38, f5f5_38]);
    H[1] = JSBIUtils.Sum([f0f1_2, f2f9_38, f3f8_38, f4f7_38, f5f6_38]);
    H[2] = JSBIUtils.Sum([f0f2_2, f1f1_2, f3f9_76, f4f8_38, f5f7_76, f6f6_19]);
    H[3] = JSBIUtils.Sum([f0f3_2, f1f2_2, f4f9_38, f5f8_38, f6f7_38]);
    H[4] = JSBIUtils.Sum([f0f4_2, f1f3_4, f2f2, f5f9_76, f6f8_38, f7f7_38]);
    H[5] = JSBIUtils.Sum([f0f5_2, f1f4_2, f2f3_2, f6f9_38, f7f8_38]);
    H[6] = JSBIUtils.Sum([f0f6_2, f1f5_4, f2f4_2, f3f3_2, f7f9_76, f8f8_19]);
    H[7] = JSBIUtils.Sum([f0f7_2, f1f6_2, f2f5_2, f3f4_2, f8f9_38]);
    H[8] = JSBIUtils.Sum([f0f8_2, f1f7_4, f2f6_2, f3f5_4, f4f4, f9f9_38]);
    H[9] = JSBIUtils.Sum([f0f9_2, f1f8_2, f2f7_2, f3f6_2, f4f5_2]);

    let func25 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 25)), JSBI.BigInt(26));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 26)));
    }

    let func24 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    let func24_19 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], JSBI.multiply(Carry[i], JSBI.BigInt(19)));
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    for (let i = 0; i < FE25519.WIDTH; i++)
        H[i] = JSBI.add(H[i], H[i]);

    func25(0);
    func25(4);

    func24(1);
    func24(5);

    func25(2);
    func25(6);

    func24(3);
    func24(7);

    func25(4);
    func25(8);

    func24_19(9);
    func25(0);

    H.forEach((mh, i) => h.items[i] = JSBIUtils.toInt32(mh));
}

export function fe25519_mul32 (h: FE25519, f: FE25519, n: number)
{
    let sn = JSBI.BigInt(n);
    let f0 = JSBI.BigInt(f.items[0]);
    let f1 = JSBI.BigInt(f.items[1]);
    let f2 = JSBI.BigInt(f.items[2]);
    let f3 = JSBI.BigInt(f.items[3]);
    let f4 = JSBI.BigInt(f.items[4]);
    let f5 = JSBI.BigInt(f.items[5]);
    let f6 = JSBI.BigInt(f.items[6]);
    let f7 = JSBI.BigInt(f.items[7]);
    let f8 = JSBI.BigInt(f.items[8]);
    let f9 = JSBI.BigInt(f.items[9]);

    let H: Array<JSBI> = [];
    let Carry: Array<JSBI> = [];

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        H.push(JSBI.BigInt(0));

    for (let idx = 0; idx < FE25519.WIDTH; idx++)
        Carry.push(JSBI.BigInt(0));

    H[0] = JSBI.multiply(f0, sn);
    H[1] = JSBI.multiply(f1, sn);
    H[2] = JSBI.multiply(f2, sn);
    H[3] = JSBI.multiply(f3, sn);
    H[4] = JSBI.multiply(f4, sn);
    H[5] = JSBI.multiply(f5, sn);
    H[6] = JSBI.multiply(f6, sn);
    H[7] = JSBI.multiply(f7, sn);
    H[8] = JSBI.multiply(f8, sn);
    H[9] = JSBI.multiply(f9, sn);

    let func25 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 25)), JSBI.BigInt(26));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 26)));
    }

    let func24 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], Carry[i]);
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    let func24_19 = (i: number) =>
    {
        let j = (i+1) % FE25519.WIDTH;
        Carry[i] = JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
        H[j] = JSBI.add(H[j], JSBI.multiply(Carry[i], JSBI.BigInt(19)));
        H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
    }

    func24_19(9);
    func24(1);
    func24(3);
    func24(5);
    func24(7);

    func25(0);
    func25(2);
    func25(4);
    func25(6);
    func25(8);

    H.forEach((mh, i) => h.items[i] = JSBIUtils.toInt32(mh));
}

export function fe25519_sqmul (s: FE25519, n : number, a: FE25519)
{
    let i;
    for (i = 0; i < n; i++) {
        fe25519_sq(s, s);
    }
    fe25519_mul(s, s, a);
}

/**
 * Inversion - returns 0 if z=0
 **/
export function fe25519_invert (out: FE25519, z: FE25519)
{
    let t0 = new FE25519();
    let t1 = new FE25519();
    let t2 = new FE25519();
    let t3 = new FE25519();
    let i: number;

    fe25519_sq(t0, z);
    fe25519_sq(t1, t0);
    fe25519_sq(t1, t1);
    fe25519_mul(t1, z, t1);
    fe25519_mul(t0, t0, t1);
    fe25519_sq(t2, t0);
    fe25519_mul(t1, t1, t2);
    fe25519_sq(t2, t1);
    for (i = 1; i < 5; ++i) {
        fe25519_sq(t2, t2);
    }
    fe25519_mul(t1, t2, t1);
    fe25519_sq(t2, t1);
    for (i = 1; i < 10; ++i) {
        fe25519_sq(t2, t2);
    }
    fe25519_mul(t2, t2, t1);
    fe25519_sq(t3, t2);
    for (i = 1; i < 20; ++i) {
        fe25519_sq(t3, t3);
    }
    fe25519_mul(t2, t3, t2);
    for (i = 1; i < 11; ++i) {
        fe25519_sq(t2, t2);
    }
    fe25519_mul(t1, t2, t1);
    fe25519_sq(t2, t1);
    for (i = 1; i < 50; ++i) {
        fe25519_sq(t2, t2);
    }
    fe25519_mul(t2, t2, t1);
    fe25519_sq(t3, t2);
    for (i = 1; i < 100; ++i) {
        fe25519_sq(t3, t3);
    }
    fe25519_mul(t2, t3, t2);
    for (i = 1; i < 51; ++i) {
        fe25519_sq(t2, t2);
    }
    fe25519_mul(t1, t2, t1);
    for (i = 1; i < 6; ++i) {
        fe25519_sq(t1, t1);
    }
    fe25519_mul(out, t1, t0);
}

/**
 * returns z^((p-5)/8) = z^(2^252-3)
 * used to compute square roots since we have p=5 (mod 8); see Cohen and Frey.
 **/
export function fe25519_pow22523 (out: FE25519, z: FE25519)
{
    let t0 = new FE25519();
    let t1 = new FE25519();
    let t2 = new FE25519();
    let i: number;

    fe25519_sq(t0, z);
    fe25519_sq(t1, t0);
    fe25519_sq(t1, t1);
    fe25519_mul(t1, z, t1);
    fe25519_mul(t0, t0, t1);
    fe25519_sq(t0, t0);
    fe25519_mul(t0, t1, t0);
    fe25519_sq(t1, t0);
    for (i = 1; i < 5; ++i) {
        fe25519_sq(t1, t1);
    }
    fe25519_mul(t0, t1, t0);
    fe25519_sq(t1, t0);
    for (i = 1; i < 10; ++i) {
        fe25519_sq(t1, t1);
    }
    fe25519_mul(t1, t1, t0);
    fe25519_sq(t2, t1);
    for (i = 1; i < 20; ++i) {
        fe25519_sq(t2, t2);
    }
    fe25519_mul(t1, t2, t1);
    for (i = 1; i < 11; ++i) {
        fe25519_sq(t1, t1);
    }
    fe25519_mul(t0, t1, t0);
    fe25519_sq(t1, t0);
    for (i = 1; i < 50; ++i) {
        fe25519_sq(t1, t1);
    }
    fe25519_mul(t1, t1, t0);
    fe25519_sq(t2, t1);
    for (i = 1; i < 100; ++i) {
        fe25519_sq(t2, t2);
    }
    fe25519_mul(t1, t2, t1);
    for (i = 1; i < 51; ++i) {
        fe25519_sq(t1, t1);
    }
    fe25519_mul(t0, t1, t0);
    fe25519_sq(t0, t0);
    fe25519_sq(t0, t0);
    fe25519_mul(out, t0, z);
}

export function fe25519_cneg (h: FE25519, f: FE25519, b: number)
{
    let negf = new FE25519();

    fe25519_neg(negf, f);
    fe25519_copy(h, f);
    fe25519_cmov(h, negf, b);
}

export function fe25519_abs (h: FE25519, f: FE25519)
{
    fe25519_cneg(h, f, fe25519_isnegative(f));
}

export function fe25519_unchecked_sqrt (x: FE25519, x2: FE25519)
{
    let p_root = new FE25519();
    let m_root = new FE25519();
    let m_root2 = new FE25519();
    let e = new FE25519();

    fe25519_pow22523(e, x2);
    fe25519_mul(p_root, e, x2);
    fe25519_mul(m_root, p_root, fe25519_sqrtm1);
    fe25519_sq(m_root2, m_root);
    fe25519_sub(e, x2, m_root2);
    fe25519_copy(x, p_root);
    fe25519_cmov(x, m_root, fe25519_iszero(e));
}

export function fe25519_sqrt (x: FE25519, x2: FE25519): number
{
    let check = new FE25519();
    let x2_copy = new FE25519();

    fe25519_copy(x2_copy, x2);
    fe25519_unchecked_sqrt(x, x2);
    fe25519_sq(check, x);
    fe25519_sub(check, check, x2_copy);

    return fe25519_iszero(check) - 1;
}

export function fe25519_notsquare (x: FE25519): number
{
    let _10 = new FE25519();
    let _11 = new FE25519();
    let _1100 = new FE25519();
    let _1111 = new FE25519();
    let _11110000 = new FE25519();
    let _11111111 = new FE25519();

    let t = new FE25519();
    let u = new FE25519();
    let v = new FE25519();

    /* Jacobi symbol - x^((p-1)/2) */
    fe25519_mul(_10, x, x);
    fe25519_mul(_11, x, _10);
    fe25519_sq(_1100, _11);
    fe25519_sq(_1100, _1100);
    fe25519_mul(_1111, _11, _1100);
    fe25519_sq(_11110000, _1111);
    fe25519_sq(_11110000, _11110000);
    fe25519_sq(_11110000, _11110000);
    fe25519_sq(_11110000, _11110000);
    fe25519_mul(_11111111, _1111, _11110000);
    fe25519_copy(t, _11111111);
    fe25519_sqmul(t, 2, _11);
    fe25519_copy(u, t);
    fe25519_sqmul(t, 10, u);
    fe25519_sqmul(t, 10, u);
    fe25519_copy(v, t);
    fe25519_sqmul(t, 30, v);
    fe25519_copy(v, t);
    fe25519_sqmul(t, 60, v);
    fe25519_copy(v, t);
    fe25519_sqmul(t, 120, v);
    fe25519_sqmul(t, 10, u);
    fe25519_sqmul(t, 3, _11);
    fe25519_sq(t, t);

    let s = new Uint8Array(32);
    fe25519_tobytes(s, t);

    return s[1] & 1;
}

export function ge25519_add_cached (r: GE25519_P1P1, p: GE25519_P3, q: GE25519_Cached)
{
    let t0 = new FE25519();

    fe25519_add(r.X, p.Y, p.X);
    fe25519_sub(r.Y, p.Y, p.X);
    fe25519_mul(r.Z, r.X, q.YplusX);
    fe25519_mul(r.Y, r.Y, q.YminusX);
    fe25519_mul(r.T, q.T2d, p.T);
    fe25519_mul(r.X, p.Z, q.Z);
    fe25519_add(t0, r.X, r.X);
    fe25519_sub(r.X, r.Z, r.Y);
    fe25519_add(r.Y, r.Z, r.Y);
    fe25519_add(r.Z, t0, r.T);
    fe25519_sub(r.T, t0, r.T);
}

export function ge25519_sub_cached(r: GE25519_P1P1, p: GE25519_P3, q: GE25519_Cached)
{
    let t0 = new FE25519();

    fe25519_add(r.X, p.Y, p.X);
    fe25519_sub(r.Y, p.Y, p.X);
    fe25519_mul(r.Z, r.X, q.YminusX);
    fe25519_mul(r.Y, r.Y, q.YplusX);
    fe25519_mul(r.T, q.T2d, p.T);
    fe25519_mul(r.X, p.Z, q.Z);
    fe25519_add(t0, r.X, r.X);
    fe25519_sub(r.X, r.Z, r.Y);
    fe25519_add(r.Y, r.Z, r.Y);
    fe25519_sub(r.Z, t0, r.T);
    fe25519_add(r.T, t0, r.T);
}

export function ge25519_frombytes (h: GE25519_P3, s: Uint8Array)
{
    let u = new FE25519();
    let v = new FE25519();
    let v3 = new FE25519();
    let vxx = new FE25519();
    let m_root_check = new FE25519();
    let p_root_check = new FE25519();
    let negx = new FE25519();
    let x_sqrtm1 = new FE25519();
    let has_m_root: number;
    let has_p_root: number;

    fe25519_frombytes(h.Y, s);
    fe25519_1(h.Z);
    fe25519_sq(u, h.Y);
    fe25519_mul(v, u, ed25519_d);
    fe25519_sub(u, u, h.Z); /* u = y^2-1 */
    fe25519_add(v, v, h.Z); /* v = dy^2+1 */

    fe25519_sq(v3, v);
    fe25519_mul(v3, v3, v); /* v3 = v^3 */
    fe25519_sq(h.X, v3);
    fe25519_mul(h.X, h.X, v);
    fe25519_mul(h.X, h.X, u); /* x = uv^7 */

    fe25519_pow22523(h.X, h.X); /* x = (uv^7)^((q-5)/8) */
    fe25519_mul(h.X, h.X, v3);
    fe25519_mul(h.X, h.X, u); /* x = uv^3(uv^7)^((q-5)/8) */

    fe25519_sq(vxx, h.X);
    fe25519_mul(vxx, vxx, v);
    fe25519_sub(m_root_check, vxx, u); /* vx^2-u */
    fe25519_add(p_root_check, vxx, u); /* vx^2+u */
    has_m_root = fe25519_iszero(m_root_check);
    has_p_root = fe25519_iszero(p_root_check);
    fe25519_mul(x_sqrtm1, h.X, fe25519_sqrtm1); /* x*sqrt(-1) */
    fe25519_cmov(h.X, x_sqrtm1, 1 - has_m_root);

    fe25519_neg(negx, h.X);
    fe25519_cmov(h.X, negx, fe25519_isnegative(h.X) ^ (s[31] >> 7));
    fe25519_mul(h.T, h.X, h.Y);

    return (has_m_root | has_p_root) - 1;
}

/* montgomery to edwards */
export function ge25519_mont_to_ed (xed: FE25519, yed: FE25519, x: FE25519, y: FE25519)
{
    let one = new FE25519();
    let x_plus_one = new FE25519();
    let x_minus_one = new FE25519();
    let x_plus_one_y_inv = new FE25519();

    fe25519_1(one);
    fe25519_add(x_plus_one, x, one);
    fe25519_sub(x_minus_one, x, one);

    /* xed = sqrt(-A-2)*x/y */
    fe25519_mul(x_plus_one_y_inv, x_plus_one, y);
    fe25519_invert(x_plus_one_y_inv, x_plus_one_y_inv); /* 1/((x+1)*y) */
    fe25519_mul(xed, x, ed25519_sqrtam2);
    fe25519_mul(xed, xed, x_plus_one_y_inv);            /* sqrt(-A-2)*x/((x+1)*y) */
    fe25519_mul(xed, xed, x_plus_one);

    /* yed = (x-1)/(x+1) */
    fe25519_mul(yed, x_plus_one_y_inv, y);              /* 1/(x+1) */
    fe25519_mul(yed, yed, x_minus_one);
    fe25519_cmov(yed, one, fe25519_iszero(x_plus_one_y_inv));
}

export function ge25519_xmont_to_ymont (y: FE25519, /* const */ x: FE25519): number
{
    let x2 = new FE25519();
    let x3 = new FE25519();

    fe25519_sq(x2, x);
    fe25519_mul(x3, x, x2);
    fe25519_mul32(x2, x2, ed25519_A_32);
    fe25519_add(y, x3, x);
    fe25519_add(y, y, x2);

    return fe25519_sqrt(y, y);
}

export function ge25519_p1p1_to_p2 (r: GE25519_P2, p: GE25519_P1P1)
{
    fe25519_mul(r.X, p.X, p.T);
    fe25519_mul(r.Y, p.Y, p.Z);
    fe25519_mul(r.Z, p.Z, p.T);
}

export function ge25519_p1p1_to_p3 (r: GE25519_P3, p: GE25519_P1P1)
{
    fe25519_mul(r.X, p.X, p.T);
    fe25519_mul(r.Y, p.Y, p.Z);
    fe25519_mul(r.Z, p.Z, p.T);
    fe25519_mul(r.T, p.X, p.Y);
}

export function ge25519_p2_0 (h: GE25519_P2)
{
    fe25519_0(h.X);
    fe25519_1(h.Y);
    fe25519_1(h.Z);
}

export function ge25519_p2_dbl (r: GE25519_P1P1, p: GE25519_P2)
{
    let t0 = new FE25519();

    fe25519_sq(r.X, p.X);
    fe25519_sq(r.Z, p.Y);
    fe25519_sq2(r.T, p.Z);
    fe25519_add(r.Y, p.X, p.Y);
    fe25519_sq(t0, r.Y);
    fe25519_add(r.Y, r.Z, r.X);
    fe25519_sub(r.Z, r.Z, r.X);
    fe25519_sub(r.X, t0, r.Y);
    fe25519_sub(r.T, r.T, r.Z);
}

export function ge25519_p3_0 (h: GE25519_P3)
{
    fe25519_0(h.X);
    fe25519_1(h.Y);
    fe25519_1(h.Z);
    fe25519_0(h.T);
}

export function ge25519_p3_to_cached (r: GE25519_Cached, p: GE25519_P3)
{
    fe25519_add(r.YplusX, p.Y, p.X);
    fe25519_sub(r.YminusX, p.Y, p.X);
    fe25519_copy(r.Z, p.Z);
    fe25519_mul(r.T2d, p.T, ed25519_d2);
}

export function ge25519_p3_to_p2 (r: GE25519_P2, p: GE25519_P3)
{
    fe25519_copy(r.X, p.X);
    fe25519_copy(r.Y, p.Y);
    fe25519_copy(r.Z, p.Z);
}

export function ge25519_p3_tobytes (s: Uint8Array, h: GE25519_P3)
{
    let recip = new FE25519();
    let x = new FE25519();
    let y = new FE25519();

    fe25519_invert(recip, h.Z);
    fe25519_mul(x, h.X, recip);
    fe25519_mul(y, h.Y, recip);
    fe25519_tobytes(s, y);
    s[31] ^= fe25519_isnegative(x) << 7;
}

export function ge25519_p3_dbl (r: GE25519_P1P1, p: GE25519_P3)
{
    let q = new GE25519_P2();
    ge25519_p3_to_p2(q, p);
    ge25519_p2_dbl(r, q);
}

export function ge25519_clear_cofactor (p3: GE25519_P3)
{
    let p1 = new GE25519_P1P1();
    let p2 = new GE25519_P2();

    ge25519_p3_dbl(p1, p3);
    ge25519_p1p1_to_p2(p2, p1);
    ge25519_p2_dbl(p1, p2);
    ge25519_p1p1_to_p2(p2, p1);
    ge25519_p2_dbl(p1, p2);
    ge25519_p1p1_to_p3(p3, p1);
}

export function ge25519_elligator2 (x: FE25519, y: FE25519, r: FE25519): number
{
    let gx1 = new FE25519();
    let rr2 = new FE25519();
    let x2 = new FE25519();
    let x3 = new FE25519();
    let negx = new FE25519();
    let notsquare: number;

    fe25519_sq2(rr2, r);
    rr2.items[0] = rr2.items[0] + 1;
    fe25519_invert(rr2, rr2);
    fe25519_mul32(x, rr2, ed25519_A_32);
    fe25519_neg(x, x); /* x=x1 */

    fe25519_sq(x2, x);
    fe25519_mul(x3, x, x2);
    fe25519_mul32(x2, x2, ed25519_A_32); /* x2 = A*x1^2 */
    fe25519_add(gx1, x3, x);
    fe25519_add(gx1, gx1, x2); /* gx1 = x1^3 + A*x1^2 + x1 */

    notsquare = fe25519_notsquare(gx1);

    /* gx1 not a square  => x = -x1-A */
    fe25519_neg(negx, x);
    fe25519_cmov(x, negx, notsquare);
    fe25519_0(x2);
    fe25519_cmov(x2, ed25519_A, notsquare);
    fe25519_sub(x, x, x2);

    /* y = sqrt(gx1) or sqrt(gx2) with gx2 = gx1 * (A+x1) / -x1 */
    /* but it is about as fast to just recompute from the curve equation. */
    if (ge25519_xmont_to_ymont(y, x) != 0) {
        throw new Error("An error occurred")
    }

    return notsquare;
}

export function ge25519_from_uniform (s: Uint8Array, r: Uint8Array)
{
    let p3 = new GE25519_P3();
    let x = new FE25519();
    let y = new FE25519();
    let negxed = new FE25519();
    let r_fe = new FE25519();
    let x_sign: number;

    for (let idx = 0; idx < 32; idx++)
        s[idx] = r[idx];

    x_sign = s[31] >> 7;
    s[31] &= 0x7f;

    fe25519_frombytes(r_fe, s);

    ge25519_elligator2(x, y, r_fe);

    ge25519_mont_to_ed(p3.X, p3.Y, x, y);
    fe25519_neg(negxed, p3.X);
    fe25519_cmov(p3.X, negxed, fe25519_isnegative(p3.X) ^ x_sign);

    fe25519_1(p3.Z);
    fe25519_mul(p3.T, p3.X, p3.Y);

    ge25519_clear_cofactor(p3);
    ge25519_p3_tobytes(s, p3);
}

/* r = 2p */
export function ge25519_p3p3_dbl (r: GE25519_P3, p: GE25519_P3)
{
    let p1p1 = new GE25519_P1P1();

    ge25519_p3_dbl(p1p1, p);
    ge25519_p1p1_to_p3(r, p1p1);
}

/* r = p+q */
export function ge25519_p3_add (r: GE25519_P3, p: GE25519_P3, q: GE25519_P3)
{
    let q_cached = new GE25519_Cached();
    let p1p1 = new GE25519_P1P1();

    ge25519_p3_to_cached(q_cached, q);
    ge25519_add_cached(p1p1, p, q_cached);
    ge25519_p1p1_to_p3(r, p1p1);
}

/* r = r*(2^n)+q */
export function ge25519_p3_dbladd (r: GE25519_P3, n: number, q: GE25519_P3)
{
    let p2 = new GE25519_P3();
    let p1p1 = new GE25519_P1P1() ;
    let i: number;

    ge25519_p3_to_p2(p2, r);
    for (i = 0; i < n; i++) {
        ge25519_p2_dbl(p1p1, p2);
        ge25519_p1p1_to_p2(p2, p1p1);
    }
    ge25519_p1p1_to_p3(r, p1p1);
    ge25519_p3_add(r, r, q);
}

/* multiply by the order of the main subgroup l = 2^252+27742317777372353535851937790883648493 */
export function ge25519_mul_l (r: GE25519_P3, p: GE25519_P3)
{
    let _10 = new GE25519_P3();
    let _11 = new GE25519_P3();
    let _100 = new GE25519_P3();
    let _110 = new GE25519_P3();
    let _1000 = new GE25519_P3();
    let _1011 = new GE25519_P3();
    let _10000 = new GE25519_P3();
    let _100000 = new GE25519_P3();
    let _100110 = new GE25519_P3();
    let _1000000 = new GE25519_P3();
    let _1010000 = new GE25519_P3();
    let _1010011 = new GE25519_P3();
    let _1100011 = new GE25519_P3();
    let _1100111 = new GE25519_P3();
    let _1101011 = new GE25519_P3();
    let _10010011 = new GE25519_P3();
    let _10010111 = new GE25519_P3();
    let _10111101 = new GE25519_P3();
    let _11010011 = new GE25519_P3();
    let _11100111 = new GE25519_P3();
    let _11101101 = new GE25519_P3();
    let _11110101 = new GE25519_P3();

    ge25519_p3p3_dbl(_10, p);
    ge25519_p3_add(_11, p, _10);
    ge25519_p3_add(_100, p, _11);
    ge25519_p3_add(_110, _10, _100);
    ge25519_p3_add(_1000, _10, _110);
    ge25519_p3_add(_1011, _11, _1000);
    ge25519_p3p3_dbl(_10000, _1000);
    ge25519_p3p3_dbl(_100000, _10000);
    ge25519_p3_add(_100110, _110, _100000);
    ge25519_p3p3_dbl(_1000000, _100000);
    ge25519_p3_add(_1010000, _10000, _1000000);
    ge25519_p3_add(_1010011, _11, _1010000);
    ge25519_p3_add(_1100011, _10000, _1010011);
    ge25519_p3_add(_1100111, _100, _1100011);
    ge25519_p3_add(_1101011, _100, _1100111);
    ge25519_p3_add(_10010011, _1000000, _1010011);
    ge25519_p3_add(_10010111, _100, _10010011);
    ge25519_p3_add(_10111101, _100110, _10010111);
    ge25519_p3_add(_11010011, _1000000, _10010011);
    ge25519_p3_add(_11100111, _1010000, _10010111);
    ge25519_p3_add(_11101101, _110, _11100111);
    ge25519_p3_add(_11110101, _1000, _11101101);

    ge25519_p3_add(r, _1011, _11110101);
    ge25519_p3_dbladd(r, 126, _1010011);
    ge25519_p3_dbladd(r, 9, _10);
    ge25519_p3_add(r, r, _11110101);
    ge25519_p3_dbladd(r, 7, _1100111);
    ge25519_p3_dbladd(r, 9, _11110101);
    ge25519_p3_dbladd(r, 11, _10111101);
    ge25519_p3_dbladd(r, 8, _11100111);
    ge25519_p3_dbladd(r, 9, _1101011);
    ge25519_p3_dbladd(r, 6, _1011);
    ge25519_p3_dbladd(r, 14, _10010011);
    ge25519_p3_dbladd(r, 10, _1100011);
    ge25519_p3_dbladd(r, 9, _10010111);
    ge25519_p3_dbladd(r, 10, _11110101);
    ge25519_p3_dbladd(r, 8, _11010011);
    ge25519_p3_dbladd(r, 8, _11101101);
}

export function ge25519_is_on_curve (p: GE25519_P3): number
{
    let x2 = new FE25519();
    let y2 = new FE25519();
    let z2 = new FE25519();
    let z4 = new FE25519();
    let t0 = new FE25519();
    let t1 = new FE25519();

    fe25519_sq(x2, p.X);
    fe25519_sq(y2, p.Y);
    fe25519_sq(z2, p.Z);
    fe25519_sub(t0, y2, x2);
    fe25519_mul(t0, t0, z2);

    fe25519_mul(t1, x2, y2);
    fe25519_mul(t1, t1, ed25519_d);
    fe25519_sq(z4, z2);
    fe25519_add(t1, t1, z4);
    fe25519_sub(t0, t0, t1);

    return fe25519_iszero(t0);
}

export function ge25519_is_on_main_subgroup (p: GE25519_P3): number
{
    let pl = new GE25519_P3();

    ge25519_mul_l(pl, p);

    return fe25519_iszero(pl.X);
}

export function ge25519_is_canonical (s: Uint8Array): number
{
    let c: number;
    let d: number;
    let i: number;
    let s0: number = s[0];
    let s31: number = s[31];

    c = ((s31 & 0x7f) ^ 0x7f) & 0xff;
    for (i = 30; i > 0; i--) {
        c = (c | (s[i] ^ 0xff)) & 0xff;
    }
    c = ((c) - 1) >> 8;
    d = ((0xed - 1 - s0) >> 8) & 0xff;

    return 1 - (c & d & 1);
}

export function ge25519_has_small_order (s: Uint8Array): number
{
    let block_list: Array<Uint8Array> = [

        /* 0 (order 4) */
        new Uint8Array([
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]),

        /* 1 (order 1) */
        new Uint8Array([
            0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]),

        /* 2707385501144840649318225287225658788936804267575313519463743609750303402022
           (order 8) */
        new Uint8Array([
            0x26, 0xe8, 0x95, 0x8f, 0xc2, 0xb2, 0x27, 0xb0, 0x45, 0xc3, 0xf4,
            0x89, 0xf2, 0xef, 0x98, 0xf0, 0xd5, 0xdf, 0xac, 0x05, 0xd3, 0xc6,
            0x33, 0x39, 0xb1, 0x38, 0x02, 0x88, 0x6d, 0x53, 0xfc, 0x05 ]),

        /* 55188659117513257062467267217118295137698188065244968500265048394206261417927
           (order 8) */
        new Uint8Array([
            0xc7, 0x17, 0x6a, 0x70, 0x3d, 0x4d, 0xd8, 0x4f, 0xba, 0x3c, 0x0b,
            0x76, 0x0d, 0x10, 0x67, 0x0f, 0x2a, 0x20, 0x53, 0xfa, 0x2c, 0x39,
            0xcc, 0xc6, 0x4e, 0xc7, 0xfd, 0x77, 0x92, 0xac, 0x03, 0x7a ]),

        /* p-1 (order 2) */
        new Uint8Array([
            0xec, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f ]),

        /* p (=0, order 4) */
        new Uint8Array([
            0xed, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f ]),

        /* p+1 (=1, order 1) */
        new Uint8Array([
            0xee, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f ])
    ];

    let c = new Uint8Array([0, 0, 0, 0, 0, 0, 0]);
    let k: number;
    let i: number, j : number;

    for (j = 0; j < 31; j++) {
        for (i = 0; i < 7; i++) {
            c[i] |= s[j] ^ block_list[i][j];
        }
    }

    for (i = 0; i < 7; i++) {
        c[i] |= (s[j] & 0x7f) ^ block_list[i][j];
    }
    k = 0;
    for (i = 0; i < 7; i++) {
        k |= (c[i] - 1);
    }
    return ((k >> 8) & 1);
}

/*
 Input:
 a[0]+256*a[1]+...+256^31*a[31] = a
 b[0]+256*b[1]+...+256^31*b[31] = b
 *
 Output:
 s[0]+256*s[1]+...+256^31*s[31] = (ab) mod l
 where l = 2^252 + 27742317777372353535851937790883648493.
 */
export function sc25519_mul (s: Uint8Array, a: Uint8Array, b: Uint8Array)
{
    let a0  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), load_3(a, 0));
    let a1  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(a,  2), JSBI.BigInt(5)));
    let a2  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_3(a,  5), JSBI.BigInt(2)));
    let a3  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(a,  5), JSBI.BigInt(7)));
    let a4  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(a, 10), JSBI.BigInt(4)));
    let a5  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_3(a, 13), JSBI.BigInt(1)));
    let a6  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(a, 15), JSBI.BigInt(6)));
    let a7  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_3(a, 18), JSBI.BigInt(3)));
    let a8  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), load_3(a, 21));
    let a9  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(a, 23), JSBI.BigInt(5)));
    let a10 = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_3(a, 26), JSBI.BigInt(2)));
    let a11 = JSBI.signedRightShift(load_4(a,28), JSBI.BigInt(7));

    let b0  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), load_3(b, 0));
    let b1  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(b,  2), JSBI.BigInt(5)));
    let b2  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_3(b,  5), JSBI.BigInt(2)));
    let b3  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(b,  5), JSBI.BigInt(7)));
    let b4  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(b, 10), JSBI.BigInt(4)));
    let b5  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_3(b, 13), JSBI.BigInt(1)));
    let b6  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(b, 15), JSBI.BigInt(6)));
    let b7  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_3(b, 18), JSBI.BigInt(3)));
    let b8  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), load_3(b, 21));
    let b9  = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_4(b, 23), JSBI.BigInt(5)));
    let b10 = JSBI.bitwiseAnd(JSBI.BigInt(2097151), JSBI.signedRightShift(load_3(b, 26), JSBI.BigInt(2)));
    let b11 = JSBI.signedRightShift(load_4(b,28), JSBI.BigInt(7));

    let carry0;
    let carry1;
    let carry2;
    let carry3;
    let carry4;
    let carry5;
    let carry6;
    let carry7;
    let carry8;
    let carry9;
    let carry10;
    let carry11;
    let carry12;
    let carry13;
    let carry14;
    let carry15;
    let carry16;
    let carry17;
    let carry18;
    let carry19;
    let carry20;
    let carry21;
    let carry22;

    let s0  = JSBIUtils.SumMultiply([a0, b0]);
    let s1  = JSBIUtils.SumMultiply([a0, b1, a1, b0]);
    let s2  = JSBIUtils.SumMultiply([a0, b2, a1, b1, a2, b0]);
    let s3  = JSBIUtils.SumMultiply([a0, b3, a1, b2, a2, b1, a3, b0]);
    let s4  = JSBIUtils.SumMultiply([a0, b4, a1, b3, a2, b2, a3, b1, a4, b0]);
    let s5  = JSBIUtils.SumMultiply([a0, b5, a1, b4, a2, b3, a3, b2, a4, b1, a5, b0]);
    let s6  = JSBIUtils.SumMultiply([a0, b6, a1, b5, a2, b4, a3, b3, a4, b2, a5, b1, a6, b0]);
    let s7  = JSBIUtils.SumMultiply([a0, b7, a1, b6, a2, b5, a3, b4, a4, b3, a5, b2, a6, b1, a7, b0]);
    let s8  = JSBIUtils.SumMultiply([a0, b8, a1, b7, a2, b6, a3, b5, a4, b4, a5, b3, a6, b2, a7, b1, a8, b0]);
    let s9  = JSBIUtils.SumMultiply([a0, b9, a1, b8, a2, b7, a3, b6, a4, b5, a5, b4, a6, b3, a7, b2, a8, b1, a9, b0]);
    let s10 = JSBIUtils.SumMultiply([a0, b10, a1, b9, a2, b8, a3, b7, a4, b6, a5, b5, a6, b4, a7, b3, a8, b2, a9, b1, a10, b0]);
    let s11 = JSBIUtils.SumMultiply([a0, b11, a1, b10, a2, b9, a3, b8, a4, b7, a5, b6, a6, b5, a7, b4, a8, b3, a9, b2, a10, b1, a11, b0]);
    let s12 = JSBIUtils.SumMultiply([a1, b11, a2, b10, a3, b9, a4, b8, a5, b7, a6, b6, a7, b5, a8, b4, a9, b3, a10, b2, a11, b1]);
    let s13 = JSBIUtils.SumMultiply([a2, b11, a3, b10, a4, b9, a5, b8, a6, b7, a7, b6, a8, b5, a9, b4, a10, b3, a11, b2]);
    let s14 = JSBIUtils.SumMultiply([a3, b11, a4, b10, a5, b9, a6, b8, a7, b7, a8, b6, a9, b5, a10, b4, a11, b3]);
    let s15 = JSBIUtils.SumMultiply([a4, b11, a5, b10, a6, b9, a7, b8, a8, b7, a9, b6, a10, b5, a11, b4]);
    let s16 = JSBIUtils.SumMultiply([a5, b11, a6, b10, a7, b9, a8, b8, a9, b7, a10, b6, a11, b5]);
    let s17 = JSBIUtils.SumMultiply([a6, b11, a7, b10, a8, b9, a9, b8, a10, b7, a11, b6]);
    let s18 = JSBIUtils.SumMultiply([a7, b11, a8, b10, a9, b9, a10, b8, a11, b7]);
    let s19 = JSBIUtils.SumMultiply([a8, b11, a9, b10, a10, b9, a11, b8]);
    let s20 = JSBIUtils.SumMultiply([a9, b11, a10, b10, a11, b9]);
    let s21 = JSBIUtils.SumMultiply([a10, b11, a11, b10]);
    let s22 = JSBIUtils.SumMultiply([a11, b11]);
    let s23 = JSBI.BigInt(0);

    carry0 = (s0 + (let) (1L << 20)) >> 21;
    s1 += carry0;
    s0 -= carry0 * ((ulet) 1L << 21);

    carry2 = (s2 + (let) (1L << 20)) >> 21;
    s3 += carry2;
    s2 -= carry2 * ((ulet) 1L << 21);

    carry4 = (s4 + (let) (1L << 20)) >> 21;
    s5 += carry4;
    s4 -= carry4 * ((ulet) 1L << 21);

    carry6 = (s6 + (let) (1L << 20)) >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry8 = (s8 + (let) (1L << 20)) >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry10 = (s10 + (let) (1L << 20)) >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);
    carry12 = (s12 + (let) (1L << 20)) >> 21;
    s13 += carry12;
    s12 -= carry12 * ((ulet) 1L << 21);
    carry14 = (s14 + (let) (1L << 20)) >> 21;
    s15 += carry14;
    s14 -= carry14 * ((ulet) 1L << 21);
    carry16 = (s16 + (let) (1L << 20)) >> 21;
    s17 += carry16;
    s16 -= carry16 * ((ulet) 1L << 21);
    carry18 = (s18 + (let) (1L << 20)) >> 21;
    s19 += carry18;
    s18 -= carry18 * ((ulet) 1L << 21);
    carry20 = (s20 + (let) (1L << 20)) >> 21;
    s21 += carry20;
    s20 -= carry20 * ((ulet) 1L << 21);
    carry22 = (s22 + (let) (1L << 20)) >> 21;
    s23 += carry22;
    s22 -= carry22 * ((ulet) 1L << 21);

    carry1 = (s1 + (let) (1L << 20)) >> 21;
    s2 += carry1;
    s1 -= carry1 * ((ulet) 1L << 21);
    carry3 = (s3 + (let) (1L << 20)) >> 21;
    s4 += carry3;
    s3 -= carry3 * ((ulet) 1L << 21);
    carry5 = (s5 + (let) (1L << 20)) >> 21;
    s6 += carry5;
    s5 -= carry5 * ((ulet) 1L << 21);
    carry7 = (s7 + (let) (1L << 20)) >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry9 = (s9 + (let) (1L << 20)) >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry11 = (s11 + (let) (1L << 20)) >> 21;
    s12 += carry11;
    s11 -= carry11 * ((ulet) 1L << 21);
    carry13 = (s13 + (let) (1L << 20)) >> 21;
    s14 += carry13;
    s13 -= carry13 * ((ulet) 1L << 21);
    carry15 = (s15 + (let) (1L << 20)) >> 21;
    s16 += carry15;
    s15 -= carry15 * ((ulet) 1L << 21);
    carry17 = (s17 + (let) (1L << 20)) >> 21;
    s18 += carry17;
    s17 -= carry17 * ((ulet) 1L << 21);
    carry19 = (s19 + (let) (1L << 20)) >> 21;
    s20 += carry19;
    s19 -= carry19 * ((ulet) 1L << 21);
    carry21 = (s21 + (let) (1L << 20)) >> 21;
    s22 += carry21;
    s21 -= carry21 * ((ulet) 1L << 21);

    s11 += s23 * 666643;
    s12 += s23 * 470296;
    s13 += s23 * 654183;
    s14 -= s23 * 997805;
    s15 += s23 * 136657;
    s16 -= s23 * 683901;

    s10 += s22 * 666643;
    s11 += s22 * 470296;
    s12 += s22 * 654183;
    s13 -= s22 * 997805;
    s14 += s22 * 136657;
    s15 -= s22 * 683901;

    s9 += s21 * 666643;
    s10 += s21 * 470296;
    s11 += s21 * 654183;
    s12 -= s21 * 997805;
    s13 += s21 * 136657;
    s14 -= s21 * 683901;

    s8 += s20 * 666643;
    s9 += s20 * 470296;
    s10 += s20 * 654183;
    s11 -= s20 * 997805;
    s12 += s20 * 136657;
    s13 -= s20 * 683901;

    s7 += s19 * 666643;
    s8 += s19 * 470296;
    s9 += s19 * 654183;
    s10 -= s19 * 997805;
    s11 += s19 * 136657;
    s12 -= s19 * 683901;

    s6 += s18 * 666643;
    s7 += s18 * 470296;
    s8 += s18 * 654183;
    s9 -= s18 * 997805;
    s10 += s18 * 136657;
    s11 -= s18 * 683901;

    carry6 = (s6 + (let) (1L << 20)) >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry8 = (s8 + (let) (1L << 20)) >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry10 = (s10 + (let) (1L << 20)) >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);
    carry12 = (s12 + (let) (1L << 20)) >> 21;
    s13 += carry12;
    s12 -= carry12 * ((ulet) 1L << 21);
    carry14 = (s14 + (let) (1L << 20)) >> 21;
    s15 += carry14;
    s14 -= carry14 * ((ulet) 1L << 21);
    carry16 = (s16 + (let) (1L << 20)) >> 21;
    s17 += carry16;
    s16 -= carry16 * ((ulet) 1L << 21);

    carry7 = (s7 + (let) (1L << 20)) >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry9 = (s9 + (let) (1L << 20)) >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry11 = (s11 + (let) (1L << 20)) >> 21;
    s12 += carry11;
    s11 -= carry11 * ((ulet) 1L << 21);
    carry13 = (s13 + (let) (1L << 20)) >> 21;
    s14 += carry13;
    s13 -= carry13 * ((ulet) 1L << 21);
    carry15 = (s15 + (let) (1L << 20)) >> 21;
    s16 += carry15;
    s15 -= carry15 * ((ulet) 1L << 21);

    s5 += s17 * 666643;
    s6 += s17 * 470296;
    s7 += s17 * 654183;
    s8 -= s17 * 997805;
    s9 += s17 * 136657;
    s10 -= s17 * 683901;

    s4 += s16 * 666643;
    s5 += s16 * 470296;
    s6 += s16 * 654183;
    s7 -= s16 * 997805;
    s8 += s16 * 136657;
    s9 -= s16 * 683901;

    s3 += s15 * 666643;
    s4 += s15 * 470296;
    s5 += s15 * 654183;
    s6 -= s15 * 997805;
    s7 += s15 * 136657;
    s8 -= s15 * 683901;

    s2 += s14 * 666643;
    s3 += s14 * 470296;
    s4 += s14 * 654183;
    s5 -= s14 * 997805;
    s6 += s14 * 136657;
    s7 -= s14 * 683901;

    s1 += s13 * 666643;
    s2 += s13 * 470296;
    s3 += s13 * 654183;
    s4 -= s13 * 997805;
    s5 += s13 * 136657;
    s6 -= s13 * 683901;

    s0 += s12 * 666643;
    s1 += s12 * 470296;
    s2 += s12 * 654183;
    s3 -= s12 * 997805;
    s4 += s12 * 136657;
    s5 -= s12 * 683901;
    s12 = 0;

    carry0 = (s0 + (let) (1L << 20)) >> 21;
    s1 += carry0;
    s0 -= carry0 * ((ulet) 1L << 21);
    carry2 = (s2 + (let) (1L << 20)) >> 21;
    s3 += carry2;
    s2 -= carry2 * ((ulet) 1L << 21);
    carry4 = (s4 + (let) (1L << 20)) >> 21;
    s5 += carry4;
    s4 -= carry4 * ((ulet) 1L << 21);
    carry6 = (s6 + (let) (1L << 20)) >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry8 = (s8 + (let) (1L << 20)) >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry10 = (s10 + (let) (1L << 20)) >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);

    carry1 = (s1 + (let) (1L << 20)) >> 21;
    s2 += carry1;
    s1 -= carry1 * ((ulet) 1L << 21);
    carry3 = (s3 + (let) (1L << 20)) >> 21;
    s4 += carry3;
    s3 -= carry3 * ((ulet) 1L << 21);
    carry5 = (s5 + (let) (1L << 20)) >> 21;
    s6 += carry5;
    s5 -= carry5 * ((ulet) 1L << 21);
    carry7 = (s7 + (let) (1L << 20)) >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry9 = (s9 + (let) (1L << 20)) >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry11 = (s11 + (let) (1L << 20)) >> 21;
    s12 += carry11;
    s11 -= carry11 * ((ulet) 1L << 21);

    s0 += s12 * 666643;
    s1 += s12 * 470296;
    s2 += s12 * 654183;
    s3 -= s12 * 997805;
    s4 += s12 * 136657;
    s5 -= s12 * 683901;
    s12 = 0;

    carry0 = s0 >> 21;
    s1 += carry0;
    s0 -= carry0 * ((ulet) 1L << 21);
    carry1 = s1 >> 21;
    s2 += carry1;
    s1 -= carry1 * ((ulet) 1L << 21);
    carry2 = s2 >> 21;
    s3 += carry2;
    s2 -= carry2 * ((ulet) 1L << 21);
    carry3 = s3 >> 21;
    s4 += carry3;
    s3 -= carry3 * ((ulet) 1L << 21);
    carry4 = s4 >> 21;
    s5 += carry4;
    s4 -= carry4 * ((ulet) 1L << 21);
    carry5 = s5 >> 21;
    s6 += carry5;
    s5 -= carry5 * ((ulet) 1L << 21);
    carry6 = s6 >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry7 = s7 >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry8 = s8 >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry9 = s9 >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry10 = s10 >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);
    carry11 = s11 >> 21;
    s12 += carry11;
    s11 -= carry11 * ((ulet) 1L << 21);

    s0 += s12 * 666643;
    s1 += s12 * 470296;
    s2 += s12 * 654183;
    s3 -= s12 * 997805;
    s4 += s12 * 136657;
    s5 -= s12 * 683901;

    carry0 = s0 >> 21;
    s1 += carry0;
    s0 -= carry0 * ((ulet) 1L << 21);
    carry1 = s1 >> 21;
    s2 += carry1;
    s1 -= carry1 * ((ulet) 1L << 21);
    carry2 = s2 >> 21;
    s3 += carry2;
    s2 -= carry2 * ((ulet) 1L << 21);
    carry3 = s3 >> 21;
    s4 += carry3;
    s3 -= carry3 * ((ulet) 1L << 21);
    carry4 = s4 >> 21;
    s5 += carry4;
    s4 -= carry4 * ((ulet) 1L << 21);
    carry5 = s5 >> 21;
    s6 += carry5;
    s5 -= carry5 * ((ulet) 1L << 21);
    carry6 = s6 >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry7 = s7 >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry8 = s8 >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry9 = s9 >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry10 = s10 >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);

    s[0]  = s0 >> 0;
    s[1]  = s0 >> 8;
    s[2]  = (s0 >> 16) | (s1 * ((ulet) 1 << 5));
    s[3]  = s1 >> 3;
    s[4]  = s1 >> 11;
    s[5]  = (s1 >> 19) | (s2 * ((ulet) 1 << 2));
    s[6]  = s2 >> 6;
    s[7]  = (s2 >> 14) | (s3 * ((ulet) 1 << 7));
    s[8]  = s3 >> 1;
    s[9]  = s3 >> 9;
    s[10] = (s3 >> 17) | (s4 * ((ulet) 1 << 4));
    s[11] = s4 >> 4;
    s[12] = s4 >> 12;
    s[13] = (s4 >> 20) | (s5 * ((ulet) 1 << 1));
    s[14] = s5 >> 7;
    s[15] = (s5 >> 15) | (s6 * ((ulet) 1 << 6));
    s[16] = s6 >> 2;
    s[17] = s6 >> 10;
    s[18] = (s6 >> 18) | (s7 * ((ulet) 1 << 3));
    s[19] = s7 >> 5;
    s[20] = s7 >> 13;
    s[21] = s8 >> 0;
    s[22] = s8 >> 8;
    s[23] = (s8 >> 16) | (s9 * ((ulet) 1 << 5));
    s[24] = s9 >> 3;
    s[25] = s9 >> 11;
    s[26] = (s9 >> 19) | (s10 * ((ulet) 1 << 2));
    s[27] = s10 >> 6;
    s[28] = (s10 >> 14) | (s11 * ((ulet) 1 << 7));
    s[29] = s11 >> 1;
    s[30] = s11 >> 9;
    s[31] = s11 >> 17;
}

/*
 Input:
 a[0]+256*a[1]+...+256^31*a[31] = a
 b[0]+256*b[1]+...+256^31*b[31] = b
 c[0]+256*c[1]+...+256^31*c[31] = c
 *
 Output:
 s[0]+256*s[1]+...+256^31*s[31] = (ab+c) mod l
 where l = 2^252 + 27742317777372353535851937790883648493.
 */
export function sc25519_muladd (s: Uint8Array, a: Uint8Array, b: Uint8Array, c: Uint8Array)
{
    let a0  = 2097151 & load_3(a, 0);
    let a1  = 2097151 & (load_4(a, 2) >> 5);
    let a2  = 2097151 & (load_3(a, 5) >> 2);
    let a3  = 2097151 & (load_4(a, 7) >> 7);
    let a4  = 2097151 & (load_4(a, 10) >> 4);
    let a5  = 2097151 & (load_3(a, 13) >> 1);
    let a6  = 2097151 & (load_4(a, 15) >> 6);
    let a7  = 2097151 & (load_3(a, 18) >> 3);
    let a8  = 2097151 & load_3(a, 21);
    let a9  = 2097151 & (load_4(a, 23) >> 5);
    let a10 = 2097151 & (load_3(a, 26) >> 2);
    let a11 = (load_4(a, 28) >> 7);

    let b0  = 2097151 & load_3(b, 0);
    let b1  = 2097151 & (load_4(b, 2) >> 5);
    let b2  = 2097151 & (load_3(b, 5) >> 2);
    let b3  = 2097151 & (load_4(b, 7) >> 7);
    let b4  = 2097151 & (load_4(b, 10) >> 4);
    let b5  = 2097151 & (load_3(b, 13) >> 1);
    let b6  = 2097151 & (load_4(b, 15) >> 6);
    let b7  = 2097151 & (load_3(b, 18) >> 3);
    let b8  = 2097151 & load_3(b, 21);
    let b9  = 2097151 & (load_4(b, 23) >> 5);
    let b10 = 2097151 & (load_3(b, 26) >> 2);
    let b11 = (load_4(b, 28) >> 7);

    let c0  = 2097151 & load_3(c, 0);
    let c1  = 2097151 & (load_4(c, 2) >> 5);
    let c2  = 2097151 & (load_3(c, 5) >> 2);
    let c3  = 2097151 & (load_4(c, 7) >> 7);
    let c4  = 2097151 & (load_4(c, 10) >> 4);
    let c5  = 2097151 & (load_3(c, 13) >> 1);
    let c6  = 2097151 & (load_4(c, 15) >> 6);
    let c7  = 2097151 & (load_3(c, 18) >> 3);
    let c8  = 2097151 & load_3(c, 21);
    let c9  = 2097151 & (load_4(c, 23) >> 5);
    let c10 = 2097151 & (load_3(c, 26) >> 2);
    let c11 = (load_4(c, 28) >> 7);

    let s0;
    let s1;
    let s2;
    let s3;
    let s4;
    let s5;
    let s6;
    let s7;
    let s8;
    let s9;
    let s10;
    let s11;
    let s12;
    let s13;
    let s14;
    let s15;
    let s16;
    let s17;
    let s18;
    let s19;
    let s20;
    let s21;
    let s22;
    let s23;

    let carry0;
    let carry1;
    let carry2;
    let carry3;
    let carry4;
    let carry5;
    let carry6;
    let carry7;
    let carry8;
    let carry9;
    let carry10;
    let carry11;
    let carry12;
    let carry13;
    let carry14;
    let carry15;
    let carry16;
    let carry17;
    let carry18;
    let carry19;
    let carry20;
    let carry21;
    let carry22;

    s0 = c0 + a0 * b0;
    s1 = c1 + a0 * b1 + a1 * b0;
    s2 = c2 + a0 * b2 + a1 * b1 + a2 * b0;
    s3 = c3 + a0 * b3 + a1 * b2 + a2 * b1 + a3 * b0;
    s4 = c4 + a0 * b4 + a1 * b3 + a2 * b2 + a3 * b1 + a4 * b0;
    s5 = c5 + a0 * b5 + a1 * b4 + a2 * b3 + a3 * b2 + a4 * b1 + a5 * b0;
    s6 = c6 + a0 * b6 + a1 * b5 + a2 * b4 + a3 * b3 + a4 * b2 + a5 * b1 +
        a6 * b0;
    s7 = c7 + a0 * b7 + a1 * b6 + a2 * b5 + a3 * b4 + a4 * b3 + a5 * b2 +
        a6 * b1 + a7 * b0;
    s8 = c8 + a0 * b8 + a1 * b7 + a2 * b6 + a3 * b5 + a4 * b4 + a5 * b3 +
        a6 * b2 + a7 * b1 + a8 * b0;
    s9 = c9 + a0 * b9 + a1 * b8 + a2 * b7 + a3 * b6 + a4 * b5 + a5 * b4 +
        a6 * b3 + a7 * b2 + a8 * b1 + a9 * b0;
    s10 = c10 + a0 * b10 + a1 * b9 + a2 * b8 + a3 * b7 + a4 * b6 + a5 * b5 +
        a6 * b4 + a7 * b3 + a8 * b2 + a9 * b1 + a10 * b0;
    s11 = c11 + a0 * b11 + a1 * b10 + a2 * b9 + a3 * b8 + a4 * b7 + a5 * b6 +
        a6 * b5 + a7 * b4 + a8 * b3 + a9 * b2 + a10 * b1 + a11 * b0;
    s12 = a1 * b11 + a2 * b10 + a3 * b9 + a4 * b8 + a5 * b7 + a6 * b6 +
        a7 * b5 + a8 * b4 + a9 * b3 + a10 * b2 + a11 * b1;
    s13 = a2 * b11 + a3 * b10 + a4 * b9 + a5 * b8 + a6 * b7 + a7 * b6 +
        a8 * b5 + a9 * b4 + a10 * b3 + a11 * b2;
    s14 = a3 * b11 + a4 * b10 + a5 * b9 + a6 * b8 + a7 * b7 + a8 * b6 +
        a9 * b5 + a10 * b4 + a11 * b3;
    s15 = a4 * b11 + a5 * b10 + a6 * b9 + a7 * b8 + a8 * b7 + a9 * b6 +
        a10 * b5 + a11 * b4;
    s16 =
        a5 * b11 + a6 * b10 + a7 * b9 + a8 * b8 + a9 * b7 + a10 * b6 + a11 * b5;
    s17 = a6 * b11 + a7 * b10 + a8 * b9 + a9 * b8 + a10 * b7 + a11 * b6;
    s18 = a7 * b11 + a8 * b10 + a9 * b9 + a10 * b8 + a11 * b7;
    s19 = a8 * b11 + a9 * b10 + a10 * b9 + a11 * b8;
    s20 = a9 * b11 + a10 * b10 + a11 * b9;
    s21 = a10 * b11 + a11 * b10;
    s22 = a11 * b11;
    s23 = 0;

    carry0 = (s0 + (let) (1L << 20)) >> 21;
    s1 += carry0;
    s0 -= carry0 * ((ulet) 1L << 21);
    carry2 = (s2 + (let) (1L << 20)) >> 21;
    s3 += carry2;
    s2 -= carry2 * ((ulet) 1L << 21);
    carry4 = (s4 + (let) (1L << 20)) >> 21;
    s5 += carry4;
    s4 -= carry4 * ((ulet) 1L << 21);
    carry6 = (s6 + (let) (1L << 20)) >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry8 = (s8 + (let) (1L << 20)) >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry10 = (s10 + (let) (1L << 20)) >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);
    carry12 = (s12 + (let) (1L << 20)) >> 21;
    s13 += carry12;
    s12 -= carry12 * ((ulet) 1L << 21);
    carry14 = (s14 + (let) (1L << 20)) >> 21;
    s15 += carry14;
    s14 -= carry14 * ((ulet) 1L << 21);
    carry16 = (s16 + (let) (1L << 20)) >> 21;
    s17 += carry16;
    s16 -= carry16 * ((ulet) 1L << 21);
    carry18 = (s18 + (let) (1L << 20)) >> 21;
    s19 += carry18;
    s18 -= carry18 * ((ulet) 1L << 21);
    carry20 = (s20 + (let) (1L << 20)) >> 21;
    s21 += carry20;
    s20 -= carry20 * ((ulet) 1L << 21);
    carry22 = (s22 + (let) (1L << 20)) >> 21;
    s23 += carry22;
    s22 -= carry22 * ((ulet) 1L << 21);

    carry1 = (s1 + (let) (1L << 20)) >> 21;
    s2 += carry1;
    s1 -= carry1 * ((ulet) 1L << 21);
    carry3 = (s3 + (let) (1L << 20)) >> 21;
    s4 += carry3;
    s3 -= carry3 * ((ulet) 1L << 21);
    carry5 = (s5 + (let) (1L << 20)) >> 21;
    s6 += carry5;
    s5 -= carry5 * ((ulet) 1L << 21);
    carry7 = (s7 + (let) (1L << 20)) >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry9 = (s9 + (let) (1L << 20)) >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry11 = (s11 + (let) (1L << 20)) >> 21;
    s12 += carry11;
    s11 -= carry11 * ((ulet) 1L << 21);
    carry13 = (s13 + (let) (1L << 20)) >> 21;
    s14 += carry13;
    s13 -= carry13 * ((ulet) 1L << 21);
    carry15 = (s15 + (let) (1L << 20)) >> 21;
    s16 += carry15;
    s15 -= carry15 * ((ulet) 1L << 21);
    carry17 = (s17 + (let) (1L << 20)) >> 21;
    s18 += carry17;
    s17 -= carry17 * ((ulet) 1L << 21);
    carry19 = (s19 + (let) (1L << 20)) >> 21;
    s20 += carry19;
    s19 -= carry19 * ((ulet) 1L << 21);
    carry21 = (s21 + (let) (1L << 20)) >> 21;
    s22 += carry21;
    s21 -= carry21 * ((ulet) 1L << 21);

    s11 += s23 * 666643;
    s12 += s23 * 470296;
    s13 += s23 * 654183;
    s14 -= s23 * 997805;
    s15 += s23 * 136657;
    s16 -= s23 * 683901;

    s10 += s22 * 666643;
    s11 += s22 * 470296;
    s12 += s22 * 654183;
    s13 -= s22 * 997805;
    s14 += s22 * 136657;
    s15 -= s22 * 683901;

    s9 += s21 * 666643;
    s10 += s21 * 470296;
    s11 += s21 * 654183;
    s12 -= s21 * 997805;
    s13 += s21 * 136657;
    s14 -= s21 * 683901;

    s8 += s20 * 666643;
    s9 += s20 * 470296;
    s10 += s20 * 654183;
    s11 -= s20 * 997805;
    s12 += s20 * 136657;
    s13 -= s20 * 683901;

    s7 += s19 * 666643;
    s8 += s19 * 470296;
    s9 += s19 * 654183;
    s10 -= s19 * 997805;
    s11 += s19 * 136657;
    s12 -= s19 * 683901;

    s6 += s18 * 666643;
    s7 += s18 * 470296;
    s8 += s18 * 654183;
    s9 -= s18 * 997805;
    s10 += s18 * 136657;
    s11 -= s18 * 683901;

    carry6 = (s6 + (let) (1L << 20)) >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry8 = (s8 + (let) (1L << 20)) >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry10 = (s10 + (let) (1L << 20)) >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);
    carry12 = (s12 + (let) (1L << 20)) >> 21;
    s13 += carry12;
    s12 -= carry12 * ((ulet) 1L << 21);
    carry14 = (s14 + (let) (1L << 20)) >> 21;
    s15 += carry14;
    s14 -= carry14 * ((ulet) 1L << 21);
    carry16 = (s16 + (let) (1L << 20)) >> 21;
    s17 += carry16;
    s16 -= carry16 * ((ulet) 1L << 21);

    carry7 = (s7 + (let) (1L << 20)) >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry9 = (s9 + (let) (1L << 20)) >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry11 = (s11 + (let) (1L << 20)) >> 21;
    s12 += carry11;
    s11 -= carry11 * ((ulet) 1L << 21);
    carry13 = (s13 + (let) (1L << 20)) >> 21;
    s14 += carry13;
    s13 -= carry13 * ((ulet) 1L << 21);
    carry15 = (s15 + (let) (1L << 20)) >> 21;
    s16 += carry15;
    s15 -= carry15 * ((ulet) 1L << 21);

    s5 += s17 * 666643;
    s6 += s17 * 470296;
    s7 += s17 * 654183;
    s8 -= s17 * 997805;
    s9 += s17 * 136657;
    s10 -= s17 * 683901;

    s4 += s16 * 666643;
    s5 += s16 * 470296;
    s6 += s16 * 654183;
    s7 -= s16 * 997805;
    s8 += s16 * 136657;
    s9 -= s16 * 683901;

    s3 += s15 * 666643;
    s4 += s15 * 470296;
    s5 += s15 * 654183;
    s6 -= s15 * 997805;
    s7 += s15 * 136657;
    s8 -= s15 * 683901;

    s2 += s14 * 666643;
    s3 += s14 * 470296;
    s4 += s14 * 654183;
    s5 -= s14 * 997805;
    s6 += s14 * 136657;
    s7 -= s14 * 683901;

    s1 += s13 * 666643;
    s2 += s13 * 470296;
    s3 += s13 * 654183;
    s4 -= s13 * 997805;
    s5 += s13 * 136657;
    s6 -= s13 * 683901;

    s0 += s12 * 666643;
    s1 += s12 * 470296;
    s2 += s12 * 654183;
    s3 -= s12 * 997805;
    s4 += s12 * 136657;
    s5 -= s12 * 683901;
    s12 = 0;

    carry0 = (s0 + (let) (1L << 20)) >> 21;
    s1 += carry0;
    s0 -= carry0 * ((ulet) 1L << 21);
    carry2 = (s2 + (let) (1L << 20)) >> 21;
    s3 += carry2;
    s2 -= carry2 * ((ulet) 1L << 21);
    carry4 = (s4 + (let) (1L << 20)) >> 21;
    s5 += carry4;
    s4 -= carry4 * ((ulet) 1L << 21);
    carry6 = (s6 + (let) (1L << 20)) >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry8 = (s8 + (let) (1L << 20)) >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry10 = (s10 + (let) (1L << 20)) >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);

    carry1 = (s1 + (let) (1L << 20)) >> 21;
    s2 += carry1;
    s1 -= carry1 * ((ulet) 1L << 21);
    carry3 = (s3 + (let) (1L << 20)) >> 21;
    s4 += carry3;
    s3 -= carry3 * ((ulet) 1L << 21);
    carry5 = (s5 + (let) (1L << 20)) >> 21;
    s6 += carry5;
    s5 -= carry5 * ((ulet) 1L << 21);
    carry7 = (s7 + (let) (1L << 20)) >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry9 = (s9 + (let) (1L << 20)) >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry11 = (s11 + (let) (1L << 20)) >> 21;
    s12 += carry11;
    s11 -= carry11 * ((ulet) 1L << 21);

    s0 += s12 * 666643;
    s1 += s12 * 470296;
    s2 += s12 * 654183;
    s3 -= s12 * 997805;
    s4 += s12 * 136657;
    s5 -= s12 * 683901;
    s12 = 0;

    carry0 = s0 >> 21;
    s1 += carry0;
    s0 -= carry0 * ((ulet) 1L << 21);
    carry1 = s1 >> 21;
    s2 += carry1;
    s1 -= carry1 * ((ulet) 1L << 21);
    carry2 = s2 >> 21;
    s3 += carry2;
    s2 -= carry2 * ((ulet) 1L << 21);
    carry3 = s3 >> 21;
    s4 += carry3;
    s3 -= carry3 * ((ulet) 1L << 21);
    carry4 = s4 >> 21;
    s5 += carry4;
    s4 -= carry4 * ((ulet) 1L << 21);
    carry5 = s5 >> 21;
    s6 += carry5;
    s5 -= carry5 * ((ulet) 1L << 21);
    carry6 = s6 >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry7 = s7 >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry8 = s8 >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry9 = s9 >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry10 = s10 >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);
    carry11 = s11 >> 21;
    s12 += carry11;
    s11 -= carry11 * ((ulet) 1L << 21);

    s0 += s12 * 666643;
    s1 += s12 * 470296;
    s2 += s12 * 654183;
    s3 -= s12 * 997805;
    s4 += s12 * 136657;
    s5 -= s12 * 683901;

    carry0 = s0 >> 21;
    s1 += carry0;
    s0 -= carry0 * ((ulet) 1L << 21);
    carry1 = s1 >> 21;
    s2 += carry1;
    s1 -= carry1 * ((ulet) 1L << 21);
    carry2 = s2 >> 21;
    s3 += carry2;
    s2 -= carry2 * ((ulet) 1L << 21);
    carry3 = s3 >> 21;
    s4 += carry3;
    s3 -= carry3 * ((ulet) 1L << 21);
    carry4 = s4 >> 21;
    s5 += carry4;
    s4 -= carry4 * ((ulet) 1L << 21);
    carry5 = s5 >> 21;
    s6 += carry5;
    s5 -= carry5 * ((ulet) 1L << 21);
    carry6 = s6 >> 21;
    s7 += carry6;
    s6 -= carry6 * ((ulet) 1L << 21);
    carry7 = s7 >> 21;
    s8 += carry7;
    s7 -= carry7 * ((ulet) 1L << 21);
    carry8 = s8 >> 21;
    s9 += carry8;
    s8 -= carry8 * ((ulet) 1L << 21);
    carry9 = s9 >> 21;
    s10 += carry9;
    s9 -= carry9 * ((ulet) 1L << 21);
    carry10 = s10 >> 21;
    s11 += carry10;
    s10 -= carry10 * ((ulet) 1L << 21);

    s[0]  = s0 >> 0;
    s[1]  = s0 >> 8;
    s[2]  = (s0 >> 16) | (s1 * ((ulet) 1 << 5));
    s[3]  = s1 >> 3;
    s[4]  = s1 >> 11;
    s[5]  = (s1 >> 19) | (s2 * ((ulet) 1 << 2));
    s[6]  = s2 >> 6;
    s[7]  = (s2 >> 14) | (s3 * ((ulet) 1 << 7));
    s[8]  = s3 >> 1;
    s[9]  = s3 >> 9;
    s[10] = (s3 >> 17) | (s4 * ((ulet) 1 << 4));
    s[11] = s4 >> 4;
    s[12] = s4 >> 12;
    s[13] = (s4 >> 20) | (s5 * ((ulet) 1 << 1));
    s[14] = s5 >> 7;
    s[15] = (s5 >> 15) | (s6 * ((ulet) 1 << 6));
    s[16] = s6 >> 2;
    s[17] = s6 >> 10;
    s[18] = (s6 >> 18) | (s7 * ((ulet) 1 << 3));
    s[19] = s7 >> 5;
    s[20] = s7 >> 13;
    s[21] = s8 >> 0;
    s[22] = s8 >> 8;
    s[23] = (s8 >> 16) | (s9 * ((ulet) 1 << 5));
    s[24] = s9 >> 3;
    s[25] = s9 >> 11;
    s[26] = (s9 >> 19) | (s10 * ((ulet) 1 << 2));
    s[27] = s10 >> 6;
    s[28] = (s10 >> 14) | (s11 * ((ulet) 1 << 7));
    s[29] = s11 >> 1;
    s[30] = s11 >> 9;
    s[31] = s11 >> 17;
}

/*
 Input:
 a[0]+256*a[1]+...+256^31*a[31] = a
 *
 Output:
 s[0]+256*s[1]+...+256^31*s[31] = a^2 mod l
 where l = 2^252 + 27742317777372353535851937790883648493.
 */
export function sc25519_sq (s: Uint8Array, a: Uint8Array, )
{
    sc25519_mul(s, a, a);
}

/*
 Input:
 s[0]+256*a[1]+...+256^31*a[31] = a
 n
 *
 Output:
 s[0]+256*s[1]+...+256^31*s[31] = x * s^(s^n) mod l
 where l = 2^252 + 27742317777372353535851937790883648493.
 Overwrites s in place.
 */
export function sc25519_sqmul (s: Uint8Array, n: number, a: Uint8Array)
{
    let i: number;

    for (i = 0; i < n; i++) {
        sc25519_sq(s, s);
    }
    sc25519_mul(s, s, a);
}

export function sc25519_invert (recip: Uint8Array, s: Uint8Array)
{
    let _10 = new Uint8Array(32);
    let _100 = new Uint8Array(32);
    let _1000 = new Uint8Array(32);
    let _10000 = new Uint8Array(32);
    let _100000 = new Uint8Array(32);
    let _1000000 = new Uint8Array(32);
    let _10010011 = new Uint8Array(32);
    let _10010111 = new Uint8Array(32);
    let _100110 = new Uint8Array(32);
    let _1010 = new Uint8Array(32);
    let _1010000 = new Uint8Array(32);
    let _1010011 = new Uint8Array(32);
    let _1011 = new Uint8Array(32);
    let _10110 = new Uint8Array(32);
    let _10111101 = new Uint8Array(32);
    let _11 = new Uint8Array(32);
    let _1100011 = new Uint8Array(32);
    let _1100111 = new Uint8Array(32);
    let _11010011 = new Uint8Array(32);
    let _1101011 = new Uint8Array(32);
    let _11100111 = new Uint8Array(32);
    let _11101011 = new Uint8Array(32);
    let _11110101 = new Uint8Array(32);

    sc25519_sq(_10, s);
    sc25519_mul(_11, s, _10);
    sc25519_mul(_100, s, _11);
    sc25519_sq(_1000, _100);
    sc25519_mul(_1010, _10, _1000);
    sc25519_mul(_1011, s, _1010);
    sc25519_sq(_10000, _1000);
    sc25519_sq(_10110, _1011);
    sc25519_mul(_100000, _1010, _10110);
    sc25519_mul(_100110, _10000, _10110);
    sc25519_sq(_1000000, _100000);
    sc25519_mul(_1010000, _10000, _1000000);
    sc25519_mul(_1010011, _11, _1010000);
    sc25519_mul(_1100011, _10000, _1010011);
    sc25519_mul(_1100111, _100, _1100011);
    sc25519_mul(_1101011, _100, _1100111);
    sc25519_mul(_10010011, _1000000, _1010011);
    sc25519_mul(_10010111, _100, _10010011);
    sc25519_mul(_10111101, _100110, _10010111);
    sc25519_mul(_11010011, _10110, _10111101);
    sc25519_mul(_11100111, _1010000, _10010111);
    sc25519_mul(_11101011, _100, _11100111);
    sc25519_mul(_11110101, _1010, _11101011);

    sc25519_mul(recip, _1011, _11110101);
    sc25519_sqmul(recip, 126, _1010011);
    sc25519_sqmul(recip, 9, _10);
    sc25519_mul(recip, recip, _11110101);
    sc25519_sqmul(recip, 7, _1100111);
    sc25519_sqmul(recip, 9, _11110101);
    sc25519_sqmul(recip, 11, _10111101);
    sc25519_sqmul(recip, 8, _11100111);
    sc25519_sqmul(recip, 9, _1101011);
    sc25519_sqmul(recip, 6, _1011);
    sc25519_sqmul(recip, 14, _10010011);
    sc25519_sqmul(recip, 10, _1100011);
    sc25519_sqmul(recip, 9, _10010111);
    sc25519_sqmul(recip, 10, _11110101);
    sc25519_sqmul(recip, 8, _11010011);
    sc25519_sqmul(recip, 8, _11101011);
}

/*
 Input:
 s[0]+256*s[1]+...+256^63*s[63] = s
 *
 Output:
 s[0]+256*s[1]+...+256^31*s[31] = s mod l
 where l = 2^252 + 27742317777372353535851937790883648493.
 Overwrites s in place.
 */
export function sc25519_reduce (s: Uint8Array)
{
    if (s.length != ED25519Utils.crypto_core_ed25519_NONREDUCEDSCALARBYTES)
        throw new Error("The size of the entered buffer is not 64.");

    let S: Array<JSBI> = [];
    let Carry: Array<JSBI> = [];

    for (let idx = 0; idx < 24; idx++)
        S.push(JSBI.BigInt(0));

    for (let idx = 0; idx < 16; idx++)
        Carry.push(JSBI.BigInt(0))

    let N2097151 = JSBI.BigInt(2097151)
    S[0]  = JSBI.bitwiseAnd(N2097151, load_3(s, 0));
    S[1]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 2), JSBI.BigInt(5)));
    S[2]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 5), JSBI.BigInt(2)));
    S[3]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 7), JSBI.BigInt(7)));
    S[4]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 10), JSBI.BigInt(4)));
    S[5]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 13), JSBI.BigInt(1)));
    S[6]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 15), JSBI.BigInt(6)));
    S[7]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 18), JSBI.BigInt(3)));
    S[8]  = JSBI.bitwiseAnd(N2097151, load_3(s, 21));
    S[9]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 23), JSBI.BigInt(5)));
    S[10] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 26), JSBI.BigInt(2)));
    S[11] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 28), JSBI.BigInt(7)));
    S[12] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 31), JSBI.BigInt(4)));
    S[13] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 34), JSBI.BigInt(1)));
    S[14] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 36), JSBI.BigInt(6)));
    S[15] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 39), JSBI.BigInt(3)));
    S[16] = JSBI.bitwiseAnd(N2097151, load_3(s, 42));
    S[17] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 44), JSBI.BigInt(5)));
    S[18] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 47), JSBI.BigInt(2)));
    S[19] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 49), JSBI.BigInt(7)));
    S[20] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 52), JSBI.BigInt(4)));
    S[21] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 55), JSBI.BigInt(1)));
    S[22] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 57), JSBI.BigInt(6)));
    S[23] = JSBI.signedRightShift(load_4(s, 60), JSBI.BigInt(3));

    let f1 = (i: number, j: number) =>
    {
        S[i+0] = JSBI.add(S[i+0], JSBI.multiply(S[j], JSBI.BigInt(666643)));
        S[i+1] = JSBI.add(S[i+1], JSBI.multiply(S[j], JSBI.BigInt(470296)));
        S[i+2] = JSBI.add(S[i+2], JSBI.multiply(S[j], JSBI.BigInt(654183)));
        S[i+3] = JSBI.subtract(S[i+3], JSBI.multiply(S[j], JSBI.BigInt(997805)));
        S[i+4] = JSBI.add(S[i+4], JSBI.multiply(S[j], JSBI.BigInt(136657)));
        S[i+5] = JSBI.subtract(S[i+5], JSBI.multiply(S[j], JSBI.BigInt(683901)));
    };

    f1(11, 23);
    f1(10, 22);
    f1( 9, 21);
    f1( 8, 20);
    f1( 7, 19);
    f1( 6, 18);

    let f2 = (i: number) =>
    {
        Carry[i] = JSBI.add(S[i], JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
        S[i+1] = JSBI.add(S[i+1], Carry[i]);
        S[i] = JSBI.subtract(S[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 21)));
    };

    f2(6);
    f2(8);
    f2(10);
    f2(12);
    f2(14);
    f2(16);

    f2(7);
    f2(9);
    f2(11);
    f2(13);
    f2(15);

    f1(5, 17);
    f1(4, 16);
    f1(3, 15);
    f1(2, 14);
    f1(1, 13);
    f1(0, 12);
    S[12] = JSBI.BigInt(0);

    f2(0);
    f2(2);
    f2(4);
    f2(6);
    f2(8);
    f2(10);

    f2(1);
    f2(3);
    f2(5);
    f2(7);
    f2(9);
    f2(11);

    f1(0, 12);
    S[12] = JSBI.BigInt(0);

    let f3 = (i: number) =>
    {
        Carry[i] = JSBI.signedRightShift(S[i], JSBI.BigInt(21));
        S[i+1] = JSBI.add(S[i+1], Carry[i]);
        S[i] = JSBI.subtract(S[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 21)));
    }

    f3(0);
    f3(1);
    f3(2);
    f3(3);
    f3(4);
    f3(5);
    f3(6);
    f3(7);
    f3(8);
    f3(9);
    f3(10);
    f3(11);

    f1(0, 12);

    f3(0);
    f3(1);
    f3(2);
    f3(3);
    f3(4);
    f3(5);
    f3(6);
    f3(7);
    f3(8);
    f3(8);
    f3(10);

    s[0]  = JSBIUtils.toInt8(S[0]);
    s[1]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[0], JSBI.BigInt(8)));
    s[2]  = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[0], JSBI.BigInt(16)), JSBI.multiply(S[1], JSBI.BigInt(1 << 5))));
    s[3]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[1], JSBI.BigInt(3)));
    s[4]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[1], JSBI.BigInt(11)));
    s[5]  = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[1], JSBI.BigInt(19)), JSBI.multiply(S[2], JSBI.BigInt(1 << 2))));
    s[6]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[2], JSBI.BigInt(6)));
    s[7]  = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[2], JSBI.BigInt(14)), JSBI.multiply(S[3], JSBI.BigInt(1 << 7))));
    s[8]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[3], JSBI.BigInt(1)));
    s[9]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[3], JSBI.BigInt(9)));
    s[10] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[3], JSBI.BigInt(17)), JSBI.multiply(S[4], JSBI.BigInt(1 << 4))));
    s[11] = JSBIUtils.toInt8(JSBI.signedRightShift(S[4], JSBI.BigInt(4)));
    s[12] = JSBIUtils.toInt8(JSBI.signedRightShift(S[4], JSBI.BigInt(12)));
    s[13] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[4], JSBI.BigInt(20)), JSBI.multiply(S[5], JSBI.BigInt(1 << 1))));
    s[14] = JSBIUtils.toInt8(JSBI.signedRightShift(S[5], JSBI.BigInt(7)));
    s[15] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[5], JSBI.BigInt(15)), JSBI.multiply(S[6], JSBI.BigInt(1 << 6))));
    s[16] = JSBIUtils.toInt8(JSBI.signedRightShift(S[6], JSBI.BigInt(2)));
    s[17] = JSBIUtils.toInt8(JSBI.signedRightShift(S[6], JSBI.BigInt(10)));
    s[18] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[6], JSBI.BigInt(18)), JSBI.multiply(S[7], JSBI.BigInt(1 << 3))));
    s[19] = JSBIUtils.toInt8(JSBI.signedRightShift(S[7], JSBI.BigInt(5)));
    s[20] = JSBIUtils.toInt8(JSBI.signedRightShift(S[7], JSBI.BigInt(13)));
    s[21] = JSBIUtils.toInt8(S[8]);
    s[22] = JSBIUtils.toInt8(JSBI.signedRightShift(S[8], JSBI.BigInt(8)));
    s[23] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[8], JSBI.BigInt(16)), JSBI.multiply(S[9], JSBI.BigInt(1 << 5))));
    s[24] = JSBIUtils.toInt8(JSBI.signedRightShift(S[9], JSBI.BigInt(3)));
    s[25] = JSBIUtils.toInt8(JSBI.signedRightShift(S[9], JSBI.BigInt(11)));
    s[26] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[9], JSBI.BigInt(19)), JSBI.multiply(S[10], JSBI.BigInt(1 << 2))));
    s[27] = JSBIUtils.toInt8(JSBI.signedRightShift(S[10], JSBI.BigInt(6)));
    s[28] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[10], JSBI.BigInt(14)), JSBI.multiply(S[11], JSBI.BigInt(1 << 7))));
    s[29] = JSBIUtils.toInt8(JSBI.signedRightShift(S[11], JSBI.BigInt(1)));
    s[30] = JSBIUtils.toInt8(JSBI.signedRightShift(S[11], JSBI.BigInt(9)));
    s[31] = JSBIUtils.toInt8(JSBI.signedRightShift(S[11], JSBI.BigInt(17)));
}

export function sc25519_is_canonical (s: Uint8Array): number
{
    /* 2^252+27742317777372353535851937790883648493 */
    let L = [
        0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7,
        0xa2, 0xde, 0xf9, 0xde, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10
    ];
    let c = 0;
    let n = 1;
    let i = 32;

    do {
        i--;
        c = (c | ((s[i] - L[i]) >> 8) & n) & 0xff;
        n = (n & ((s[i] ^ L[i]) - 1) >> 8) & 0xff;
    } while (i != 0);

    return (c != 0) ? 1 : 0;
}
