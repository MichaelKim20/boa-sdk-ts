import * as boasdk from '../lib';
import * as assert from 'assert';

describe ('Send Transaction', () =>
{
    before('Wait for the package libsodium to finish loading', (doneIt: () => void) =>
    {
        boasdk.SodiumHelper.init()
            .then(() =>
            {
                doneIt();
            })
            .catch((err: any) =>
            {
                doneIt();
            });
    });

    it ('Extract the public key from a string then convert it back into a string and compare it.', () =>
    {
        let gen_key = boasdk.KeyPair.fromSeed(boasdk.Seed.fromString('SCT4KKJNYLTQO4TVDPVJQZEONTVVW66YLRWAINWI3FZDY7U4JS4JJEI4'));
        let gen_address = gen_key.address.toString();
        let genesisTx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [],
            [
                new boasdk.TxOutput(BigInt("625000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("625000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("625000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("625000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("625000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("625000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("625000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("625000000000000"), boasdk.PublicKey.fromString(gen_address))
            ]);
        let gen_tx_hash = boasdk.hashFull(genesisTx);

        assert.strictEqual(gen_tx_hash.toString(), "0x5d7f6a7a30f7ff591c8649" +
            "f61eb8a35d034824ed5cd252c2c6f10cdbd2236713dc369ef2a44b62ba11381" +
            "4a9d819a276ff61582874c9aee9c98efa2aa1f10d73");

        let txs1 = [];
        for (let idx = 0; idx < 8; idx++) {
            txs1.push(
                boasdk.TransactionBuilder.create(genesisTx, idx)
                    .refund(gen_key.address)
                    .sign(gen_key)
            );
        }
        //console.log(txs1);

        let txs2 = [];
        for (let tx of txs1)
        {
            txs2.push(
                boasdk.TransactionBuilder.create(tx)
                    .refund(gen_key.address)
                    .sign(gen_key)
            );
        }
        console.log(JSON.stringify(txs2[0].toObject()));
    });
});
