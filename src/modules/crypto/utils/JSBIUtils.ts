import JSBI from 'jsbi';
import { UInt64 } from "spu-integer-math";

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

    public static SumMultiply (values: Array<JSBI>): JSBI
    {
        let M: Array<JSBI> = [];
        for (let i = 0; i < values.length; i += 2)
            M.push(JSBI.multiply(values[i], values[i+1]));
        return JSBIUtils.Sum(M);
    }
}
/*
export class UInt64Utils
{
    public static toInt8 (value: UInt64): number
    {
        return UInt64.and(value, 0xFF).lo;
    }

    public static toInt32 (value: UInt64): number
    {
        return UInt64.and(value, 0xFFFFFFFF).lo;
    }

    public static Sum (values: Array<UInt64>): UInt64
    {
        return values.reduce<UInt64>((sum, n) => {
            return UInt64.add(sum, n)
        }, UInt64.fromNumber(0));
    }

    public static SumMultiply (values: Array<UInt64>): UInt64
    {
        let Sum = UInt64.fromNumber(0);
        for (let i = 0; i < values.length; i += 2)
            Sum = UInt64.add(Sum, UInt64.mul(values[i], values[i+1]));
        return Sum;
    }
}
*/
