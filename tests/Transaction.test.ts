/*******************************************************************************

    Test of Transaction

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

describe("Transaction", () => {
    before("Wait for the package libsodium to finish loading", () => {
        sdk.setChainId(sdk.ChainId.TestNet);
        if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    // The test codes below compare with the values calculated in Agora.
    it("Test for hash value of transaction data", () => {
        const payment_tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(payment_tx).toString(),
            "0xadbc0332bd71d64d134e77f3c1e1828b1b4543f4922dc93bd6c3eff1c1c29f33f9cdb3980b1a6dddd6ac483b7766c8e21a3334f48eac39bec18802637e457a2f"
        );

        assert.ok(payment_tx.isPayment());
        assert.ok(!payment_tx.isFreeze());
        assert.ok(!payment_tx.isCoinbase());

        const freeze_tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Freeze, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );

        assert.strictEqual(
            sdk.hashFull(freeze_tx).toString(),
            "0x7958451244fd136328f75514ebb54eda51320b36835ed024582abc2238baf40d3edf813dd7fc8d9b2b1c89c015f89d09ccc2cd73de58512a7202fe850c0eed0d"
        );

        assert.ok(!freeze_tx.isPayment());
        assert.ok(freeze_tx.isFreeze());
        assert.ok(!freeze_tx.isCoinbase());

        const payload_tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.from([1, 2, 3])
        );
        assert.strictEqual(
            sdk.hashFull(payload_tx).toString(),
            "0x4c8f4f2b1516d94cee686547d279c617a35734f11f4cb3d90bd9c1325a91c68a6146dc7018ff27368e6e07126a82f991a52aad40a04ac01b0a57605e14f55e4b"
        );
    });

    it("Test for hash value of transaction with multi inputs", () => {
        const tx1 = new sdk.Transaction(
            [
                new sdk.TxInput(
                    new sdk.Hash(
                        "0x2cf1caaeff65a7e2b2f7edff1023881564f2f0cad30161cf42279826e6919d77347df68de6d8eb0da58ebdc6e4f28da7569113002044467fc5cbf599a7ea9037"
                    )
                ),
                new sdk.TxInput(
                    new sdk.Hash(
                        "0x47a38b066ca55ef3e855b0c741ebd301b3fa38a86f9ed3507ab08794f24eddbd279eeb5bddde331cdaaf44401fcedb0f2f23d117607864c43bdb0cf587df13d7"
                    )
                ),
            ],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx1).toString(),
            "0x2db765b318d83e32c70fbc2b0daa5a56158b089da0be4e8477cab6b9c3d460b5c382f8c16af834284f4a06c4a416550be6a707fe0544cbd261c59a11b991915d"
        );

        const tx2 = new sdk.Transaction(
            [
                new sdk.TxInput(
                    new sdk.Hash(
                        "0x47a38b066ca55ef3e855b0c741ebd301b3fa38a86f9ed3507ab08794f24eddbd279eeb5bddde331cdaaf44401fcedb0f2f23d117607864c43bdb0cf587df13d7"
                    )
                ),
                new sdk.TxInput(
                    new sdk.Hash(
                        "0x2cf1caaeff65a7e2b2f7edff1023881564f2f0cad30161cf42279826e6919d77347df68de6d8eb0da58ebdc6e4f28da7569113002044467fc5cbf599a7ea9037"
                    )
                ),
            ],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx2).toString(),
            "0x2db765b318d83e32c70fbc2b0daa5a56158b089da0be4e8477cab6b9c3d460b5c382f8c16af834284f4a06c4a416550be6a707fe0544cbd261c59a11b991915d"
        );
    });

    it("Test for hash value of transaction with multi outputs", () => {
        const tx1 = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "0",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "0",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0")
                    )
                ),
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx1).toString(),
            "0xf5f72ceb5d5b19f3d6a54649ec25dd8f331881d19056631a92449da13f566da70bba365e3a351e849a0f8a6012f31f31ca212570a9cef10a25e0e4f57343956f"
        );

        const tx2 = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "0",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0")
                    )
                ),
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "0",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx2).toString(),
            "0xf5f72ceb5d5b19f3d6a54649ec25dd8f331881d19056631a92449da13f566da70bba365e3a351e849a0f8a6012f31f31ca212570a9cef10a25e0e4f57343956f"
        );
    });

    it("Test for hash value of transaction with multi outputs same address", () => {
        const tx1 = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "200",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "100",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx1).toString(),
            "0x048418fe03f13fb0094ec50252d4aa530fbeb4929d09763a35fbb8d17fe3ee8d370a6b5d5ceb1f2e85f77175bd43f7dc409133fd4500d56b77de4d481730f771"
        );

        const tx2 = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "100",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
                new sdk.TxOutput(
                    sdk.OutputType.Payment,
                    "200",
                    sdk.Lock.fromPublicKey(
                        new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
                    )
                ),
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(
            sdk.hashFull(tx2).toString(),
            "0x048418fe03f13fb0094ec50252d4aa530fbeb4929d09763a35fbb8d17fe3ee8d370a6b5d5ceb1f2e85f77175bd43f7dc409133fd4500d56b77de4d481730f771"
        );
    });

    it("Test of estimated size", () => {
        assert.strictEqual(sdk.TxInput.getEstimatedNumberOfBytes(), 133);
        assert.strictEqual(sdk.TxOutput.getEstimatedNumberOfBytes(), 45);
        assert.strictEqual(sdk.Transaction.getEstimatedNumberOfBytes(0, 0, 0), 8);
    });

    it("Test for Transaction.getNumberOfBytes", () => {
        const tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );

        const nZero = 0;
        const nBytes =
            sdk.Hash.Width + //  TxInput.utxo
            nZero + //  TxInput.unlock.bytes
            sdk.Utils.SIZE_OF_INT + //  TxInput.unlock_age
            sdk.Utils.SIZE_OF_INT + //  TxOutput.type
            sdk.Utils.SIZE_OF_LONG + //  TxOutput.value
            sdk.Utils.SIZE_OF_BYTE + //  TxOutput.lock.type
            nZero + //  TxOutput.lock.bytes
            nZero + //  Transaction.payload
            sdk.Utils.SIZE_OF_LONG; //  Transaction.lock_height
        assert.strictEqual(tx.getNumberOfBytes(), nBytes);
    });

    it("Test for Transaction.clone()", () => {
        const tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.from([4, 6])
        );

        const clone_tx = tx.clone();
        assert.deepStrictEqual(tx, clone_tx);
    });

    it("Test for Transaction.getChallenge()", () => {
        const tx = new sdk.Transaction(
            [sdk.TxInput.fromTxHash(new sdk.Hash(Buffer.alloc(sdk.Hash.Width)), sdk.JSBI.BigInt(0))],
            [new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.Null)],
            Buffer.alloc(0)
        );
        assert.deepStrictEqual(
            tx.getChallenge().toString(),
            "0x4a150c933fb180f64491cdcc31bba89cf30363c93d67ac79e098a7ef265303b06c2909781d20396dcb1e1f370633ec3fbc027c4a540b115eef0b5709afe6cc4e"
        );
    });

    it("Test for TxOutput.address", () => {
        const address = new sdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw");
        let output = new sdk.TxOutput(sdk.OutputType.Payment, "0", sdk.Lock.fromPublicKey(address));
        assert.deepStrictEqual(output.address, address);

        output = new sdk.TxOutput(sdk.OutputType.Payment, "0", new sdk.Lock(sdk.LockType.KeyHash, Buffer.alloc(32)));
        assert.strictEqual(output.address.isNull(), true);

        output = new sdk.TxOutput(sdk.OutputType.Payment, "0", new sdk.Lock(sdk.LockType.Script, Buffer.alloc(32)));
        assert.strictEqual(output.address.isNull(), true);

        output = new sdk.TxOutput(sdk.OutputType.Payment, "0", new sdk.Lock(sdk.LockType.Redeem, Buffer.alloc(32)));
        assert.strictEqual(output.address.isNull(), true);
    });
});
