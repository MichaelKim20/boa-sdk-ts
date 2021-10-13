/*******************************************************************************

   Test for the wallet utility

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import * as sdk from "../../lib";

import assert from "assert";

describe("Test of AmountConverter", () => {
    it("Test of AmountConverter.fromString()", () => {
        assert.deepStrictEqual(sdk.AmountConverter.fromString("1"), {
            code: sdk.WalletResultCode.Success,
            message: sdk.WalletMessage.Success,
            data: sdk.Amount.make("10000000"),
        });
        assert.deepStrictEqual(sdk.AmountConverter.fromString("100000000.1234567"), {
            code: sdk.WalletResultCode.Success,
            message: sdk.WalletMessage.Success,
            data: sdk.Amount.make("1000000001234567"),
        });
        assert.deepStrictEqual(sdk.AmountConverter.fromString("100000000"), {
            code: sdk.WalletResultCode.Success,
            message: sdk.WalletMessage.Success,
            data: sdk.Amount.make("1000000000000000"),
        });
        assert.deepStrictEqual(sdk.AmountConverter.fromString("100,000,000.1234567"), {
            code: sdk.WalletResultCode.Success,
            message: sdk.WalletMessage.Success,
            data: sdk.Amount.make("1000000001234567"),
        });
        assert.deepStrictEqual(sdk.AmountConverter.fromString("100,000,000"), {
            code: sdk.WalletResultCode.Success,
            message: sdk.WalletMessage.Success,
            data: sdk.Amount.make("1000000000000000"),
        });
        assert.deepStrictEqual(sdk.AmountConverter.fromString("-100,000,000"), {
            code: sdk.WalletResultCode.InvalidAmount,
            message: sdk.WalletMessage.InvalidAmount,
        });
    });

    it("Test of AmountConverter.toString()", () => {
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), false, 7),
            "100000000.1234567"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), false, 0),
            "100000000"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), true, 7),
            "100,000,000.1234567"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), true, 0),
            "100,000,000"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), true, 1),
            "100,000,000.1"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), true, 1),
            "100,000,000.0"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), true, 2),
            "100,000,000.12"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), true, 2),
            "100,000,000.00"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), true, 3),
            "100,000,000.123"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), true, 3),
            "100,000,000.000"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), true, 4),
            "100,000,000.1235"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), true, 4),
            "100,000,000.0000"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), true, 5),
            "100,000,000.12346"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), true, 5),
            "100,000,000.00000"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), true, 6),
            "100,000,000.123457"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), true, 6),
            "100,000,000.000000"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), true, 7),
            "100,000,000.1234567"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), true, 7),
            "100,000,000.0000000"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000001234567")), true, 8),
            "100,000,000.12345670"
        );
        assert.deepStrictEqual(
            sdk.AmountConverter.toString(new sdk.Amount(sdk.JSBI.BigInt("1000000000000000")), true, 8),
            "100,000,000.00000000"
        );
    });
});
