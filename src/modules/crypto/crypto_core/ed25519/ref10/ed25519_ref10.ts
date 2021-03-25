import { ED25519Utils, JSBIUtils } from "../../../";
import JSBI from "jsbi";

export class FE25519
{
    public static WIDTH = 10;
    /* sqrt(-1) */
    public static SqrtM1 = new FE25519([-32595792, -7943725,  9377950,  3500415, 12389472, -272473, -25146209, -2005654, 326686, 11406482]);
    /* sqrt(-486664) */
    public static SqrtAM2 = new FE25519([-12222970, -8312128, -11511410, 9067497, -15300785, -241793, 25456130, 14121551, -12187136, 3972024]);
    /* 37095705934669439343138083508754565189542113879843219016388785533085940283555 */
    public static D = new FE25519([-10913610, 13857413, -15372611, 6949391,   114729, -8787816, -6275908, -3247719, -18696448, -12055116]);
    /* 2 * d =
    * 16295367250680780974490674513165176452449235426866156013048779062215315747161
    */
    public static D2 = new FE25519([-21827239, -5839606,  -30745221, 13898782, 229458, 15978800, -12551817, -6495438, 29715968, 9444199]);
    /* A = 486662 */
    public static A = new FE25519([486662, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    /* sqrt(ad - 1) with a = -1 (mod p) */
    public static SqrtADM1 = new FE25519([24849947, -153582, -23613485, 6347715, -21072328, -667138, -25271143, -15367704, -870347, 14525639]);
    /* 1 / sqrt(a - d) */
    public static InvSqrtAMD = new FE25519([6111485, 4156064, -27798727, 12243468, -25904040, 120897, 20826367, -7060776, 6093568, -1986012]);
    /* 1 - d ^ 2 */
    public static OneMSqrtD = new FE25519([6275446, -16617371, -22938544, -3773710, 11667077, 7397348, -27922721, 1766195, -24433858, 672203]);
    /* (d - 1) ^ 2 */
    public static SqrtDMOne = new FE25519([15551795, -11097455, -13425098, -10125071, -11896535, 10178284, -26634327, 4729244, -5282110, -10116402]);

    public items: Int32Array;

    constructor (values?: Array<number> | Int32Array | FE25519)
    {
        this.items = new Int32Array(10);
        if (values !== undefined) {
            if (values instanceof Int32Array)
                values.forEach((m, i) => this.items[i] = m);
            else if (values instanceof FE25519)
                values.items.forEach((m, i) => this.items[i] = m);
            else
                values.forEach((m, i) => this.items[i] = m);
        }
    }

    public fromBytes (s: Uint8Array)
    {
        let H: Array<JSBI> = [];
        let Carry: Array<JSBI> = [];

        for (let idx = 0; idx < 10; idx++)
            H.push(JSBI.BigInt(0));

        for (let idx = 0; idx < 10; idx++)
            Carry.push(JSBI.BigInt(0))

        H[0] = ED25519Utils.load_4(s, 0);
        H[1] = JSBI.leftShift(ED25519Utils.load_3(s, 4), JSBI.BigInt(6));
        H[2] = JSBI.leftShift(ED25519Utils.load_3(s, 7), JSBI.BigInt(5));
        H[3] = JSBI.leftShift(ED25519Utils.load_3(s, 10), JSBI.BigInt(3));
        H[4] = JSBI.leftShift(ED25519Utils.load_3(s, 13), JSBI.BigInt(2));
        H[5] = ED25519Utils.load_4(s, 16);
        H[6] = JSBI.leftShift(ED25519Utils.load_3(s, 16), JSBI.BigInt(7));
        H[7] = JSBI.leftShift(ED25519Utils.load_3(s, 20), JSBI.BigInt(5));
        H[8] = JSBI.leftShift(ED25519Utils.load_3(s, 23), JSBI.BigInt(4));
        H[9] = JSBI.leftShift(JSBI.bitwiseAnd(ED25519Utils.load_3(s, 29), JSBI.BigInt(8388607)), JSBI.BigInt(2));

        let f1 = (i: number) => {
            let j = (i+1) % FE25519.WIDTH;
            Carry[i] =JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
            H[j] = JSBI.add(H[j], JSBI.multiply(Carry[i], JSBI.BigInt(19)));
            H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
        }
        f1(0);

        let f2 = (i: number) => {
            let j = (i+1) % FE25519.WIDTH;
            Carry[i] =JSBI.signedRightShift(JSBI.add(H[i], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
            H[j] = JSBI.add(H[j], Carry[i]);
            H[i] = JSBI.subtract(H[i], JSBI.multiply(Carry[i], JSBI.BigInt(1 << 25)));
        }

        f2(1);
        f2(3);
        f2(5);
        f2(7);
        f2(0);
        f2(2);
        f2(4);
        f2(6);
        f2(8);

        H.forEach((v, idx) => this.items[idx] = JSBIUtils.toInt8(H[idx]));
    }

    public toBytes (): Uint8Array
    {
        let t = new FE25519();
        t.reduce2(this);
        let s = new Uint8Array(32);

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

        return s;
    }

    /**
     h = 0
     **/
    public zero ()
    {
        this.items.fill(0);
    }

    /**
     h = 1
     **/
    public one ()
    {
        this.items[0] = 1;
        this.items[1] = 0;
        this.items.fill(0, 2);
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
    public add (f: FE25519, g: FE25519)
    {
        for (let idx = 0; idx < FE25519.WIDTH; idx++)
            f.items[idx] = f.items[idx] + g.items[idx];
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
    public sub (f: FE25519, g: FE25519)
    {
        for (let idx = 0; idx < FE25519.WIDTH; idx++)
            f.items[idx] = f.items[idx] - g.items[idx];
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
    public negate ()
    {
        this.items.forEach((m, i) => this.items[i] = -m);
    }

    /**
     * Replace (f,g) with (g,g) if b == 1;
     * Replace (f,g) with (f,g) if b == 0.
     */
    public cmov (f: FE25519, g: FE25519, b: number)
    {
        let mask = (b == 0) ? 0x00000000 : 0xFFFFFFFF;
        let x = g.items.map((mg,i) => f.items[i] ^ mg);
        x.forEach((mx, i) => x[i] = mx & mask);
        x.forEach((mx, i) => this.items[i] = f.items[i] ^ mx);
    }

    public copy (h: FE25519)
    {
        h.items.forEach((mh, i) => this.items[i] = mh);
    }

    /**
     * return 1 if f is in {1,3,5,...,q-2}
     * return 0 if f is in {0,2,4,...,q-1}
     *
     * Preconditions:
     * |f| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
     **/
    public isNegative (): number
    {
        let s = this.toBytes();
        return s[0] & 1;
    }

    /**
     * return 1 if f == 0
     * return 0 if f != 0
     *
     * Preconditions:
     * |f| bounded by 1.1*2^26,1.1*2^25,1.1*2^26,1.1*2^25,etc.
     **/
    public isZero (): number
    {
        let s = this.toBytes();
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
    public mul (f: FE25519, g: FE25519)
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
        func24(9);
        /* |h9| <= 2^24; from now on fits into int32 unchanged */
        /* |h0| <= 1.1*2^39 */
        func25(0);
        /* |h0| <= 2^25; from now on fits into int32 unchanged */
        /* |h1| <= 1.01*2^24 */

        H.forEach((mh, i) => this.items[i] = JSBIUtils.toInt32(mh));
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
    public sq (f: FE25519)
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

        func24(9);
        func25(0);

        H.forEach((mh, i) => this.items[i] = JSBIUtils.toInt32(mh));
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
    public sq2 (f: FE25519)
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

        H.forEach((m, i) => H[i] = JSBI.add(m, m));

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

        func24(9);
        func25(0);

        H.forEach((mh, i) => this.items[i] = JSBIUtils.toInt32(mh));
    }


    public mul32 (f: FE25519, n: number)
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

        H.forEach((mh, i) => this.items[i] = JSBIUtils.toInt32(mh));
    }

    /**
     * Inversion - returns 0 if z=0
     **/
    public invert (z: FE25519)
    {
        let t0 = new FE25519();
        let t1 = new FE25519();
        let t2 = new FE25519();
        let t3 = new FE25519();
        let i: number;

        t0.sq(z);
        t1.sq(t0);
        t1.sq(t1);
        t1.mul(z, t1)
        t0.mul(t0, t1);
        t2.sq(t0);
        t1.mul(t1, t2);
        t2.sq(t1);
        for (i = 1; i < 5; ++i) {
            t2.sq(t2);
        }
        t1.mul(t2, t1);
        t2.sq(t1);
        for (i = 1; i < 10; ++i) {
            t2.sq(t2);
        }
        t2.mul(t2, t1);
        t3.sq(t2);
        for (i = 1; i < 20; ++i) {
            t3.sq(t3);
        }
        t2.mul(t3, t2);
        for (i = 1; i < 11; ++i) {
            t2.sq(t2);
        }
        t1.mul(t2, t1);
        t2.sq(t1);
        for (i = 1; i < 50; ++i) {
            t2.sq(t2);
        }
        t2.mul(t2, t1);
        t3.sq(t2);
        for (i = 1; i < 100; ++i) {
            t3.sq(t3);
        }
        t2.mul(t3, t2);
        for (i = 1; i < 51; ++i) {
            t2.sq(t2);
        }
        t1.mul(t2, t1);
        for (i = 1; i < 6; ++i) {
            t1.sq(t1);
        }
        this.mul(t1, t0);
    }

    /**
     * returns z^((p-5)/8) = z^(2^252-3)
     * used to compute square roots since we have p=5 (mod 8); see Cohen and Frey.
     **/
    public pow22523 (z: FE25519)
    {
        let t0 = new FE25519();
        let t1 = new FE25519();
        let t2 = new FE25519();
        let i: number;

        t0.sq(z);
        t1.sq(t0);
        t1.sq(t1);
        t1.mul(z, t1);
        t0.mul(t0, t1);
        t0.sq(t0);
        t0.mul(t1, t0);
        t1.sq(t0);
        for (i = 1; i < 5; ++i) {
            t1.sq(t1);
        }
        t0.mul(t1, t0);
        t1.sq(t0);
        for (i = 1; i < 10; ++i) {
            t1.sq(t1);
        }
        t1.mul(t1, t0);
        t2.sq(t1);
        for (i = 1; i < 20; ++i) {
            t2.sq(t2);
        }
        t1.mul(t2, t1);
        for (i = 1; i < 11; ++i) {
            t1.sq(t1);
        }
        t0.mul(t1, t0);
        t1.sq(t0);
        for (i = 1; i < 50; ++i) {
            t1.sq(t1);
        }
        t1.mul(t1, t0);
        t2.sq(t1);
        for (i = 1; i < 100; ++i) {
            t2.sq(t2);
        }
        t1.mul(t2, t1);
        for (i = 1; i < 51; ++i) {
            t1.sq(t1);
        }
        t0.mul(t1, t0);
        t0.sq(t0);
        t0.sq(t0);
        this.mul(t0, z);
    }

    public cneg (f: FE25519, b: number)
    {
        let neg_f = new FE25519(f);
        neg_f.negate();
        this.cmov(f, neg_f, b);
    }

    public abs (f: FE25519)
    {
        this.cneg(f, f.isNegative());
    }

    public unchecked_sqrt (x: FE25519, x2: FE25519)
    {

    }

    public sqrt (x: FE25519, x2: FE25519)
    {
        let check
    }
    public reduce2 (f: FE25519)
    {
        let H = f.items.map(m => m);
        let Q: number;
        let Carry = new Int32Array(10);

        Q = (19 * H[9] + (1 << 24)) >> 25;
        Q = (H[0] + Q) >> 26;
        Q = (H[1] + Q) >> 25;
        Q = (H[2] + Q) >> 26;
        Q = (H[3] + Q) >> 25;
        Q = (H[4] + Q) >> 26;
        Q = (H[5] + Q) >> 25;
        Q = (H[6] + Q) >> 26;
        Q = (H[7] + Q) >> 25;
        Q = (H[8] + Q) >> 26;
        Q = (H[9] + Q) >> 25;

        /* Goal: Output h-(2^255-19)q, which is between 0 and 2^255-20. */
        H[0] += 19 * Q;
        /* Goal: Output h-2^255 q, which is between 0 and 2^255-20. */

        for (let idx = 0; idx < 8; idx += 2)
        {
            Carry[idx] = H[idx] >> 26;
            H[idx+1] += Carry[idx];
            H[idx] -= Carry[idx] * (1 << 26);

            Carry[idx+1] = H[idx+1] >> 25;
            H[idx+2] += Carry[idx+1];
            H[idx+1] -= Carry[idx+1] * (1 << 25);
        }

        H.forEach((v, idx) => this.items[idx] = H[idx]);
    }

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

export function sc25519_reduce (s: Uint8Array): Uint8Array
{
    if (s.length != ED25519Utils.crypto_core_ed25519_BYTES)
        throw new Error("The size of the entered buffer is not 64.");

    let S: Array<JSBI> = [];
    let Carry: Array<JSBI> = [];

    for (let idx = 0; idx < 24; idx++)
        S.push(JSBI.BigInt(0));

    for (let idx = 0; idx < 16; idx++)
        Carry.push(JSBI.BigInt(0))

    let N2097151 = JSBI.BigInt(2097151)
    S[0]  = JSBI.bitwiseAnd(N2097151, ED25519Utils.load_3(s, 0));
    S[1]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 2), JSBI.BigInt(5)));
    S[2]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 5), JSBI.BigInt(2)));
    S[3]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 7), JSBI.BigInt(7)));
    S[4]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 10), JSBI.BigInt(4)));
    S[5]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 13), JSBI.BigInt(1)));
    S[6]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 15), JSBI.BigInt(6)));
    S[7]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 18), JSBI.BigInt(3)));
    S[8]  = JSBI.bitwiseAnd(N2097151, ED25519Utils.load_3(s, 21));
    S[9]  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 23), JSBI.BigInt(5)));
    S[10] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 26), JSBI.BigInt(2)));
    S[11] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 28), JSBI.BigInt(7)));
    S[12] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 31), JSBI.BigInt(4)));
    S[13] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 34), JSBI.BigInt(1)));
    S[14] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 36), JSBI.BigInt(6)));
    S[15] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 39), JSBI.BigInt(3)));
    S[16] = JSBI.bitwiseAnd(N2097151, ED25519Utils.load_3(s, 42));
    S[17] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 44), JSBI.BigInt(5)));
    S[18] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 47), JSBI.BigInt(2)));
    S[19] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 49), JSBI.BigInt(7)));
    S[20] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 52), JSBI.BigInt(4)));
    S[21] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 55), JSBI.BigInt(1)));
    S[22] = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 57), JSBI.BigInt(6)));
    S[23] = JSBI.signedRightShift(ED25519Utils.load_4(s, 60), JSBI.BigInt(3));

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

    let t = new Uint8Array(32);
    t[0]  = JSBIUtils.toInt8(S[0]);
    t[1]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[0], JSBI.BigInt(8)));
    t[2]  = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[0], JSBI.BigInt(16)), JSBI.multiply(S[1], JSBI.BigInt(1 << 5))));
    t[3]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[1], JSBI.BigInt(3)));
    t[4]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[1], JSBI.BigInt(11)));
    t[5]  = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[1], JSBI.BigInt(19)), JSBI.multiply(S[2], JSBI.BigInt(1 << 2))));
    t[6]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[2], JSBI.BigInt(6)));
    t[7]  = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[2], JSBI.BigInt(14)), JSBI.multiply(S[3], JSBI.BigInt(1 << 7))));
    t[8]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[3], JSBI.BigInt(1)));
    t[9]  = JSBIUtils.toInt8(JSBI.signedRightShift(S[3], JSBI.BigInt(9)));
    t[10] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[3], JSBI.BigInt(17)), JSBI.multiply(S[4], JSBI.BigInt(1 << 4))));
    t[11] = JSBIUtils.toInt8(JSBI.signedRightShift(S[4], JSBI.BigInt(4)));
    t[12] = JSBIUtils.toInt8(JSBI.signedRightShift(S[4], JSBI.BigInt(12)));
    t[13] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[4], JSBI.BigInt(20)), JSBI.multiply(S[5], JSBI.BigInt(1 << 1))));
    t[14] = JSBIUtils.toInt8(JSBI.signedRightShift(S[5], JSBI.BigInt(7)));
    t[15] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[5], JSBI.BigInt(15)), JSBI.multiply(S[6], JSBI.BigInt(1 << 6))));
    t[16] = JSBIUtils.toInt8(JSBI.signedRightShift(S[6], JSBI.BigInt(2)));
    t[17] = JSBIUtils.toInt8(JSBI.signedRightShift(S[6], JSBI.BigInt(10)));
    t[18] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[6], JSBI.BigInt(18)), JSBI.multiply(S[7], JSBI.BigInt(1 << 3))));
    t[19] = JSBIUtils.toInt8(JSBI.signedRightShift(S[7], JSBI.BigInt(5)));
    t[20] = JSBIUtils.toInt8(JSBI.signedRightShift(S[7], JSBI.BigInt(13)));
    t[21] = JSBIUtils.toInt8(S[8]);
    t[22] = JSBIUtils.toInt8(JSBI.signedRightShift(S[8], JSBI.BigInt(8)));
    t[23] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[8], JSBI.BigInt(16)), JSBI.multiply(S[9], JSBI.BigInt(1 << 5))));
    t[24] = JSBIUtils.toInt8(JSBI.signedRightShift(S[9], JSBI.BigInt(3)));
    t[25] = JSBIUtils.toInt8(JSBI.signedRightShift(S[9], JSBI.BigInt(11)));
    t[26] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[9], JSBI.BigInt(19)), JSBI.multiply(S[10], JSBI.BigInt(1 << 2))));
    t[27] = JSBIUtils.toInt8(JSBI.signedRightShift(S[10], JSBI.BigInt(6)));
    t[28] = JSBIUtils.toInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[10], JSBI.BigInt(14)), JSBI.multiply(S[11], JSBI.BigInt(1 << 7))));
    t[29] = JSBIUtils.toInt8(JSBI.signedRightShift(S[11], JSBI.BigInt(1)));
    t[30] = JSBIUtils.toInt8(JSBI.signedRightShift(S[11], JSBI.BigInt(9)));
    t[31] = JSBIUtils.toInt8(JSBI.signedRightShift(S[11], JSBI.BigInt(17)));

    return t;
}

