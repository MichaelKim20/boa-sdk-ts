/*******************************************************************************

    Test that create hash.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';
import { BOASodium } from "boa-sodium-ts";

import * as assert from 'assert';
import JSBI from "jsbi";

describe('Hash', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        boasdk.SodiumHelper.assign(new BOASodium());
        return boasdk.SodiumHelper.init();
    });

    // Buffer has the same content. However, when printed with hex strings,
    // the order of output is different.
    // This was treated to be the same as D language.
    it('Test of reading and writing hex string', () => {
        // Read from hex string
        let h = new boasdk.Hash('0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd223671' +
            '3dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73');

        // Check
        assert.strictEqual(h.toString(),
            '0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd2236713d' +
            'c369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73');
    });

    // The test codes below compare with the values calculated in Agora.
    it('Test of hash("abc")', () => {
        // Hash
        let h = boasdk.hash(Buffer.from("abc"));

        // Check
        assert.strictEqual(h.toString(),
            '0x239900d4ed8623b95a92f1dba88ad31895cc3345ded552c22d79ab2a39c5877' +
            'dd1a2ffdb6fbb124bb7c45a68142f214ce9f6129fb697276a0d4d1c983fa580ba');
    });

    // The test codes below compare with the values calculated in Agora.
    it('Test of multi hash', () => {
        // Source 1 : "foo"
        let foo = boasdk.hash(Buffer.from("foo"));

        // Source 2 : "bar"
        let bar = boasdk.hash(Buffer.from("bar"));

        // Hash Multi
        let h = boasdk.hashMulti(foo.data, bar.data);

        // Check
        assert.strictEqual(h.toString(),
            '0xe0343d063b14c52630563ec81b0f91a84ddb05f2cf05a2e4330ddc79bd3a06e57' +
            'c2e756f276c112342ff1d6f1e74d05bdb9bf880abd74a2e512654e12d171a74');
    });

    // The test codes below compare with the values calculated in Agora.
    it('Test of utxo key, using makeUTXOKey', () => {
        let tx_hash = new boasdk.Hash('0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd223671' +
            '3dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73');
        //let hash = boasdk.makeUTXOKey(tx_hash, JSBI.BigInt(1));
        let hash = boasdk.makeUTXOKey(tx_hash, JSBI.BigInt(1));
        assert.strictEqual(hash.toString(),
            '0x7c95c29b184e47fbd32e58e5abd42c6e22e8bd5a7e934ab049d21df545e09c2' +
            'e33bb2b89df2e59ee01eb2519b1508284b577f66a76d42546b65a6813e592bb84');
    });

    // The test codes below compare with the values calculated in Agora.
    it ('Test for hash value of transaction data', () =>
    {
        let payment_tx = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.Null)
            ],
            ""
        );
        assert.strictEqual(boasdk.hashFull(payment_tx).toString(),
            "0xf35092a843a1ca6b00fc671f8913717564bc5ff51000fe515cdaace80e1a823" +
            "809deaa83202eed9d0912ac998c7325174f143569a144e6bee9ee48c9080ff3e1");

        assert.ok(payment_tx.isPayment());
        assert.ok(!payment_tx.isFreeze());
        assert.ok(!payment_tx.isCoinbase());

        let nBytes =
            boasdk.Hash.Width +             //  TxInput.utxo
            0 +                             //  TxInput.unlock.bytes
            boasdk.Utils.SIZE_OF_INT +      //  TxInput.unlock_age
            boasdk.Utils.SIZE_OF_BYTE +     //  TxOutput.type
            boasdk.Utils.SIZE_OF_LONG +     //  TxOutput.value
            boasdk.Utils.SIZE_OF_BYTE  +    //  TxOutput.lock.type
            0 +                             //  TxOutput.lock.bytes
            0 +                             //  Transaction.payload
            boasdk.Utils.SIZE_OF_LONG;      //  Transaction.lock_height
        assert.strictEqual(payment_tx.getNumberOfBytes(), nBytes);

        let freeze_tx = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Freeze, "0", boasdk.Lock.Null)
            ],
            Buffer.alloc(0)
        );

        assert.strictEqual(boasdk.hashFull(freeze_tx).toString(),
            "0x5e2cb99aadb3338d1b31f06185034309ca7166373cfc9c73a1a5c4de8f34c79" +
            "e4a3e01191516e05ad10f3c80329b13aa9cf336d192899681442e192c6837cdd6");

        assert.ok(!freeze_tx.isPayment());
        assert.ok(freeze_tx.isFreeze());
        assert.ok(!freeze_tx.isCoinbase());

        assert.strictEqual(freeze_tx.getNumberOfBytes(), nBytes);


        let payload_tx = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.Null)
            ],
            Buffer.from([1,2,3])
        );
        assert.strictEqual(boasdk.hashFull(payload_tx).toString(),
            "0x610cada756982f8d2c7d180f9e52a9b087dfb8ada939d7ae232aff65d6068aa" +
            "09765b24f978ea5701d7bd1e5cfa6027216f86ddd5bed11eb7260a7c5c976d3a6");
    });

    it ('Test for hash value of transaction with multi inputs', () =>
    {
        let tx1 = new boasdk.Transaction(
            [
                new boasdk.TxInput(new boasdk.Hash("0x2cf1caaeff65a7e2b2f7edff1023881564f2f0cad30161cf42279826e6919d77347df68de6d8eb0da58ebdc6e4f28da7569113002044467fc5cbf599a7ea9037")),
                new boasdk.TxInput(new boasdk.Hash("0x47a38b066ca55ef3e855b0c741ebd301b3fa38a86f9ed3507ab08794f24eddbd279eeb5bddde331cdaaf44401fcedb0f2f23d117607864c43bdb0cf587df13d7"))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.Null)
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx1).toString(),
            "0x68d43a026b896469ca46fdfe266b8915a528da51eda4238d34a0bacfedc0225" +
            "5c8cda96daa1ffc9bdac1cef5c04aca301f35e59dc612243b880710b8f8ef0efe");


        let tx2 = new boasdk.Transaction(
            [
                new boasdk.TxInput(new boasdk.Hash("0x2cf1caaeff65a7e2b2f7edff1023881564f2f0cad30161cf42279826e6919d77347df68de6d8eb0da58ebdc6e4f28da7569113002044467fc5cbf599a7ea9037")),
                new boasdk.TxInput(new boasdk.Hash("0x47a38b066ca55ef3e855b0c741ebd301b3fa38a86f9ed3507ab08794f24eddbd279eeb5bddde331cdaaf44401fcedb0f2f23d117607864c43bdb0cf587df13d7"))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.Null)
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx2).toString(),
            "0x68d43a026b896469ca46fdfe266b8915a528da51eda4238d34a0bacfedc0225" +
            "5c8cda96daa1ffc9bdac1cef5c04aca301f35e59dc612243b880710b8f8ef0efe");
    });

    it ('Test for hash value of transaction with multi outputs', () =>
    {
        let tx1 = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw"))),
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0")))
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx1).toString(),
            "0x213f69bbb8ba5b7f4aee877c78c7437ba97c46bdee076083467480d794ecbf7" +
            "2f8eaa6755b8a8c43571a191e8f1dd0eef7aaa27662ec83a029bdc990cf0f4038");


        let tx2 = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0"))),
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")))
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx2).toString(),
            "0x213f69bbb8ba5b7f4aee877c78c7437ba97c46bdee076083467480d794ecbf7" +
            "2f8eaa6755b8a8c43571a191e8f1dd0eef7aaa27662ec83a029bdc990cf0f4038");
    });

    it ('Test for hash value of transaction with multi outputs same address', () =>
    {
        let tx1 = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "200", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw"))),
                new boasdk.TxOutput(boasdk.OutputType.Payment, "100", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")))
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx1).toString(),
            "0xd9df094c12c59913436932cf43041c3f5472acb9983d6ae574339ccd2a20c87" +
            "72c3f43b6dae43f8be7422455eb89ab36998b34497655ab43c26442a222029ca8");

        let tx2 = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "100", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw"))),
                new boasdk.TxOutput(boasdk.OutputType.Payment, "200", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")))
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx2).toString(),
            "0xd9df094c12c59913436932cf43041c3f5472acb9983d6ae574339ccd2a20c87" +
            "72c3f43b6dae43f8be7422455eb89ab36998b34497655ab43c26442a222029ca8");
    });

    // The test codes below compare with the values calculated in Agora.
    it ('Test for hash value of BlockHeader', () =>
    {
        let pubkey = new boasdk.PublicKey('boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg');

        let tx = new boasdk.Transaction(
            [ ],
            [ new boasdk.TxOutput(boasdk.OutputType.Payment, "100", pubkey) ],
            Buffer.alloc(0)
        );

        let header: boasdk.BlockHeader = new boasdk.BlockHeader(
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            new boasdk.Height("0"),
            boasdk.hashFull(tx),
            new boasdk.BitField([0]),
            new boasdk.Signature(Buffer.alloc(boasdk.Signature.Width)),
            [ ],
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            [ ],
            0
        );
        assert.strictEqual(boasdk.hashFull(header).toString(),
            "0xd28b9a8ce916bdcac57446b48250f8ef34f13c37b6d0247ffb16b51d4f714b4" +
            "a81233a1a589bd3f025a80e0ac51e46e48f493884ab24bf7111e5df28723b9a23");
    });

    // The test codes below compare with the values calculated in Agora.
    it ('Test for hash value of BlockHeader with missing validators', () =>
    {
        let pubkey = new boasdk.PublicKey('boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg');

        let tx = new boasdk.Transaction(
            [ ],
            [ new boasdk.TxOutput(boasdk.OutputType.Payment, "100", pubkey) ],
            Buffer.alloc(0)
        );

        let header: boasdk.BlockHeader = new boasdk.BlockHeader(
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            new boasdk.Height("0"),
            boasdk.hashFull(tx),
            new boasdk.BitField([ ]),
            new boasdk.Signature(Buffer.alloc(boasdk.Signature.Width)),
            [ ],
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            [ 1, 2, 3, 256, 257, 258, 70000, 80000, 90000 ],
            0
        );
        assert.strictEqual(boasdk.hashFull(header).toString(),
            "0xb76c8f9c01169fea26539d602e42282e0e5e620570c07dfd3839c0eb7a57162" +
            "57939ef46dd7d6669a5c3bc4acb13f27eb61da944d103b9fc8a1f0aa06b410a22");
    });

    // The test codes below compare with the values calculated in Agora.
    it ("Test for hash value of Scalar", () =>
    {
        let scalar = new boasdk.Scalar(
            "0x0e00a8df701806cb4deac9bb09cc85b097ee713e055b9d2bf1daf668b3f63778");
        assert.deepStrictEqual(boasdk.hashFull(scalar).toString(),
            "0x4f895cc641b2bfe4541f53b83445add00a7a81ad340312c51cbf15c53ddebcc" +
            "7ea7dcd11a97e085d28552026952e7c7c8d4276d5901d33605a3ea21027a673d4");
    });

    // The test codes below compare with the values calculated in Agora.
    it ("Test for hash value of Point", () =>
    {
        let point = new boasdk.Point(
            "0xdb445140a72012a177535f43e6bbb8523ff21de465a7c35b42be1a447e5e2908")
        assert.deepStrictEqual(boasdk.hashFull(point).toString(),
            "0xa0ad987cffcf2e3f96af64dd197d95d4e8e41be4448f6abebd8953b3c37b313" +
            "2a1a1917c2046f6d3550cac70299110b28f23454d6124892ab2b8a6508f2bfe47");
    });

    // The test codes below compare with the values calculated in Agora.
    it ("Test for hash value of PublicKey", () =>
    {
        let publicKey = new boasdk.PublicKey('boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg');
        assert.deepStrictEqual(boasdk.hashFull(publicKey).toString(),
            "0x774d28bb3dc06a1418a4165109f4e8e4e05b4b283c798dd10aa70050a9b0954" +
            "08b3d1c6c1017b69912e94a4a58c5cb522e78b9741e1380bb5d2d705116f886ef");
    });
});
