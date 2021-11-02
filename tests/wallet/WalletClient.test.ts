/*******************************************************************************

    Test of WalletClient

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../../lib";
// @ts-ignore
import { TestAgora, TestStoa } from "../Utils";
// tslint:disable-next-line:no-duplicate-imports
import {
    sample_txs_history_client,
    sample_txs_pending_client,
    sample_tx_client,
    sample_tx_detail_client,
    sample_tx_history_client,
} from "../Utils";
// tslint:disable-next-line:no-duplicate-imports
import { sample_tx_hash_client, sample_tx_overview_client, sample_utxo_client } from "../Utils";

import * as assert from "assert";
import URI from "urijs";

describe("Wallet Client", () => {
    let agora_server: TestAgora;
    let stoa_server: TestStoa;
    const agora_port: string = "2410";
    const stoa_port: string = "5410";

    before("Wait for the package libsodium to finish loading", async () => {
        if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
        await sdk.SodiumHelper.init();
    });

    before("Start TestStoa", async () => {
        stoa_server = new TestStoa(stoa_port);
        await stoa_server.start();
    });

    before("Start TestAgora", async () => {
        agora_server = new TestAgora(agora_port);
        await agora_server.start();
    });

    after("Stop TestStoa", async () => {
        await stoa_server.stop();
    });

    after("Stop TestAgora", async () => {
        await agora_server.stop();
    });

    it("Test a function of the Wallet Client - `getBlockHeight`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        // Query
        const res = await wallet_client.getBlockHeight();
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sdk.JSBI.BigInt(10));
    });

    it("Test calculating fees of the transaction", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        let fees_res = await wallet_client.getTransactionFee(0);
        assert.deepStrictEqual(fees_res.code, sdk.WalletResultCode.Success);
        assert.ok(fees_res.data !== undefined);
        assert.deepStrictEqual(fees_res.data.medium, sdk.Amount.make("100000"));
        assert.deepStrictEqual(fees_res.data.low, sdk.Amount.make("100000"));
        assert.deepStrictEqual(fees_res.data.high, sdk.Amount.make("110000"));

        fees_res = await wallet_client.getTransactionFee(500);
        assert.deepStrictEqual(fees_res.code, sdk.WalletResultCode.Success);
        assert.ok(fees_res.data !== undefined);
        assert.deepStrictEqual(fees_res.data.medium, sdk.Amount.make("100000"));
        assert.deepStrictEqual(fees_res.data.low, sdk.Amount.make("100000"));
        assert.deepStrictEqual(fees_res.data.high, sdk.Amount.make("110000"));

        fees_res = await wallet_client.getTransactionFee(1_000);
        assert.deepStrictEqual(fees_res.code, sdk.WalletResultCode.Success);
        assert.ok(fees_res.data !== undefined);
        assert.deepStrictEqual(fees_res.data.medium, sdk.Amount.make("200000"));
        assert.deepStrictEqual(fees_res.data.low, sdk.Amount.make("180000"));
        assert.deepStrictEqual(fees_res.data.high, sdk.Amount.make("220000"));

        fees_res = await wallet_client.getTransactionFee(100_000);
        assert.deepStrictEqual(fees_res.code, sdk.WalletResultCode.Success);
        assert.ok(fees_res.data !== undefined);
        assert.deepStrictEqual(fees_res.data.medium, sdk.Amount.make("20000000"));
        assert.deepStrictEqual(fees_res.data.low, sdk.Amount.make("18000000"));
        assert.deepStrictEqual(fees_res.data.high, sdk.Amount.make("22000000"));
    });

    it("Test a function of the Wallet Client - `getTransactionsHistory`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const public_key = new sdk.PublicKey("boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9");
        const res = await wallet_client.getTransactionsHistory(public_key, 10, 1, ["payment", "freeze"]);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sample_txs_history_client);
    });

    it("Test a function of the Wallet Client - `getTransactionHistory`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const public_key = new sdk.PublicKey("boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9");
        const res = await wallet_client.getTransactionHistory(public_key, 10, 1, ["inbound", "outbound"]);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sample_tx_history_client);
    });

    it("Test a function of the Wallet Client - `getTransactionOverview`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const tx_hash = new sdk.Hash(
            "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814"
        );
        const res = await wallet_client.getTransactionOverview(tx_hash);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sample_tx_overview_client);
    });

    it("Test a function of the Wallet Client - `getTransactionDetail", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const tx_hash = new sdk.Hash(
            "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814"
        );
        const res = await wallet_client.getTransactionDetail(tx_hash);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sample_tx_detail_client);
    });

    it("Test a function of the Wallet Client - `getTransactionsPending`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const public_key = new sdk.PublicKey("boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s");
        const res = await wallet_client.getTransactionsPending(public_key);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sample_txs_pending_client);
    });

    it("Test a function of the Wallet Client - `getPendingTransaction`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const tx_hash = sample_tx_hash_client;
        const res = await wallet_client.getPendingTransaction(tx_hash);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sdk.Transaction.reviver("", sample_tx_client));
    });

    it("Test a function of the Wallet Client - `getTransaction`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const tx_hash = sample_tx_hash_client;
        const res = await wallet_client.getTransaction(tx_hash);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sdk.Transaction.reviver("", sample_tx_client));
    });

    it("Test a function of the Wallet Client - `getVotingFee`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const res = await wallet_client.getVotingFee(273);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sdk.JSBI.BigInt(29310880));
    });

    it("Test a function of the Wallet Client - `verifyPayment`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const tx_hash = sample_tx_hash_client;
        const res = await wallet_client.verifyPayment(tx_hash);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, {
            result: true,
            message: "Success",
        });
    });

    it("Test a function of the Wallet Client - `getUTXOInfo`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const utxo_hash = [
            new sdk.Hash(
                "0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0"
            ),
            new sdk.Hash(
                "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85"
            ),
            new sdk.Hash(
                "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685"
            ),
        ];

        const res = await wallet_client.getUTXOInfo(utxo_hash);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(
            JSON.stringify(res.data),
            `[{"utxo":"0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0","type":1,"unlock_height":[1],"amount":"200000","height":[],"time":1577836800000,"lock_type":0,"lock_bytes":"wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE="},{"utxo":"0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85","type":0,"unlock_height":[2],"amount":"200000","height":[1],"time":1577837400000,"lock_type":0,"lock_bytes":"wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE="},{"utxo":"0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685","type":0,"unlock_height":[4],"amount":"200000","height":[3],"time":1577838600000,"lock_type":0,"lock_bytes":"wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE="}]`
        );
    });

    it("Test a function of the Wallet Client - `getBalance`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        const res = await wallet_client.getBalance(public_key);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data.address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.deepStrictEqual(res.data.balance, sdk.Amount.make(2000000));
        assert.deepStrictEqual(res.data.spendable, sdk.Amount.make(1800000));
        assert.deepStrictEqual(res.data.frozen, sdk.Amount.make(200000));
        assert.deepStrictEqual(res.data.locked, sdk.Amount.make(0));
    });

    it("Test a function of the Wallet Client - `getWalletUTXO`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        // Query
        const public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");

        // Request First UTXO
        const first_res = await wallet_client.getUTXOs(public_key, sdk.JSBI.BigInt(300000), 0);
        assert.deepStrictEqual(first_res.code, sdk.WalletResultCode.Success);
        assert.ok(first_res.data !== undefined);
        const first_utxos = first_res.data;
        assert.deepStrictEqual(first_utxos.length, 2);
        assert.deepStrictEqual(first_utxos[0].utxo.toString(), sample_utxo_client[1].utxo);
        assert.deepStrictEqual(first_utxos[1].utxo.toString(), sample_utxo_client[2].utxo);

        // Request Second UTXO
        const second_res = await wallet_client.getUTXOs(public_key, sdk.JSBI.BigInt(300000), 0, first_utxos[1].utxo);
        assert.deepStrictEqual(second_res.code, sdk.WalletResultCode.Success);
        assert.ok(second_res.data !== undefined);
        const second_utxos = second_res.data;
        assert.deepStrictEqual(second_utxos.length, 2);
        assert.deepStrictEqual(second_utxos[0].utxo.toString(), sample_utxo_client[3].utxo);
        assert.deepStrictEqual(second_utxos[1].utxo.toString(), sample_utxo_client[4].utxo);

        // Request Frozen UTXO
        const third_res = await wallet_client.getUTXOs(public_key, sdk.JSBI.BigInt(300000), 1);
        assert.ok(third_res.data !== undefined);
        const third_utxos = third_res.data;
        assert.deepStrictEqual(third_utxos.length, 1);
        assert.deepStrictEqual(third_utxos[0].utxo.toString(), sample_utxo_client[0].utxo);
    });

    it("Test saving a vote data with `WalletUTXOProvider`", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );

        const vote_data = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.TxPayloadFee.getFeeAmount(vote_data.length);
        const tx_fee = sdk.Amount.make(0);

        const builder = new sdk.TxBuilder(key_pair);

        // Create UTXOProvider
        const utxo_provider = new sdk.WalletUTXOProvider(key_pair.address, wallet_client);
        // Get UTXO for the amount to need.
        const utxo_res = await utxo_provider.getUTXO(
            sdk.Amount.add(sdk.Amount.add(payload_fee, tx_fee), sdk.Amount.make(1))
        );
        assert.deepStrictEqual(utxo_res.code, sdk.WalletResultCode.Success);
        assert.ok(utxo_res.data !== undefined);
        const utxos = utxo_res.data;
        utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

        const expected = {
            inputs: [
                {
                    utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                    unlock: {
                        bytes: "Vh6I8RKAw+8lM0NulP9PotF9DS/+o6cKAPfVNVaZ6QHKg3gM7IOVo3JG5fxw8b1YledAEKqBD/jhQzFVg0LI5w==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
                    unlock: {
                        bytes: "PlOoZA14zITTLDEc7rXmAN7mujRMRYl0y6B0bz3cew+sh0mAT5q0RJBmfRFdyWBjKUaDD1364pHdIaF79Pyhqg==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                    unlock: {
                        bytes: "wu4d7hTwbWTl8i6DHLxLN6ApLZwznOo/1eCowQlI9wzdTHaicUucykDomWv6E8aa31bgawJbGs5kkqKK3zMloA==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                { type: 0, value: "100000", lock: { type: 0, bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=" } },
            ],
            payload: "YXRhZCBldG92",
            lock_height: "0",
        };
        const tx = builder.assignPayload(vote_data).sign(sdk.OutputType.Payment, tx_fee, payload_fee);

        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.strictEqual(JSON.stringify(tx), JSON.stringify(expected));

        const res = await wallet_client.sendTransaction(tx);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, true);
    });

    it("Test saving a vote data with `WalletUTXOProvider` - There is no output", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );

        const vote_data = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.Amount.make(200000);
        const tx_fee = sdk.Amount.make(0);

        const builder = new sdk.TxBuilder(key_pair);

        // Create UTXOProvider
        const utxo_provider = new sdk.WalletUTXOProvider(key_pair.address, wallet_client);
        // Get UTXO for the amount to need.
        // There can't be any output. An error occurs because the constraint of
        // the transaction is not satisfied that it must have at least one output.
        const utxo_res = await utxo_provider.getUTXO(sdk.Amount.add(payload_fee, tx_fee));
        assert.deepStrictEqual(utxo_res.code, sdk.WalletResultCode.Success);
        assert.ok(utxo_res.data !== undefined);
        const utxos = utxo_res.data;
        utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

        assert.throws(() => {
            const tx = builder.assignPayload(vote_data).sign(sdk.OutputType.Payment, tx_fee, payload_fee);
        });
    });

    it("Test saving a vote data - There is at least one output", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );

        const vote_data = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.Amount.make(200000);
        const tx_fee = sdk.Amount.make(0);

        const builder = new sdk.TxBuilder(key_pair);

        // Create UTXOProvider
        const utxo_provider = new sdk.WalletUTXOProvider(key_pair.address, wallet_client);
        // Get UTXO for the amount to need.
        // The amount of the UTXO found is one greater than the fee, allowing at least one change output.
        const utxo_res = await utxo_provider.getUTXO(
            sdk.Amount.add(sdk.Amount.add(payload_fee, tx_fee), sdk.Amount.make(1))
        );
        assert.deepStrictEqual(utxo_res.code, sdk.WalletResultCode.Success);
        assert.ok(utxo_res.data !== undefined);
        const utxos = utxo_res.data;
        utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));

        const tx = builder.assignPayload(vote_data).sign(sdk.OutputType.Payment, tx_fee, payload_fee);

        const expected = {
            inputs: [
                {
                    utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                    unlock: {
                        bytes: "EEAMWbm0H0MkmB+FwbP1IvUmvPV1GR5THFECDg5C2APUfF9/SDEstKEmZWS2zJfh4PFXAzmpsiNrSOyuM2y6gw==",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                    unlock: {
                        bytes: "7pgvYc4SRBFAvPfD6Y9Ee+juGEvl9aXt7+UlkO2iWQfpYLL9HNZCH5PwslrCv3MvLpZH6H+kUYTozwSl2hg4lg==",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                { type: 0, value: "200000", lock: { type: 0, bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=" } },
            ],
            payload: "YXRhZCBldG92",
            lock_height: "0",
        };
        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.strictEqual(JSON.stringify(tx), JSON.stringify(expected));

        const res = await wallet_client.sendTransaction(tx);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, true);
    });

    it("Test the WalletUTXOProvider", async () => {
        const wallet_client = new sdk.WalletClient({
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        });

        const public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");

        const utxoProvider = new sdk.WalletUTXOProvider(public_key, wallet_client);
        // Request First UTXO
        const first_res = await utxoProvider.getUTXO(sdk.Amount.make(300000), sdk.Amount.make(100000));
        assert.deepStrictEqual(first_res.code, sdk.WalletResultCode.Success);
        assert.ok(first_res.data !== undefined);
        const first_utxos = first_res.data;
        assert.deepStrictEqual(first_utxos.length, 3);
        assert.deepStrictEqual(first_utxos[0].utxo.toString(), sample_utxo_client[1].utxo);
        assert.deepStrictEqual(first_utxos[1].utxo.toString(), sample_utxo_client[2].utxo);
        assert.deepStrictEqual(first_utxos[2].utxo.toString(), sample_utxo_client[3].utxo);

        // Request Second UTXO
        const second_res = await utxoProvider.getUTXO(sdk.Amount.make(300000), sdk.Amount.make(100000));
        assert.deepStrictEqual(second_res.code, sdk.WalletResultCode.Success);
        assert.ok(second_res.data !== undefined);
        const second_utxos = second_res.data;
        assert.deepStrictEqual(second_utxos.length, 3);
        assert.deepStrictEqual(second_utxos[0].utxo.toString(), sample_utxo_client[4].utxo);
        assert.deepStrictEqual(second_utxos[1].utxo.toString(), sample_utxo_client[5].utxo);
        assert.deepStrictEqual(second_utxos[2].utxo.toString(), sample_utxo_client[6].utxo);
    });
});
