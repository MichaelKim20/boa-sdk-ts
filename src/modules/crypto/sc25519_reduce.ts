
import JSBI from "jsbi";

function load_3(s: Uint8Array, offset: number): JSBI
{
    return JSBI.BigInt(
        s[offset] +
        s[++offset] * 2 ** 8 +
        s[++offset] * 2 ** 16);
}
function load_4(s: Uint8Array, offset: number): JSBI
{
    return JSBI.BigInt(
        s[offset] +
        s[++offset] * 2 ** 8 +
        s[++offset] * 2 ** 16 +
        s[++offset] * 2 ** 24);
}

/**
    Input:
    s[0]+256*s[1]+...+256^63*s[63] = s
    Output:
    s[0]+256*s[1]+...+256^31*s[31] = s mod l
    where l = 2^252 + 27742317777372353535851937790883648493.
    Overwrites s in place.
 **/
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
    let s0  = JSBI.bitwiseAnd(N2097151, load_3(s, 0));
    let s1  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 2), JSBI.BigInt(5)));
    let s2  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 5), JSBI.BigInt(2)));
    let s3  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 7), JSBI.BigInt(7)));
    let s4  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 10), JSBI.BigInt(4)));
    let s5  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 13), JSBI.BigInt(1)));
    let s6  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 15), JSBI.BigInt(6)));
    let s7  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 18), JSBI.BigInt(3)));
    let s8  = JSBI.bitwiseAnd(N2097151, load_3(s, 21));
    let s9  = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 23), JSBI.BigInt(5)));
    let s10 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 26), JSBI.BigInt(2)));
    let s11 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 28), JSBI.BigInt(7)));
    let s12 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 31), JSBI.BigInt(4)));
    let s13 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 34), JSBI.BigInt(1)));
    let s14 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 36), JSBI.BigInt(6)));
    let s15 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 39), JSBI.BigInt(3)));
    let s16  = JSBI.bitwiseAnd(N2097151, load_3(s, 42));
    let s17 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 44), JSBI.BigInt(5)));
    let s18 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 47), JSBI.BigInt(2)));
    let s19 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 49), JSBI.BigInt(7)));
    let s20 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 52), JSBI.BigInt(4)));
    let s21 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_3(s, 55), JSBI.BigInt(1)));
    let s22 = JSBI.bitwiseAnd(N2097151, JSBI.signedRightShift(load_4(s, 57), JSBI.BigInt(6)));
    let s23 = JSBI.signedRightShift(load_4(s, 60), JSBI.BigInt(3));

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

export function crypto_core_ed25519_scalar_reduce (s: Uint8Array): Uint8Array
{
    if (s.length != 64)
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

    let toUInt8 = (value: JSBI): number =>
    {
        return JSBI.toNumber(JSBI.bitwiseAnd(value, JSBI.BigInt(0xFF)));
    }

    let t = new Uint8Array(32);
    t[0]  = toUInt8(S[0]);
    t[1]  = toUInt8(JSBI.signedRightShift(S[0], JSBI.BigInt(8)));
    t[2]  = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[0], JSBI.BigInt(16)), JSBI.multiply(S[1], JSBI.BigInt(1 << 5))));
    t[3]  = toUInt8(JSBI.signedRightShift(S[1], JSBI.BigInt(3)));
    t[4]  = toUInt8(JSBI.signedRightShift(S[1], JSBI.BigInt(11)));
    t[5]  = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[1], JSBI.BigInt(19)), JSBI.multiply(S[2], JSBI.BigInt(1 << 2))));
    t[6]  = toUInt8(JSBI.signedRightShift(S[2], JSBI.BigInt(6)));
    t[7]  = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[2], JSBI.BigInt(14)), JSBI.multiply(S[3], JSBI.BigInt(1 << 7))));
    t[8]  = toUInt8(JSBI.signedRightShift(S[3], JSBI.BigInt(1)));
    t[9]  = toUInt8(JSBI.signedRightShift(S[3], JSBI.BigInt(9)));
    t[10] = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[3], JSBI.BigInt(17)), JSBI.multiply(S[4], JSBI.BigInt(1 << 4))));
    t[11] = toUInt8(JSBI.signedRightShift(S[4], JSBI.BigInt(4)));
    t[12] = toUInt8(JSBI.signedRightShift(S[4], JSBI.BigInt(12)));
    t[13] = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[4], JSBI.BigInt(20)), JSBI.multiply(S[5], JSBI.BigInt(1 << 1))));
    t[14] = toUInt8(JSBI.signedRightShift(S[5], JSBI.BigInt(7)));
    t[15] = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[5], JSBI.BigInt(15)), JSBI.multiply(S[6], JSBI.BigInt(1 << 6))));
    t[16] = toUInt8(JSBI.signedRightShift(S[6], JSBI.BigInt(2)));
    t[17] = toUInt8(JSBI.signedRightShift(S[6], JSBI.BigInt(10)));
    t[18] = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[6], JSBI.BigInt(18)), JSBI.multiply(S[7], JSBI.BigInt(1 << 3))));
    t[19] = toUInt8(JSBI.signedRightShift(S[7], JSBI.BigInt(5)));
    t[20] = toUInt8(JSBI.signedRightShift(S[7], JSBI.BigInt(13)));
    t[21] = toUInt8(S[8]);
    t[22] = toUInt8(JSBI.signedRightShift(S[8], JSBI.BigInt(8)));
    t[23] = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[8], JSBI.BigInt(16)), JSBI.multiply(S[9], JSBI.BigInt(1 << 5))));
    t[24] = toUInt8(JSBI.signedRightShift(S[9], JSBI.BigInt(3)));
    t[25] = toUInt8(JSBI.signedRightShift(S[9], JSBI.BigInt(11)));
    t[26] = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[9], JSBI.BigInt(19)), JSBI.multiply(S[10], JSBI.BigInt(1 << 2))));
    t[27] = toUInt8(JSBI.signedRightShift(S[10], JSBI.BigInt(6)));
    t[28] = toUInt8(JSBI.bitwiseOr(JSBI.signedRightShift(S[10], JSBI.BigInt(14)), JSBI.multiply(S[11], JSBI.BigInt(1 << 7))));
    t[29] = toUInt8(JSBI.signedRightShift(S[11], JSBI.BigInt(1)));
    t[30] = toUInt8(JSBI.signedRightShift(S[11], JSBI.BigInt(9)));
    t[31] = toUInt8(JSBI.signedRightShift(S[11], JSBI.BigInt(17)));
    return t;
}
