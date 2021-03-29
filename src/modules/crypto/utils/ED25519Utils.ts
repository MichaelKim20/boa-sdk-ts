
export class ED25519Utils
{
    public static crypto_core_ed25519_BYTES: number = 32;
    public static crypto_core_ed25519_UNIFORMBYTES: number = 32;
    public static crypto_core_ed25519_HASHBYTES: number = 64;
    public static crypto_core_ed25519_SCALARBYTES: number = 32;
    public static crypto_core_ed25519_NONREDUCEDSCALARBYTES: number = 64;

    public static sodium_add (a: Uint8Array, b: Uint8Array, len: number)
    {
        let i: number;
        let c: number = 0;
        let a_: number;
        let b_: number;

        for (i = 0; i < len; i++)
        {
            a_ = a[i];
            b_ = b[i];
            c += (a_ + b_);
            a[i] = c & 0xff;
            c >>= 8;
        }
    }

    public static sodium_sub (a: Uint8Array, b: Uint8Array, len: number)
    {
        let i: number;
        let c: number = 0;
        let a_: number;
        let b_: number;

        for (i = 0; i < len; i++)
        {
            a_ = a[i];
            b_ = b[i];
            c = (a_ - b_) - c;
            a[i] = c & 0xff;
            c = (c >> 8) & 1;
        }
    }

    public static sodium_is_zero (n: Uint8Array, len: number): number
    {
        let d = 0;
        for (let i = 0; i < len; i++)
            d = (d | n[i]) & 0xff;
        return 1 & ((d - 1) >> 8);
    }
}
