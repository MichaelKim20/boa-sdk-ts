/*******************************************************************************

    Test of Signature

    Copyright:
    Copyright (c) 2021 BOSAGORA Foundation
    All rights reserved.

    License:
    MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";

import * as assert from "assert";
import { Hash } from "../src";

describe("Signature", () => {
    let sample_tx: sdk.Transaction;
    before("Wait for the package libsodium to finish loading", () => {
        sdk.Hasher.setChainId(sdk.ChainId.TestNet);
        if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    before("Create sample transaction", () => {
        sample_tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );
    });

    it("Test of SigPair - SigHash.All", () => {
        const seed = `SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI`;
        const kp = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed));

        const signature = kp.secret.sign<Buffer>(Buffer.from("Hello World"));
        const pair: sdk.SigPair = new sdk.SigPair(signature);
        const serialized = pair.encode();
        const decoded_pair = sdk.SigPair.decode(serialized);
        assert.deepStrictEqual(pair, decoded_pair);

        assert.ok(kp.address.verify<Buffer>(decoded_pair.signature, Buffer.from("Hello World")));
    });

    it("Test of SigPair - SigHash.Single", () => {
        const seed = `SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI`;
        const kp = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed));

        const signature = kp.secret.sign<Buffer>(Buffer.from("Hello World"));
        const pair: sdk.SigPair = new sdk.SigPair(signature, sdk.SigHash.Single, 1);
        const serialized = pair.encode();
        const decoded_pair = sdk.SigPair.decode(serialized);
        assert.deepStrictEqual(pair, decoded_pair);

        assert.ok(kp.address.verify<Buffer>(decoded_pair.signature, Buffer.from("Hello World")));
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of transaction data", () => {
        assert.strictEqual(
            sdk.Hasher.hashFull(sample_tx).toString(),
            "0xadbc0332bd71d64d134e77f3c1e1828b1b4543f4922dc93bd6c3eff1c1c29f33f9cdb3980b1a6dddd6ac483b7766c8e21a3334f48eac39bec18802637e457a2f"
        );
        const seed = `SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI`;
        const kp = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed));
        const signature = kp.secret.sign<sdk.Transaction>(sample_tx);
        const pair: sdk.SigPair = new sdk.SigPair(signature);
    });

    it("Test of SigPair - SigHash.All - Transaction", () => {
        const seed = `SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI`;
        const kp = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed));

        const signature = kp.secret.sign<Hash>(sample_tx.getChallenge());
        const pair: sdk.SigPair = new sdk.SigPair(signature);
        const serialized = pair.encode();
        const decoded_pair = sdk.SigPair.decode(serialized);
        assert.deepStrictEqual(pair, decoded_pair);

        assert.ok(kp.address.verify<Hash>(decoded_pair.signature, sample_tx.getChallenge()));
    });
});
