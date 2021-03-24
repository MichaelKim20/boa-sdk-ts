import { ED25519Utils, JSBIUtils } from "../../../";
import JSBI from "jsbi";

export class FE25519
{
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

    constructor (values?: Array<number> | Int32Array)
    {
        this.items = new Int32Array(10);
        if (values !== undefined) {
            if (values instanceof Int32Array)
                values.forEach((m, i) => this.items[i] = m);
            else
                values.forEach((m, i) => this.items[i] = m);
        }
    }

    public get (index : number) : number
    {
        if ((index < 0) || (index >= this.items.length))
            return -1;
        return this.items[index];
    }

    public fromBytes(s: Uint8Array)
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
            let i0 = i;
            let i1 = (i+1) % 10;
            Carry[i0] =JSBI.signedRightShift(JSBI.add(H[i0], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
            H[i1] = JSBI.add(H[i1], JSBI.multiply(Carry[i0], JSBI.BigInt(19)));
            H[i0] = JSBI.subtract(H[i0], JSBI.multiply(Carry[i0], JSBI.BigInt(1 << 25)));
        }
        f1(0);

        let f2 = (i: number) => {
            let i0 = i;
            let i1 = (i+1) % 10;
            Carry[i0] =JSBI.signedRightShift(JSBI.add(H[i0], JSBI.BigInt(1 << 24)), JSBI.BigInt(25));
            H[i1] = JSBI.add(H[i1], Carry[i0]);
            H[i0] = JSBI.subtract(H[i0], JSBI.multiply(Carry[i0], JSBI.BigInt(1 << 25)));
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

    public negate(): FE25519
    {
        return new FE25519(this.items.map(m => -m));
    }

    /**
     *
     * Replace (f,g) with (g,g) if b == 1;
     * replace (f,g) with (f,g) if b == 0.
     * @param g
     * @param b
     */
    public cmov (g: FE25519, b: number)
    {
        let mask = (b == 0) ? 0x00000000 : 0xFFFFFFFF;
        let x = g.items.map((m,i) => this.items[i] ^ m);
        x.forEach((m, i) => x[i] &= m);
        x.forEach((m, i) => this.items[i] ^= m);
    }

    public reduce2 (): FE25519
    {
        let H = this.items.map(m => m);
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

        H.forEach((m, i) => this.items[i] = m);
        return new FE25519(H);
    }

    public toBytes (): Uint8Array
    {
        let t = this.reduce2().items;
        let s = new Uint8Array(32);

        s[0]  = t[0] >> 0;
        s[1]  = t[0] >> 8;
        s[2]  = t[0] >> 16;
        s[3]  = (t[0] >> 24) | (t[1] * (1 << 2));
        s[4]  = t[1] >> 6;
        s[5]  = t[1] >> 14;
        s[6]  = (t[1] >> 22) | (t[2] * (1 << 3));
        s[7]  = t[2] >> 5;
        s[8]  = t[2] >> 13;
        s[9]  = (t[2] >> 21) | (t[3] * (1 << 5));
        s[10] = t[3] >> 3;
        s[11] = t[3] >> 11;
        s[12] = (t[3] >> 19) | (t[4] * (1 << 6));
        s[13] = t[4] >> 2;
        s[14] = t[4] >> 10;
        s[15] = t[4] >> 18;
        s[16] = t[5] >> 0;
        s[17] = t[5] >> 8;
        s[18] = t[5] >> 16;
        s[19] = (t[5] >> 24) | (t[6] * (1 << 1));
        s[20] = t[6] >> 7;
        s[21] = t[6] >> 15;
        s[22] = (t[6] >> 23) | (t[7] * (1 << 3));
        s[23] = t[7] >> 5;
        s[24] = t[7] >> 13;
        s[25] = (t[7] >> 21) | (t[8] * (1 << 4));
        s[26] = t[8] >> 4;
        s[27] = t[8] >> 12;
        s[28] = (t[8] >> 20) | (t[9] * (1 << 6));
        s[29] = t[9] >> 2;
        s[30] = t[9] >> 10;
        s[31] = t[9] >> 18;

        return s;
    }

    public isNegative(): number
    {
        let s = this.toBytes();
        return s[0] & 1;
    }

    /**
     h = 1
     **/
    public setOne()
    {
        this.items[0] = 1;
        this.items[1] = 0;
        for (let idx = 2; idx < this.items.length; idx++)
            this.items[idx] = 0;
    }

    public static mul(f: FE25519, g: FE25519): FE25519
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

        let h0 = ED25519Utils.Sum([f0g0, f1g9_38, f2g8_19, f3g7_38, f4g6_19, f5g5_38, f6g4_19, f7g3_38, f8g2_19, f9g1_38]);
        let h1 = ED25519Utils.Sum([f0g1, f1g0, f2g9_19, f3g8_19, f4g7_19, f5g6_19, f6g5_19, f7g4_19, f8g3_19, f9g2_19]);
        let h2 = ED25519Utils.Sum([f0g2, f1g1_2, f2g0, f3g9_38, f4g8_19, f5g7_38, f6g6_19, f7g5_38, f8g4_19, f9g3_38]);
        let h3 = ED25519Utils.Sum([f0g3, f1g2, f2g1, f3g0, f4g9_19, f5g8_19, f6g7_19, f7g6_19, f8g5_19, f9g4_19]);
        let h4 = ED25519Utils.Sum([f0g4, f1g3_2, f2g2, f3g1_2, f4g0, f5g9_38, f6g8_19, f7g7_38, f8g6_19, f9g5_38]);
        let h5 = ED25519Utils.Sum([f0g5, f1g4, f2g3, f3g2, f4g1, f5g0, f6g9_19, f7g8_19, f8g7_19, f9g6_19]);
        let h6 = ED25519Utils.Sum([f0g6, f1g5_2, f2g4, f3g3_2, f4g2, f5g1_2, f6g0, f7g9_38, f8g8_19, f9g7_38]);
        let h7 = ED25519Utils.Sum([f0g7, f1g6, f2g5, f3g4, f4g3, f5g2, f6g1, f7g0, f8g9_19, f9g8_19]);
        let h8 = ED25519Utils.Sum([f0g8, f1g7_2, f2g6, f3g5_2, f4g4, f5g3_2, f6g2, f7g1_2, f8g0, f9g9_38]);
        let h9 = ED25519Utils.Sum([f0g9, f1g8, f2g7, f3g6, f4g5, f5g4, f6g3, f7g2, f8g1, f9g0]);

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

        /*
         |h0| <= (1.65*1.65*2^52*(1+19+19+19+19)+1.65*1.65*2^50*(38+38+38+38+38))
         i.e. |h0| <= 1.4*2^60; narrower ranges for h2, h4, h6, h8
         |h1| <= (1.65*1.65*2^51*(1+1+19+19+19+19+19+19+19+19))
         i.e. |h1| <= 1.7*2^59; narrower ranges for h3, h5, h7, h9
         */

        carry0 = (h0 + (1L << 25)) >> 26;
        h1 += carry0;
        h0 -= carry0 * ((ulet) 1L << 26);

        carry4 = (h4 + (1L << 25)) >> 26;
        h5 += carry4;
        h4 -= carry4 * ((ulet) 1L << 26);
        /* |h0| <= 2^25 */
        /* |h4| <= 2^25 */
        /* |h1| <= 1.71*2^59 */
        /* |h5| <= 1.71*2^59 */

        carry1 = (h1 + (1L << 24)) >> 25;
        h2 += carry1;
        h1 -= carry1 * ((ulet) 1L << 25);
        carry5 = (h5 + (1L << 24)) >> 25;
        h6 += carry5;
        h5 -= carry5 * ((ulet) 1L << 25);
        /* |h1| <= 2^24; from now on fits into int32 */
        /* |h5| <= 2^24; from now on fits into int32 */
        /* |h2| <= 1.41*2^60 */
        /* |h6| <= 1.41*2^60 */

        carry2 = (h2 + (1L << 25)) >> 26;
        h3 += carry2;
        h2 -= carry2 * ((ulet) 1L << 26);
        carry6 = (h6 + (1L << 25)) >> 26;
        h7 += carry6;
        h6 -= carry6 * ((ulet) 1L << 26);
        /* |h2| <= 2^25; from now on fits into int32 unchanged */
        /* |h6| <= 2^25; from now on fits into int32 unchanged */
        /* |h3| <= 1.71*2^59 */
        /* |h7| <= 1.71*2^59 */

        carry3 = (h3 + (1L << 24)) >> 25;
        h4 += carry3;
        h3 -= carry3 * ((ulet) 1L << 25);
        carry7 = (h7 + (1L << 24)) >> 25;
        h8 += carry7;
        h7 -= carry7 * ((ulet) 1L << 25);
        /* |h3| <= 2^24; from now on fits into int32 unchanged */
        /* |h7| <= 2^24; from now on fits into int32 unchanged */
        /* |h4| <= 1.72*2^34 */
        /* |h8| <= 1.41*2^60 */

        carry4 = (h4 + (1L << 25)) >> 26;
        h5 += carry4;
        h4 -= carry4 * ((ulet) 1L << 26);
        carry8 = (h8 + (1L << 25)) >> 26;
        h9 += carry8;
        h8 -= carry8 * ((ulet) 1L << 26);
        /* |h4| <= 2^25; from now on fits into int32 unchanged */
        /* |h8| <= 2^25; from now on fits into int32 unchanged */
        /* |h5| <= 1.01*2^24 */
        /* |h9| <= 1.71*2^59 */

        carry9 = (h9 + (1L << 24)) >> 25;
        h0 += carry9 * 19;
        h9 -= carry9 * ((ulet) 1L << 25);
        /* |h9| <= 2^24; from now on fits into int32 unchanged */
        /* |h0| <= 1.1*2^39 */

        carry0 = (h0 + (1L << 25)) >> 26;
        h1 += carry0;
        h0 -= carry0 * ((ulet) 1L << 26);
        /* |h0| <= 2^25; from now on fits into int32 unchanged */
        /* |h1| <= 1.01*2^24 */

        let h = new FE25519();
        h.items[0] = JSBIUtils.toInt32(h0);
        h.items[1] = JSBIUtils.toInt32(h1);
        h.items[2] = JSBIUtils.toInt32(h2);
        h.items[3] = JSBIUtils.toInt32(h3);
        h.items[4] = JSBIUtils.toInt32(h4);
        h.items[5] = JSBIUtils.toInt32(h5);
        h.items[6] = JSBIUtils.toInt32(h6);
        h.items[7] = JSBIUtils.toInt32(h7);
        h.items[8] = JSBIUtils.toInt32(h8);
        h.items[9] = JSBIUtils.toInt32(h9);
        return h;
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

    let f1 = (i: number, j: number) => {
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

    let f2 = (i: number) => {
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

    let f3 = (i: number) => {
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

/*
export function sc25519_reduce (s: Buffer): Buffer
{
    if (s.length != 64)
        throw new Error("The size of the entered buffer is not 64.");

    let S: Array<JSBI> = [];
    let Carry: Array<JSBI> = [];
    for (let idx = 0; idx < 32; idx++) {
        S.push(JSBI.BigInt(0));
        Carry.push(JSBI.BigInt(0))
    }

    let N2097151 = JSBI.BigInt(2097151)
    let s0  = JSBI.bitwiseAnd(N2097151, ED25519Utils.load_3(s, 0));
    let s1  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 2), JSBI.BigInt(5)));
    let s2  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 5), JSBI.BigInt(2)));
    let s3  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 7), JSBI.BigInt(7)));
    let s4  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 10), JSBI.BigInt(4)));
    let s5  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 13), JSBI.BigInt(1)));
    let s6  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 15), JSBI.BigInt(6)));
    let s7  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 18), JSBI.BigInt(3)));
    let s8  = JSBI.bitwiseAnd(N2097151, ED25519Utils.load_3(s, 21));
    let s9  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 23), JSBI.BigInt(5)));
    let s10 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 26), JSBI.BigInt(2)));
    let s11 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 28), JSBI.BigInt(7)));
    let s12 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 31), JSBI.BigInt(4)));
    let s13 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 34), JSBI.BigInt(1)));
    let s14 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 36), JSBI.BigInt(6)));
    let s15 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 39), JSBI.BigInt(3)));
    let s16  = JSBI.bitwiseAnd(N2097151, ED25519Utils.load_3(s, 42));
    let s17 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 44), JSBI.BigInt(5)));
    let s18 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 47), JSBI.BigInt(2)));
    let s19 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 49), JSBI.BigInt(7)));
    let s20 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 52), JSBI.BigInt(4)));
    let s21 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_3(s, 55), JSBI.BigInt(1)));
    let s22 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(ED25519Utils.load_4(s, 57), JSBI.BigInt(6)));
    let s23 = JSBI.signedRightShift(ED25519Utils.load_4(s, 60), JSBI.BigInt(3));

    s11 = JSBI.add(s11, JSBI.multiply(s23, JSBI.BigInt(666643)));
    s12 = JSBI.add(s12, JSBI.multiply(s23, JSBI.BigInt(470296)));
    s13 = JSBI.add(s13, JSBI.multiply(s23, JSBI.BigInt(654183)));
    s14 = JSBI.add(s14, JSBI.multiply(s23, JSBI.BigInt(997805)));
    s15 = JSBI.add(s15, JSBI.multiply(s23, JSBI.BigInt(136657)));
    s16 = JSBI.add(s16, JSBI.multiply(s23, JSBI.BigInt(683901)));

    s10 = JSBI.add(s10, JSBI.multiply(s22, JSBI.BigInt(666643)));
    s11 = JSBI.add(s11, JSBI.multiply(s22, JSBI.BigInt(470296)));
    s12 = JSBI.add(s12, JSBI.multiply(s22, JSBI.BigInt(654183)));
    s13 = JSBI.add(s13, JSBI.multiply(s22, JSBI.BigInt(997805)));
    s14 = JSBI.add(s14, JSBI.multiply(s22, JSBI.BigInt(136657)));
    s15 = JSBI.add(s15, JSBI.multiply(s22, JSBI.BigInt(683901)));

    s9  = JSBI.add(s9 , JSBI.multiply(s21, JSBI.BigInt(666643)));
    s10 = JSBI.add(s10, JSBI.multiply(s21, JSBI.BigInt(470296)));
    s11 = JSBI.add(s11, JSBI.multiply(s21, JSBI.BigInt(654183)));
    s12 = JSBI.add(s12, JSBI.multiply(s21, JSBI.BigInt(997805)));
    s13 = JSBI.add(s13, JSBI.multiply(s21, JSBI.BigInt(136657)));
    s14 = JSBI.add(s14, JSBI.multiply(s21, JSBI.BigInt(683901)));

    s8  = JSBI.add(s8 , JSBI.multiply(s20, JSBI.BigInt(666643)));
    s9  = JSBI.add(s9 , JSBI.multiply(s20, JSBI.BigInt(470296)));
    s10 = JSBI.add(s10, JSBI.multiply(s20, JSBI.BigInt(654183)));
    s11 = JSBI.add(s11, JSBI.multiply(s20, JSBI.BigInt(997805)));
    s12 = JSBI.add(s12, JSBI.multiply(s20, JSBI.BigInt(136657)));
    s13 = JSBI.add(s13, JSBI.multiply(s20, JSBI.BigInt(683901)));

    s7  = JSBI.add(s7,  JSBI.multiply(s19, JSBI.BigInt(666643)));
    s8  = JSBI.add(s8,  JSBI.multiply(s19, JSBI.BigInt(470296)));
    s9  = JSBI.add(s9,  JSBI.multiply(s19, JSBI.BigInt(654183)));
    s10 = JSBI.add(s10, JSBI.multiply(s19, JSBI.BigInt(997805)));
    s11 = JSBI.add(s11, JSBI.multiply(s19, JSBI.BigInt(136657)));
    s12 = JSBI.add(s12, JSBI.multiply(s19, JSBI.BigInt(683901)));

    s6  = JSBI.add(s6,  JSBI.multiply(s18, JSBI.BigInt(666643)));
    s7  = JSBI.add(s7,  JSBI.multiply(s18, JSBI.BigInt(470296)));
    s8  = JSBI.add(s8,  JSBI.multiply(s18, JSBI.BigInt(654183)));
    s9  = JSBI.add(s9,  JSBI.multiply(s18, JSBI.BigInt(997805)));
    s10 = JSBI.add(s10, JSBI.multiply(s18, JSBI.BigInt(136657)));
    s11 = JSBI.add(s11, JSBI.multiply(s18, JSBI.BigInt(683901)));

    let carry6 = JSBI.add(s6, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s7 = JSBI.add(s7, carry6);
    s6 = JSBI.subtract(s6, JSBI.multiply(carry6, JSBI.BigInt(1 << 21)));

    let carry8 = JSBI.add(s8, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s9 = JSBI.add(s9, carry8);
    s8 = JSBI.subtract(s8, JSBI.multiply(carry8, JSBI.BigInt(1 << 21)));

    let carry10 = JSBI.add(s10, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s11 = JSBI.add(s11, carry10);
    s10 = JSBI.subtract(s10, JSBI.multiply(carry10, JSBI.BigInt(1 << 21)));

    let carry12 = JSBI.add(s12, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s13 = JSBI.add(s13, carry12);
    s12 = JSBI.subtract(s12, JSBI.multiply(carry12, JSBI.BigInt(1 << 21)));

    let carry14 = JSBI.add(s14, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s15 = JSBI.add(s15, carry14);
    s14 = JSBI.subtract(s14, JSBI.multiply(carry12, JSBI.BigInt(1 << 21)));

    let carry16 = JSBI.add(s16, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s17 = JSBI.add(s17, carry16);
    s16 = JSBI.subtract(s16, JSBI.multiply(carry16, JSBI.BigInt(1 << 21)));

    let carry7 = JSBI.add(s7, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s8 = JSBI.add(s8, carry7);
    s7 = JSBI.subtract(s7, JSBI.multiply(carry7, JSBI.BigInt(1 << 21)));

    let carry9 = JSBI.add(s9, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s10 = JSBI.add(s10, carry9);
    s9 = JSBI.subtract(s9, JSBI.multiply(carry9, JSBI.BigInt(1 << 21)));

    let carry11 = JSBI.add(s11, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s12 = JSBI.add(s12, carry11);
    s11 = JSBI.subtract(s11, JSBI.multiply(carry11, JSBI.BigInt(1 << 21)));

    let carry13 = JSBI.add(s13, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s14 = JSBI.add(s14, carry13);
    s13 = JSBI.subtract(s13, JSBI.multiply(carry13, JSBI.BigInt(1 << 21)));

    let carry15 = JSBI.add(s15, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s16 = JSBI.add(s16, carry15);
    s15 = JSBI.subtract(s15, JSBI.multiply(carry15, JSBI.BigInt(1 << 21)));

    s5 = JSBI.add(s5, JSBI.multiply(s17, JSBI.BigInt(666643)));
    s6 = JSBI.add(s6, JSBI.multiply(s17, JSBI.BigInt(470296)));
    s7 = JSBI.add(s7, JSBI.multiply(s17, JSBI.BigInt(654183)));
    s8 = JSBI.subtract(s8, JSBI.multiply(s17, JSBI.BigInt(997805)));
    s9 = JSBI.add(s9, JSBI.multiply(s17, JSBI.BigInt(136657)));
    s10 = JSBI.subtract(s10, JSBI.multiply(s17, JSBI.BigInt(683901)));

    s4 = JSBI.add(s4, JSBI.multiply(s16, JSBI.BigInt(666643)));
    s5 = JSBI.add(s5, JSBI.multiply(s16, JSBI.BigInt(470296)));
    s6 = JSBI.add(s6, JSBI.multiply(s16, JSBI.BigInt(654183)));
    s7 = JSBI.subtract(s7, JSBI.multiply(s16, JSBI.BigInt(997805)));
    s8 = JSBI.add(s8, JSBI.multiply(s16, JSBI.BigInt(136657)));
    s9 = JSBI.subtract(s9, JSBI.multiply(s16, JSBI.BigInt(683901)));

    s3 = JSBI.add(s3, JSBI.multiply(s15, JSBI.BigInt(666643)));
    s4 = JSBI.add(s4, JSBI.multiply(s15, JSBI.BigInt(470296)));
    s5 = JSBI.add(s5, JSBI.multiply(s15, JSBI.BigInt(654183)));
    s6 = JSBI.subtract(s6, JSBI.multiply(s15, JSBI.BigInt(997805)));
    s7 = JSBI.add(s7, JSBI.multiply(s15, JSBI.BigInt(136657)));
    s8 = JSBI.subtract(s8, JSBI.multiply(s15, JSBI.BigInt(683901)));

    s2 = JSBI.add(s2, JSBI.multiply(s14, JSBI.BigInt(666643)));
    s3 = JSBI.add(s3, JSBI.multiply(s14, JSBI.BigInt(470296)));
    s4 = JSBI.add(s4, JSBI.multiply(s14, JSBI.BigInt(654183)));
    s5 = JSBI.subtract(s5, JSBI.multiply(s14, JSBI.BigInt(997805)));
    s6 = JSBI.add(s6, JSBI.multiply(s14, JSBI.BigInt(136657)));
    s7 = JSBI.subtract(s7, JSBI.multiply(s14, JSBI.BigInt(683901)));

    s1 = JSBI.add(s1, JSBI.multiply(s13, JSBI.BigInt(666643)));
    s2 = JSBI.add(s2, JSBI.multiply(s13, JSBI.BigInt(470296)));
    s3 = JSBI.add(s3, JSBI.multiply(s13, JSBI.BigInt(654183)));
    s4 = JSBI.subtract(s5, JSBI.multiply(s13, JSBI.BigInt(997805)));
    s5 = JSBI.add(s6, JSBI.multiply(s13, JSBI.BigInt(136657)));
    s6 = JSBI.subtract(s7, JSBI.multiply(s13, JSBI.BigInt(683901)));

    s0 = JSBI.add(s0, JSBI.multiply(s12, JSBI.BigInt(666643)));
    s1 = JSBI.add(s1, JSBI.multiply(s12, JSBI.BigInt(470296)));
    s2 = JSBI.add(s2, JSBI.multiply(s12, JSBI.BigInt(654183)));
    s3 = JSBI.subtract(s3, JSBI.multiply(s12, JSBI.BigInt(997805)));
    s4 = JSBI.add(s4, JSBI.multiply(s12, JSBI.BigInt(136657)));
    s5 = JSBI.subtract(s5, JSBI.multiply(s12, JSBI.BigInt(683901)));

    s12 = JSBI.BigInt(0);

    let carry0 = JSBI.add(s0, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s1 = JSBI.add(s1, carry0);
    s0 = JSBI.subtract(s0, JSBI.multiply(carry0, JSBI.BigInt(1 << 21)));

    let carry2 = JSBI.add(s2, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s3 = JSBI.add(s3, carry2);
    s2 = JSBI.subtract(s2, JSBI.multiply(carry2, JSBI.BigInt(1 << 21)));

    let carry4 = JSBI.add(s4, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s5 = JSBI.add(s5, carry4);
    s4 = JSBI.subtract(s4, JSBI.multiply(carry4, JSBI.BigInt(1 << 21)));

    carry6 = JSBI.add(s6, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s7 = JSBI.add(s7, carry6);
    s6 = JSBI.subtract(s6, JSBI.multiply(carry6, JSBI.BigInt(1 << 21)));

    carry8 = JSBI.add(s8, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s9 = JSBI.add(s9, carry8);
    s8 = JSBI.subtract(s8, JSBI.multiply(carry8, JSBI.BigInt(1 << 21)));

    carry10 = JSBI.add(s10, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s11 = JSBI.add(s11, carry10);
    s10 = JSBI.subtract(s10, JSBI.multiply(carry10, JSBI.BigInt(1 << 21)));

    let carry1 = JSBI.add(s1, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s2 = JSBI.add(s2, carry1);
    s1 = JSBI.subtract(s1, JSBI.multiply(carry1, JSBI.BigInt(1 << 21)));

    let carry3 = JSBI.add(s3, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s4 = JSBI.add(s4, carry3);
    s3 = JSBI.subtract(s3, JSBI.multiply(carry3, JSBI.BigInt(1 << 21)));

    let carry5 = JSBI.add(s5, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s6 = JSBI.add(s6, carry5);
    s5 = JSBI.subtract(s5, JSBI.multiply(carry5, JSBI.BigInt(1 << 21)));

    carry7 = JSBI.add(s7, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s8 = JSBI.add(s8, carry7);
    s7 = JSBI.subtract(s7, JSBI.multiply(carry7, JSBI.BigInt(1 << 21)));

    carry9 = JSBI.add(s9, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s10 = JSBI.add(s10, carry9);
    s9 = JSBI.subtract(s9, JSBI.multiply(carry9, JSBI.BigInt(1 << 21)));

    carry11 = JSBI.add(s11, JSBI.signedRightShift(JSBI.BigInt(1 << 20), JSBI.BigInt(21)));
    s12 = JSBI.add(s12, carry11);
    s11 = JSBI.subtract(s11, JSBI.multiply(carry11, JSBI.BigInt(1 << 21)));

    s0 = JSBI.add(s0, JSBI.multiply(s12, JSBI.BigInt(666643)));
    s1 = JSBI.add(s1, JSBI.multiply(s12, JSBI.BigInt(470296)));
    s2 = JSBI.add(s2, JSBI.multiply(s12, JSBI.BigInt(654183)));
    s3 = JSBI.subtract(s3, JSBI.multiply(s12, JSBI.BigInt(997805)));
    s4 = JSBI.add(s4, JSBI.multiply(s12, JSBI.BigInt(136657)));
    s5 = JSBI.subtract(s5, JSBI.multiply(s12, JSBI.BigInt(683901)));

    s12 = JSBI.BigInt(0);

    carry0 = JSBI.signedRightShift(s0, JSBI.BigInt(21));
    s1 = JSBI.add(s1, carry0);
    s0 = JSBI.subtract(s0, JSBI.multiply(carry0, JSBI.BigInt(1 << 21)));

    carry1 = JSBI.signedRightShift(s1, JSBI.BigInt(21));
    s2 = JSBI.add(s2, carry1);
    s1 = JSBI.subtract(s1, JSBI.multiply(carry1, JSBI.BigInt(1 << 21)));

    carry2 = JSBI.signedRightShift(s2, JSBI.BigInt(21));
    s3 = JSBI.add(s3, carry2);
    s2 = JSBI.subtract(s2, JSBI.multiply(carry2, JSBI.BigInt(1 << 21)));

    carry3 = JSBI.signedRightShift(s3, JSBI.BigInt(21));
    s4 = JSBI.add(s4, carry3);
    s3 = JSBI.subtract(s3, JSBI.multiply(carry3, JSBI.BigInt(1 << 21)));

    carry4 = JSBI.signedRightShift(s4, JSBI.BigInt(21));
    s5 = JSBI.add(s5, carry4);
    s4 = JSBI.subtract(s4, JSBI.multiply(carry4, JSBI.BigInt(1 << 21)));

    carry5 = JSBI.signedRightShift(s5, JSBI.BigInt(21));
    s6 = JSBI.add(s6, carry5);
    s5 = JSBI.subtract(s5, JSBI.multiply(carry5, JSBI.BigInt(1 << 21)));

    carry6 = JSBI.signedRightShift(s6, JSBI.BigInt(21));
    s7 = JSBI.add(s7, carry6);
    s6 = JSBI.subtract(s6, JSBI.multiply(carry6, JSBI.BigInt(1 << 21)));

    carry7 = JSBI.signedRightShift(s7, JSBI.BigInt(21));
    s8 = JSBI.add(s8, carry7);
    s7 = JSBI.subtract(s7, JSBI.multiply(carry7, JSBI.BigInt(1 << 21)));

    carry8 = JSBI.signedRightShift(s8, JSBI.BigInt(21));
    s9 = JSBI.add(s9, carry8);
    s8 = JSBI.subtract(s8, JSBI.multiply(carry7, JSBI.BigInt(1 << 21)));

    carry9 = JSBI.signedRightShift(s9, JSBI.BigInt(21));
    s10 = JSBI.add(s10, carry9);
    s9 = JSBI.subtract(s9, JSBI.multiply(carry7, JSBI.BigInt(1 << 21)));

    carry10 = JSBI.signedRightShift(s10, JSBI.BigInt(21));
    s11 = JSBI.add(s11, carry10);
    s10 = JSBI.subtract(s10, JSBI.multiply(carry10, JSBI.BigInt(1 << 21)));

    carry11 = JSBI.signedRightShift(s11, JSBI.BigInt(21));
    s12 = JSBI.add(s12, carry11);
    s11 = JSBI.subtract(s11, JSBI.multiply(carry11, JSBI.BigInt(1 << 21)));

    s0 = JSBI.add(s0, JSBI.multiply(s12, JSBI.BigInt(666643)));
    s1 = JSBI.add(s1, JSBI.multiply(s12, JSBI.BigInt(470296)));
    s2 = JSBI.add(s2, JSBI.multiply(s12, JSBI.BigInt(654183)));
    s3 = JSBI.subtract(s3, JSBI.multiply(s12, JSBI.BigInt(997805)));
    s4 = JSBI.add(s4, JSBI.multiply(s12, JSBI.BigInt(136657)));
    s5 = JSBI.subtract(s5, JSBI.multiply(s12, JSBI.BigInt(683901)));

    let f10 = (carry: JSBI, s0: JSBI, s1: JSBI) =>
    {
        carry = JSBI.signedRightShift(s0, JSBI.BigInt(21));
        s1 = JSBI.add(s1, carry);
        s0 = JSBI.subtract(s0, JSBI.multiply(carry, JSBI.BigInt(1 << 21)));
    };

    f10(carry0, s0, s1);
    f10(carry1, s1, s2);
    f10(carry2, s2, s3);
    f10(carry3, s3, s4);
    f10(carry4, s4, s5);
    f10(carry5, s5, s6);
    f10(carry6, s6, s7);
    f10(carry7, s7, s8);
    f10(carry8, s8, s9);
    f10(carry9, s9, s10);
    f10(carry10, s10, s11);

    let t = Buffer.alloc(32);
    t[0]  = JSBI.toNumber(s0);
    t[1]  = JSBI.toNumber(JSBI.signedRightShift(s0, JSBI.BigInt(8)));
    t[2]  = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s0, JSBI.BigInt(16)),JSBI.multiply(s1, JSBI.BigInt(1 << 5))));
    t[3]  = JSBI.toNumber(JSBI.signedRightShift(s1, JSBI.BigInt(3)));
    t[4]  = JSBI.toNumber(JSBI.signedRightShift(s1, JSBI.BigInt(11)));
    t[5]  = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s1, JSBI.BigInt(19)),JSBI.multiply(s2, JSBI.BigInt(1 << 2))));
    t[6]  = JSBI.toNumber(JSBI.signedRightShift(s2, JSBI.BigInt(6)));
    t[7]  = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s2, JSBI.BigInt(14)),JSBI.multiply(s3, JSBI.BigInt(1 << 7))));
    t[8]  = JSBI.toNumber(JSBI.signedRightShift(s3, JSBI.BigInt(1)));
    t[9]  = JSBI.toNumber(JSBI.signedRightShift(s3, JSBI.BigInt(9)));
    t[10] = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s3, JSBI.BigInt(17)),JSBI.multiply(s4, JSBI.BigInt(1 << 4))));
    t[11] = JSBI.toNumber(JSBI.signedRightShift(s4, JSBI.BigInt(4)));
    t[12] = JSBI.toNumber(JSBI.signedRightShift(s4, JSBI.BigInt(12)));
    t[13] = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s4, JSBI.BigInt(20)),JSBI.multiply(s5, JSBI.BigInt(1 << 1))));
    t[14] = JSBI.toNumber(JSBI.signedRightShift(s5, JSBI.BigInt(7)));
    t[15] = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s5, JSBI.BigInt(15)),JSBI.multiply(s6, JSBI.BigInt(1 << 6))));
    t[16] = JSBI.toNumber(JSBI.signedRightShift(s6, JSBI.BigInt(2)));
    t[17] = JSBI.toNumber(JSBI.signedRightShift(s6, JSBI.BigInt(10)));
    t[18] = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s6, JSBI.BigInt(18)),JSBI.multiply(s7, JSBI.BigInt(1 << 3))));
    t[19] = JSBI.toNumber(JSBI.signedRightShift(s7, JSBI.BigInt(5)));
    t[20] = JSBI.toNumber(JSBI.signedRightShift(s7, JSBI.BigInt(13)));
    t[21] = JSBI.toNumber(s8);
    t[22] = JSBI.toNumber(JSBI.signedRightShift(s8, JSBI.BigInt(8)));
    t[23] = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s8, JSBI.BigInt(16)),JSBI.multiply(s9, JSBI.BigInt(1 << 5))));
    t[24] = JSBI.toNumber(JSBI.signedRightShift(s9, JSBI.BigInt(3)));
    t[25] = JSBI.toNumber(JSBI.signedRightShift(s9, JSBI.BigInt(11)));
    t[26] = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s9, JSBI.BigInt(19)),JSBI.multiply(s10, JSBI.BigInt(1 << 2))));
    t[27] = JSBI.toNumber(JSBI.signedRightShift(s10, JSBI.BigInt(6)));
    t[28] = JSBI.toNumber(JSBI.bitwiseOr(JSBI.signedRightShift(s10, JSBI.BigInt(14)),JSBI.multiply(s11, JSBI.BigInt(1 << 7))));
    t[29] = JSBI.toNumber(JSBI.signedRightShift(s11, JSBI.BigInt(1)));
    t[30] = JSBI.toNumber(JSBI.signedRightShift(s11, JSBI.BigInt(9)));
    t[31] = JSBI.toNumber(JSBI.signedRightShift(s11, JSBI.BigInt(17)));
    return t;
}
*/
export function ge25519_elligator2 (x: FE25519, y: FE25519, r: FE25519): number
{
    return 0;
}

export function fe25519_add (h: FE25519, f: FE25519, g: FE25519)
{

}

export function fe25519_sub (h: FE25519, f: FE25519, g: FE25519)
{

}

export function fe25519_invert (out: FE25519, z: FE25519)
{

}

export function fe25519_iszero (f: FE25519): number
{
    return 1;
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
    fe25519_mul(xed, x, FE25519.SqrtAM2);
    fe25519_mul(xed, xed, x_plus_one_y_inv);            /* sqrt(-A-2)*x/((x+1)*y) */
    fe25519_mul(xed, xed, x_plus_one);

    /* yed = (x-1)/(x+1) */
    fe25519_mul(yed, x_plus_one_y_inv, y);              /* 1/(x+1) */
    fe25519_mul(yed, yed, x_minus_one);
    fe25519_cmov(yed, one, fe25519_iszero(x_plus_one_y_inv));

}

export function fe25519_isnegative(f: FE25519): number
{
    let s = f.toBytes();
    return s[0] & 1;
}

export function fe25519_neg (h: FE25519, f: FE25519)
{

}

export function fe25519_cmov (f: FE25519, g: FE25519, b: number)
{

}

export function fe25519_1 (h: FE25519)
{

}

export function fe25519_mul(h: FE25519, f: FE25519, g: FE25519)
{

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
    let notsquare: number;
    let x_sign: number;
    let s = new Uint8Array(32);

    for (let idx = 0; idx < 32; idx++)
        s[idx] = r[idx];

    x_sign = s[31] >> 7;
    s[31] &= 0x7f;

    r_fe.fromBytes(s);

    notsquare = ge25519_elligator2(x, y, r_fe);

    ge25519_mont_to_ed(p3.X, p3.Y, x, y);
    let negxed = p3.X.negate();
    p3.X.cmov(negxed, p3.X.isNegative() ^ x_sign);

    p3.Z.setOne();
    fe25519_mul(p3.T, p3.X, p3.Y);
    ge25519_clear_cofactor(p3);
    ge25519_p3_tobytes(s, p3);

    return s;
}
