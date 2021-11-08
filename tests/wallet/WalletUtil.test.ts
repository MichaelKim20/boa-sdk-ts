/*******************************************************************************

   Test for the wallet utility

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../../lib";

import assert from "assert";
import { WalletResultCode } from "../../src";

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

describe("Test of WalletValidator", () => {
    before("Wait for the package libsodium to finish loading", () => {
        if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("Test of WalletValidator.isValidPublicKey()", () => {
        assert.deepStrictEqual(
            sdk.WalletValidator.isValidPublicKey("bob1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssuz4lg0"),
            {
                code: sdk.WalletResultCode.InvalidPublicKey,
                message: sdk.WalletMessage.InvalidPublicKey,
            }
        );

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidPublicKey("boa1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssu34lg0"),
            {
                code: sdk.WalletResultCode.InvalidPublicKey,
                message: sdk.WalletMessage.InvalidPublicKey,
            }
        );

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidPublicKey("boa1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssuz4lg"),
            {
                code: sdk.WalletResultCode.InvalidPublicKeyLength,
                message: sdk.WalletMessage.InvalidPublicKeyLength,
            }
        );

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidPublicKey("boa1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssuz4lg0"),
            {
                code: sdk.WalletResultCode.Success,
                message: sdk.WalletMessage.Success,
            }
        );
    });

    it("Test of WalletValidator.isValidSecretKey()", () => {
        assert.deepStrictEqual(
            sdk.WalletValidator.isValidSecretKey("SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZ"),
            {
                code: sdk.WalletResultCode.InvalidSecretKeyLength,
                message: sdk.WalletMessage.InvalidSecretKeyLength,
            }
        );

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidSecretKey("SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZ_"),
            {
                code: sdk.WalletResultCode.InvalidSecretKey,
                message: sdk.WalletMessage.InvalidSecretKey,
            }
        );

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidSecretKey("GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW"),
            {
                code: sdk.WalletResultCode.InvalidSecretKey,
                message: sdk.WalletMessage.InvalidSecretKey,
            }
        );

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidSecretKey("SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI"),
            {
                code: sdk.WalletResultCode.Success,
                message: sdk.WalletMessage.Success,
            }
        );
    });

    it("Test of WalletValidator.isValidSecretKeyAgainstPublicKey()", () => {
        const kp1 = sdk.KeyPair.random();
        const kp2 = sdk.KeyPair.random();

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidSecretKeyAgainstPublicKey(kp1.secret.toString(false), kp2.address.toString()),
            {
                code: sdk.WalletResultCode.InvalidKeyPair,
                message: sdk.WalletMessage.InvalidKeyPair,
            }
        );

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidSecretKeyAgainstPublicKey(kp1.secret.toString(false), kp1.address.toString()),
            {
                code: sdk.WalletResultCode.Success,
                message: sdk.WalletMessage.Success,
            }
        );
    });

    it("Test of WalletValidator.isValidHash()", () => {
        assert.deepStrictEqual(
            sdk.WalletValidator.isValidHash(
                "a0ad987cffcf2e3f96af64dd197d95d4e8e41be4448f6abebd8953b3c37b3132a1a1917c2046f6d3550cac70299110b28f23454d6124892ab2b8a6508f2bfe4700"
            ),
            {
                code: sdk.WalletResultCode.InvalidHashFormat,
                message: sdk.WalletMessage.InvalidHashFormat,
            }
        );

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidHash(
                "0xa0ad987cffcf2e3f96af64dd197d95d4e8e41be4448f6abebd8953b3c37b3132a1a1917c2046f6d3550cac70299110b28f23454d6124892ab2b8a6508f2bfe"
            ),
            {
                code: sdk.WalletResultCode.InvalidHashLength,
                message: sdk.WalletMessage.InvalidHashLength,
            }
        );

        assert.deepStrictEqual(
            sdk.WalletValidator.isValidHash(
                "0xa0ad987cffcf2e3f96af64dd197d95d4e8e41be4448f6abebd8953b3c37b3132a1a1917c2046f6d3550cac70299110b28f23454d6124892ab2b8a6508f2bfe47"
            ),
            {
                code: sdk.WalletResultCode.Success,
                message: sdk.WalletMessage.Success,
            }
        );
    });
});

describe("Test of WalletUtils", () => {
    before("Wait for the package libsodium to finish loading", () => {
        if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    it("Test of WalletUtils.createKeyPair(), WalletUtils.createKeyPairFromSecretKey()", () => {
        const res = sdk.WalletUtils.createKeyPair();

        assert.strictEqual(res.code, WalletResultCode.Success);
        assert.ok(res.data !== undefined);

        const random_kp_signature = res.data.secret.sign<Buffer>(Buffer.from("Hello World"));
        assert.ok(res.data.address.verify<Buffer>(random_kp_signature, Buffer.from("Hello World")));

        // Test whether randomly generated key-pair are reproducible.
        const secret_string = res.data.secret.toString(false);
        const reproduced_res = sdk.WalletUtils.createKeyPairFromSecretKey(secret_string);
        assert.strictEqual(reproduced_res.code, WalletResultCode.Success);
        assert.ok(reproduced_res.data !== undefined);

        const reproduced_kp_signature = reproduced_res.data.secret.sign<Buffer>(Buffer.from("Hello World"));
        assert.ok(reproduced_res.data.address.verify<Buffer>(reproduced_kp_signature, Buffer.from("Hello World")));

        assert.deepStrictEqual(res.data.secret, reproduced_res.data.secret);
        assert.deepStrictEqual(res.data.address, reproduced_res.data.address);
    });

    it("Test of WalletUtils.getShortAddress()", () => {
        const pk = new sdk.PublicKey("boa1xrv266cegdthdc87uche9zvj8842shz3sdyvw0qecpgeykyv4ynssuz4lg0");
        assert.strictEqual(sdk.WalletUtils.getShortAddress(pk), "boa1xrv2...g0");
    });
});