export function ge25519_xmont_to_ymont (x: FE25519, y: FE25519)
{

}
export function ge25519_elligator2 (x: FE25519, y: FE25519, r: FE25519): number
{
    return 0;
}

/* montgomery to edwards */
export function ge25519_mont_to_ed (xed: FE25519, yed: FE25519, x: FE25519, y: FE25519)
{
    let one = new FE25519();
    let x_plus_one = new FE25519();
    let x_minus_one = new FE25519();
    let x_plus_one_y_inv = new FE25519();

    one.one();
    x_plus_one.add(x, one);
    x_minus_one.sub(x, one);

    /* xed = sqrt(-A-2)*x/y */
    x_plus_one_y_inv.mul(x_plus_one, y);
    x_plus_one_y_inv.invert(x_plus_one_y_inv); /* 1/((x+1)*y) */
    xed.mul(x, FE25519.SqrtAM2);
    xed.mul(xed, x_plus_one_y_inv);            /* sqrt(-A-2)*x/((x+1)*y) */
    xed.mul(xed, x_plus_one);

    /* yed = (x-1)/(x+1) */
    yed.mul(x_plus_one_y_inv, y);              /* 1/(x+1) */
    yed.mul(yed, x_minus_one);
    yed.cmov(yed, one, x_plus_one_y_inv.isZero());
}

export function ge25519_clear_cofactor (p3: GE25519_P3)
{

}

export function ge25519_p3_tobytes(s: Uint8Array, h: GE25519_P3)
{

}

export function ge25519_from_uniform (r: Uint8Array): Uint8Array
{
    let p3 = new GE25519_P3();
    let x = new FE25519();
    let y = new FE25519();
    let r_fe = new FE25519();
    let x_sign: number;
    let s = new Uint8Array(32);

    for (let idx = 0; idx < 32; idx++)
        s[idx] = r[idx];

    x_sign = s[31] >> 7;
    s[31] &= 0x7f;

    r_fe.fromBytes(s);

    ge25519_elligator2(x, y, r_fe);

    ge25519_mont_to_ed(p3.X, p3.Y, x, y);
    let neg_xed = new FE25519(p3.X);
    neg_xed.negate();
    p3.X.cmov(p3.X, neg_xed, p3.X.isNegative() ^ x_sign);

    p3.Z.one();
    p3.T.mul(p3.X, p3.Y);

    ge25519_clear_cofactor(p3);
    ge25519_p3_tobytes(s, p3);

    return s;
}
