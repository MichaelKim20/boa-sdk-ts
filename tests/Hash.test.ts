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
            "0xc8271ef13d23732fa4628f68325432a7df36b0deb0a089f536c7cf7eefe0615ee6598c9c790ebe14141d74546f49b2dd11171b0d39f4297db25af72ea024a250"
        );

        // Source 3 : "boa"
        const boa = sdk.hash(Buffer.from("boa"));

        const h2 = sdk.hash(Buffer.concat([Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]), foo.data, bar.data, boa.data]));
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
            "0xebf52984772aed2ad1bf97252e7f204f7607182cbf55c7d7a3bbf6649fb3a7ee79a7810ce31c831da830a6c7f6c84c4129f14d1e93a9b5afe3b91fd2aaf9c6de"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test of multi hash of variables", () => {
        // Source 1 : "foo"
        const foo = sdk.hash(Buffer.from("foo"));

        // UInt8
        assert.strictEqual(
            sdk.hashMulti(foo, sdk.VariableBytes.fromUInt8(45)).toString(),
            "0x4302de357edbf92bbc7ab1fa6c0725c882e9fdc7cbf1a7647b72e46355ebbbec72e90eaeb8378ce536d4da84bef86ed44baf942d94e52b2f289edde7ff0d3fef"
        );

        // UInt16
        assert.strictEqual(
            sdk.hashMulti(foo, sdk.VariableBytes.fromUInt16(45)).toString(),
            "0x85be6919b5276738562c070c635f51af884589f9a65d9d2fa179e38d5fc31a6d1fc3a9a337c085565d91319f8b01f89751aa1b9efafc570964a30d5d87cc5644"
        );

        // UInt32
        assert.strictEqual(
            sdk.hashMulti(foo, sdk.VariableBytes.fromUInt32(45)).toString(),
            "0xa8fe8e8d0a416d96e56226ef22b8ae1eef5487cf057dbb82e4ba16f60e9dacd058a364721266d5f9cdae6f9f9166f8f44357efb347783ae77576c01332459fa9"
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
            "0x35f0a7e120738d87431507d168a44c9b16b0381d0c6d7a62b5eb6ec5070fcfc46ebf753a8da5623cef1a2a80e03174cbd63be0ed3143311a1e19524940460c14"
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
            []
        );
        assert.strictEqual(
            sdk.hashFull(header).toString(),
            "0x08e3eac0394512060fb6d47a28092888c9b100149ab0c925d36ba554c90d8ebee0269789bb0f6d03117b43117a05ecc24849f0a6020dd7bce0a66065379eb9a3"
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
            []
        );
        assert.strictEqual(
            sdk.hashFull(header).toString(),
            "0x9df8acdbece16d9f690fb6c81bd65b5ff5840619a79fc357b6a4667211a73add8915e557950281d95612eb875a9d490583fb8190fabe893279716bfc440b0e3d"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of Scalar", () => {
        const scalar = new sdk.Scalar("0x0e00a8df701806cb4deac9bb09cc85b097ee713e055b9d2bf1daf668b3f63778");
        assert.deepStrictEqual(
            sdk.hashFull(scalar).toString(),
            "0x0528f5a8f7d6298e6f560d05283e6256911cbb6ffb18eee5a3a9e8f423ec468cb49a89d6f78fac459668ed819610d6e6b323391675271243f9fbf7036a4512fe"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of Point", () => {
        const point = new sdk.Point("0xdb445140a72012a177535f43e6bbb8523ff21de465a7c35b42be1a447e5e2908");
        assert.deepStrictEqual(
            sdk.hashFull(point).toString(),
            "0x2358dd06aeca72e8bcb5918f1c4abae9eee8174e5af68e02b17d3c035b459663baee8c0cf6f7e4a1a7944d2494243a69d6f6db182071ddc25b5b5a7c7e42a635"
        );
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of PublicKey", () => {
        const publicKey = new sdk.PublicKey("boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg");
        assert.deepStrictEqual(
            sdk.hashFull(publicKey).toString(),
            "0xd7935c2af683f3b28f2040ca41e3d5ee352b30237f1aabba85d09c01262e88b84ae8f37057a33f4bb14968dd97e86119f436a7a7ebe2fd1be0ce9eeb888a02ad"
        );
    });

    it("Test of ChainId", () => {
        const secret: sdk.JSBI = sdk.JSBI.BigInt(0x1337);
        assert.notDeepStrictEqual(sdk.hashFull(secret, true, 0xdead), sdk.hashFull(secret, true, 0xbeef));
        assert.notDeepStrictEqual(sdk.hashFull(secret, true, 0xdead), sdk.hashFullNoMagic(secret));
        const secret2: sdk.JSBI = sdk.JSBI.BigInt(0x0f0f);
        const multi_hash = sdk.hashMulti(secret, secret2);

        sdk.setChainId(0xdead);
        assert.deepStrictEqual(sdk.hashFull(secret, true, 0xdead), sdk.hashFull(secret));
        assert.notDeepStrictEqual(multi_hash, sdk.hashMulti(secret, secret2));
    });
});
