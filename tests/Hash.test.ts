/*******************************************************************************

    Test that create hash.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";

import * as assert from "assert";

describe("Hash", () => {
    before("Wait for the package libsodium to finish loading", () => {
        if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    // Buffer has the same content. However, when printed with hex strings,
    // the order of output is different.
    // This was treated to be the same as D language.
    it("Test of reading and writing hex string", () => {
        // Read from hex string
        const h = new sdk.Hash(
            "0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd2236713dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73"
        );

        // Check
        assert.strictEqual(
            h.toString(),
            "0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd2236713dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test of hash('abc')", () => {
        // Hash
        const h = sdk.hash(Buffer.from("abc"));

        // Check
        assert.strictEqual(
            h.toString(),
            "0x239900d4ed8623b95a92f1dba88ad31895cc3345ded552c22d79ab2a39c5877dd1a2ffdb6fbb124bb7c45a68142f214ce9f6129fb697276a0d4d1c983fa580ba"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test of multi hash", () => {
        // Source 1 : "foo"
        const foo = sdk.hash(Buffer.from("foo"));

        // Source 2 : "bar"
        const bar = sdk.hash(Buffer.from("bar"));

        // Hash Multi
        const h = sdk.hashMulti(foo, bar);

        // Check
        assert.strictEqual(
            h.toString(),
            "0xe0343d063b14c52630563ec81b0f91a84ddb05f2cf05a2e4330ddc79bd3a06e57c2e756f276c112342ff1d6f1e74d05bdb9bf880abd74a2e512654e12d171a74"
        );

        // Source 3 : "boa"
        const boa = sdk.hash(Buffer.from("boa"));

        const h2 = sdk.hash(Buffer.concat([foo.data, bar.data, boa.data]));
        const h3 = sdk.hashMulti(foo, bar, boa);

        // Check
        assert.strictEqual(h3.toString(), h2.toString());
    });

    it("Test of Hash.equal", () => {
        const bytes1 = Buffer.from(sdk.iota(sdk.Hash.Width).map((m) => m));
        const bytes2 = Buffer.from(sdk.iota(sdk.Hash.Width).map((m) => m));
        const bytes3 = Buffer.from(sdk.iota(sdk.Hash.Width).map((m) => m));
        bytes3[sdk.Hash.Width - 1] = 0;

        const h1 = new sdk.Hash(bytes1);
        const h2 = new sdk.Hash(bytes2);
        const h3 = new sdk.Hash(bytes3);
        assert.strictEqual(sdk.Hash.equal(h1, h2), true);
        assert.strictEqual(sdk.Hash.equal(h1, h3), false);
    });

    it("Test of Hash.compare", () => {
        const bytes1 = Buffer.from(sdk.iota(sdk.Hash.Width).map((m) => m));
        const bytes2 = Buffer.from(sdk.iota(sdk.Hash.Width).map((m) => m));
        const bytes3 = Buffer.from(sdk.iota(sdk.Hash.Width).map((m) => m));
        bytes1[sdk.Hash.Width - 1] = 0;
        bytes2[sdk.Hash.Width - 1] = 1;
        bytes3[sdk.Hash.Width - 1] = 2;

        const h1 = new sdk.Hash(bytes1);
        const h2 = new sdk.Hash(bytes2);
        const h3 = new sdk.Hash(bytes3);
        assert.strictEqual(sdk.Hash.compare(h1, h2) < 0, true);
        assert.strictEqual(sdk.Hash.compare(h2, h3) < 0, true);
        assert.strictEqual(sdk.Hash.compare(h3, h1) > 0, true);
        assert.strictEqual(sdk.Hash.compare(h2, h1) > 0, true);
    });

    it("Test of Hash.Null(), Hash.isNull()", () => {
        let h = new sdk.Hash(
            "0x76c481db1ebcc0dbd463115b2f1d66e012c62725eee4b266498657f2d6b9a236f5606384b06fca25f8c2eb6d68885878a09902ec6d01ed1b47cb4b725a672584"
        );
        assert.strictEqual(h.isNull(), false);

        h = sdk.Hash.Null;
        assert.strictEqual(h.isNull(), true);
    });

    it("Test of multi hash of string", () => {
        const pre_image = new sdk.Hash(
            "0x76c481db1ebcc0dbd463115b2f1d66e012c62725eee4b266498657f2d6b9a236f5606384b06fca25f8c2eb6d68885878a09902ec6d01ed1b47cb4b725a672584"
        );

        const app_name = "Votera";

        // Hash Multi
        const key = sdk.hashMulti(pre_image, app_name);

        // Check
        assert.strictEqual(
            key.toString(),
            "0x4c4e169e6619207b6613496c777b21431c5e14a29c44b316a55c8132416823bf9d202b8335d4c90810783e139ac0795b9a58993bf4bd10d1bc0b1a131fd09c64"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test of multi hash of variables", () => {
        // Source 1 : "foo"
        const foo = sdk.hash(Buffer.from("foo"));

        // UInt8
        assert.strictEqual(
            sdk.hashMulti(foo, sdk.VariableBytes.fromUInt8(45)).toString(),
            "0xf61564563b39715729ced8bff16b50b622d3ae38bc41f40d2f131961cf68ad8b931906921ff40e9e024fae067bea3bc48a86be5729713952b64d1f15b03a9f62"
        );

        // UInt16
        assert.strictEqual(
            sdk.hashMulti(foo, sdk.VariableBytes.fromUInt16(45)).toString(),
            "0x605ca7649eda97e108ade8f1c390ad109dd39ac3824369c31a9647d234dafda65d8159ec5f9f7808052abed8e95bc9d86fc7f612632a156b81b4082aa2da4435"
        );

        // UInt32
        assert.strictEqual(
            sdk.hashMulti(foo, sdk.VariableBytes.fromUInt32(45)).toString(),
            "0xfd36a5e3a160b516c459a0ab08f65e352bd63b1ec3ceea393a04d7009b3c301c150057ca5a6363607c7c0cc37bffba853c3351ed6b953e7c947e82c810f453b9"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test of utxo key, using makeUTXOKey", () => {
        const tx_hash = new sdk.Hash(
            "0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd2236713dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73"
        );
        const hash = sdk.makeUTXOKey(tx_hash, sdk.JSBI.BigInt(1));
        assert.strictEqual(
            hash.toString(),
            "0x7c95c29b184e47fbd32e58e5abd42c6e22e8bd5a7e934ab049d21df545e09c2e33bb2b89df2e59ee01eb2519b1508284b577f66a76d42546b65a6813e592bb84"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of BlockHeader", () => {
        const pubkey = new sdk.PublicKey("boa1xrra39xpg5q9zwhsq6u7pw508z2let6dj8r5lr4q0d0nff240fvd27yme3h");

        const tx = new sdk.Transaction([], [new sdk.TxOutput(sdk.OutputType.Payment, "100", pubkey)], Buffer.alloc(0));

        const header: sdk.BlockHeader = new sdk.BlockHeader(
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            sdk.hashFull(tx),
            new sdk.Signature(Buffer.alloc(sdk.Signature.Width)),
            sdk.BitMask.fromString("0"),
            new sdk.Height("0"),
            [],
            [],
            0
        );
        assert.strictEqual(
            sdk.hashFull(header).toString(),
            "0xde4132329e5e3d7acb2efc075c0d67f4e29995d49a813445cf7ad74f66140df014f411dc71529142e2f0223578195a6cb22662ee990992b510b74e56a02dae87"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of BlockHeader with preimages", () => {
        const pubkey = new sdk.PublicKey("boa1xrra39xpg5q9zwhsq6u7pw508z2let6dj8r5lr4q0d0nff240fvd27yme3h");

        const tx = new sdk.Transaction([], [new sdk.TxOutput(sdk.OutputType.Payment, "100", pubkey)], Buffer.alloc(0));

        const header: sdk.BlockHeader = new sdk.BlockHeader(
            new sdk.Hash(Buffer.alloc(sdk.Hash.Width)),
            sdk.hashFull(tx),
            new sdk.Signature(Buffer.alloc(sdk.Signature.Width)),
            sdk.BitMask.fromString("0"),
            new sdk.Height("0"),
            [
                new sdk.Hash(
                    "0xe99832a1469beb4830f2faf3a6b8da5d027afe6f3f80098d89c4e6d22b8a22b1074b493041c124c86333891f5c62df8bd2bb0b6a493b6ea0ed276ad03db59b3f"
                ),
            ],
            [],
            0
        );
        assert.strictEqual(
            sdk.hashFull(header).toString(),
            "0xed0982420419abfef6d181d25d871619657d09a9e3e111a3c14ca92c40ab7d97b587c6ec05cd783bedd7b15681dd792a1dcef6c98614513442c00951d2bfb6d0"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of Scalar", () => {
        const scalar = new sdk.Scalar("0x0e00a8df701806cb4deac9bb09cc85b097ee713e055b9d2bf1daf668b3f63778");
        assert.deepStrictEqual(
            sdk.hashFull(scalar).toString(),
            "0x4f895cc641b2bfe4541f53b83445add00a7a81ad340312c51cbf15c53ddebcc7ea7dcd11a97e085d28552026952e7c7c8d4276d5901d33605a3ea21027a673d4"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of Point", () => {
        const point = new sdk.Point("0xdb445140a72012a177535f43e6bbb8523ff21de465a7c35b42be1a447e5e2908");
        assert.deepStrictEqual(
            sdk.hashFull(point).toString(),
            "0xa0ad987cffcf2e3f96af64dd197d95d4e8e41be4448f6abebd8953b3c37b3132a1a1917c2046f6d3550cac70299110b28f23454d6124892ab2b8a6508f2bfe47"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of PublicKey", () => {
        const publicKey = new sdk.PublicKey("boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg");
        assert.deepStrictEqual(
            sdk.hashFull(publicKey).toString(),
            "0x774d28bb3dc06a1418a4165109f4e8e4e05b4b283c798dd10aa70050a9b095408b3d1c6c1017b69912e94a4a58c5cb522e78b9741e1380bb5d2d705116f886ef"
        );
    });
});
