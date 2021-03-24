import JSBI from "jsbi";

export class JSBIUtils
{
    public static JSBigInt (from: number|string|boolean|object): JSBI
    {
        return JSBI.BigInt(from);
    }

    public static toInt8 (value: JSBI): number
    {
        return JSBI.toNumber(JSBI.bitwiseAnd(value, JSBI.BigInt(0xFF)));
    }

    public static toInt32 (value: JSBI): number
    {
        return JSBI.toNumber(JSBI.bitwiseAnd(value, JSBI.BigInt(0xFFFFFFFF)));
    }

    public static Sum (values: Array<JSBI>): JSBI
    {
        return values.reduce<JSBI>((sum, n) => {
            return JSBI.add(sum, n)
        }, JSBI.BigInt(0));
    }
}