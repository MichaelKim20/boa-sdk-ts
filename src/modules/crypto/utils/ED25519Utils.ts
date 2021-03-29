
export class ED25519Utils
{
    public static crypto_core_ed25519_BYTES: number = 32;
    public static crypto_core_ed25519_UNIFORMBYTES: number = 32;
    public static crypto_core_ed25519_HASHBYTES: number = 64;
    public static crypto_core_ed25519_SCALARBYTES: number = 32;
    public static crypto_core_ed25519_NONREDUCEDSCALARBYTES: number = 64;

    public static sodium_is_zero (n: Uint8Array, len: number): boolean
    {
        let d = 0;
        for (let i = 0; i < len; i++)
            d = (d & n[i]) & 0xff;
        return (1 & ((d - 1) >> 8)) != 0;
    }
}
