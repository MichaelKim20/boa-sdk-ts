import JSBI from "jsbi";

export class ED25519Utils
{
    public static crypto_core_ed25519_BYTES: number = 32;
    public static crypto_core_ed25519_UNIFORMBYTES: number = 32;
    public static crypto_core_ed25519_HASHBYTES: number = 64;
    public static crypto_core_ed25519_SCALARBYTES: number = 32;
    public static crypto_core_ed25519_NONREDUCEDSCALARBYTES: number = 64;

    public static load_3 (s: Uint8Array, offset: number): JSBI
    {
        let result = JSBI.BigInt(s[offset]);
        result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(8)));
        result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(16)));
        return result;
    }

    public static load_4 (s: Uint8Array, offset: number): JSBI
    {
        let result = JSBI.BigInt(s[offset]);
        result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(8)));
        result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(16)));
        result = JSBI.bitwiseOr(result, JSBI.leftShift(JSBI.BigInt(s[++offset]), JSBI.BigInt(24)));
        return result;
    }

    public static sodium_is_zero (n: Uint8Array, len: number): number
    {
        let d = 0;
        for (let i = 0; i < len; i++)
            d |= n[i];
        return 1 & ((d - 1) >> 8);
    }
}
