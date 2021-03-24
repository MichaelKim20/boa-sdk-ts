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
        return JSBI.BigInt(
            s[offset] +
            s[++offset] * 2 ** 8 +
            s[++offset] * 2 ** 16);
    }

    public static load_4 (s: Uint8Array, offset: number): JSBI
    {
        return JSBI.BigInt(
            s[offset] +
            s[++offset] * 2 ** 8 +
            s[++offset] * 2 ** 16 +
            s[++offset] * 2 ** 24);
    }
}
