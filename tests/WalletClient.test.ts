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
import * as sdk from "../lib";
// @ts-ignore
import { TestAgora, TestStoa } from "./Utils";
// tslint:disable-next-line:no-duplicate-imports
import { sample_txs_history_client, sample_txs_pending_client, sample_tx_client } from "./Utils";
// tslint:disable-next-line:no-duplicate-imports
import { sample_tx_hash_client, sample_tx_overview_client, sample_utxo_client } from "./Utils";

import * as assert from "assert";
import URI from "urijs";

describe("Wallet Client", () => {
    let agora_server: TestAgora;
    let stoa_server: TestStoa;
    const agora_port: string = "6000";
    const stoa_port: string = "7000";

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
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        // Query
        const res = await wallet_client.getBlockHeight();
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sdk.JSBI.BigInt(10));
    });

    it("Test calculating fees of the transaction", async () => {
        const wallet_client = new sdk.WalletClient({
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
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
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const public_key = new sdk.PublicKey("boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9");
        const res = await wallet_client.getTransactionsHistory(public_key, 10, 1, ["payment", "freeze"]);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sample_txs_history_client);
    });

    it("Test a function of the Wallet Client - `getTransactionOverview`", async () => {
        const wallet_client = new sdk.WalletClient({
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const tx_hash = new sdk.Hash(
            "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814"
        );
        const res = await wallet_client.getTransactionOverview(tx_hash);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sample_tx_overview_client);
    });

    it("Test a function of the Wallet Client - `getTransactionsPending`", async () => {
        const wallet_client = new sdk.WalletClient({
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const public_key = new sdk.PublicKey("boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s");
        const res = await wallet_client.getTransactionsPending(public_key);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sample_txs_pending_client);
    });

    it("Test a function of the Wallet Client - `getPendingTransaction`", async () => {
        const wallet_client = new sdk.WalletClient({
            agoraEndpoint: "http://localhost:6000",
            stoaEndpoint: "http://localhost:7000",
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const tx_hash = sample_tx_hash_client;
        const res = await wallet_client.getPendingTransaction(tx_hash);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sdk.Transaction.reviver("", sample_tx_client));
    });

    it("Test a function of the Wallet Client - `getTransaction`", async () => {
        const wallet_client = new sdk.WalletClient({
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const tx_hash = sample_tx_hash_client;
        const res = await wallet_client.getTransaction(tx_hash);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sdk.Transaction.reviver("", sample_tx_client));
    });

    it("Test a function of the Wallet Client - `getVotingFee`", async () => {
        const wallet_client = new sdk.WalletClient({
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet_client.getVotingFee(273);
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data, sdk.JSBI.BigInt(29310880));
    });

    it("Test a function of the Wallet Client - `verifyPayment`", async () => {
        const wallet_client = new sdk.WalletClient({
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
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
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
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
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
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
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
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
});
