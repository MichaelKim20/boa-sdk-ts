/*******************************************************************************

    Test data delivery of BOA Client using internal web server

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";
// @ts-ignore
import {
    sample_txs_history_client,
    sample_txs_pending_client,
    sample_tx_client,
    sample_tx_detail_client,
    sample_tx_history_client,
} from "./Utils";
// tslint:disable-next-line:no-duplicate-imports
import { sample_tx_hash_client, sample_tx_overview_client, sample_utxo_client } from "./Utils";
// tslint:disable-next-line:no-duplicate-imports
import { TestAgora, TestStoa } from "./Utils";

import * as assert from "assert";
import axios from "axios";
import URI from "urijs";

describe("BOA Client", () => {
    let stoa_server: TestStoa;
    let agora_server: TestAgora;
    const stoa_port: string = "5100";
    const agora_port: string = "2100";

    before("Wait for the package libsodium to finish loading", async () => {
        sdk.setChainId(sdk.ChainId.TestNet);
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

    it("Test requests and responses to data using `LocalNetworkTest`", async () => {
        // Now we use axios, but in the future we will implement sdk, and test it.
        const client = axios.create();
        const stoa_uri = URI("http://localhost")
            .port(stoa_port)
            .directory("validator")
            .filename("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")
            .setSearch("height", "10");

        const response = await client.get(stoa_uri.toString());
        assert.strictEqual(response.data.length, 1);
        assert.strictEqual(response.data[0].address, "boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw");
        assert.strictEqual(response.data[0].preimage.height, "10");
    });

    it("Test a function of the BOA Client - `getAllValidators`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const validators = await boa_client.getAllValidators(10);
        assert.strictEqual(validators.length, 3);
        assert.strictEqual(validators[0].address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.strictEqual(validators[0].preimage.height, "10");
    });

    it("Test a function of the BOA Client - `getAllValidator`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const validators = await boa_client.getValidator(
            "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0",
            10
        );
        assert.strictEqual(validators.length, 1);
        assert.strictEqual(validators[0].address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.strictEqual(validators[0].preimage.height, "10");
    });

    it("Test a function of the BOA Client - `getUtxo`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        const utxos = await boa_client.getUTXOs(public_key);
        assert.strictEqual(utxos.length, sample_utxo_client.length);
        assert.deepStrictEqual(utxos[0].utxo, new sdk.Hash(sample_utxo_client[0].utxo));
        assert.strictEqual(utxos[0].type, sample_utxo_client[0].type);
        assert.deepStrictEqual(utxos[0].unlock_height, sdk.JSBI.BigInt(sample_utxo_client[0].unlock_height));
        assert.deepStrictEqual(utxos[0].amount, sdk.Amount.make(sample_utxo_client[0].amount));
    });

    it("Test a function of the BOA Client - `getBlockHeight`", async () => {
        // Set URL
        const uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(uri.toString(), agora_uri.toString());

        // Query
        const height = await boa_client.getBlockHeight();
        assert.deepStrictEqual(height, sdk.JSBI.BigInt(10));
    });

    it("Test a function of the BOA Client using async, await - `getAllValidators`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const validators = await boa_client.getAllValidators(10);
        assert.strictEqual(validators.length, 3);
        assert.strictEqual(validators[0].address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.strictEqual(validators[0].preimage.height, "10");
    });

    it("Test a function of the BOA Client using async, await - `getAllValidator`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const validators = await boa_client.getValidator(
            "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0",
            10
        );
        assert.strictEqual(validators.length, 1);
        assert.strictEqual(validators[0].address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.strictEqual(validators[0].preimage.height, "10");
    });

    it("When none of the data exists as a result of the inquiry.", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const validators = await boa_client.getValidator(
            "boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg",
            10
        );
        assert.strictEqual(validators.length, 0);
    });

    it("When an error occurs with the wrong input parameter (height is -10).", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        await assert.rejects(
            boa_client.getValidator("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0", -10),
            {
                status: 400,
                message: "Bad Request",
                statusMessage: "The Height value is not valid.",
            }
        );
    });

    it("Can not connect to the server by entering the wrong URL", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port("6000");
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        await assert.rejects(
            boa_client.getValidator("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0", 10),
            {
                message: "connect ECONNREFUSED 127.0.0.1:6000",
            }
        );
    });

    /**
     * See_Also: https://github.com/bosagora/agora/blob/93c31daa616e76011deee68a8645e1b86624ce3d/source/agora/consensus/validation/PreImage.d#L79-L106
     */
    it("test for validity of pre-image", (doneIt: () => void) => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        let pre_images: sdk.Hash[] = [];

        pre_images.push(sdk.hash(Buffer.from(sdk.SodiumHelper.sodium.randombytes_buf(sdk.Hash.Width))));
        for (let idx = 0; idx < 20; idx++) {
            pre_images.push(sdk.hash(pre_images[idx].data));
        }
        pre_images = pre_images.reverse();

        const original_image = pre_images[0];
        const original_image_height = 1;

        // valid pre-image
        let new_image = pre_images[10];
        let new_image_height = 11;
        let res = boa_client.isValidPreimage(original_image, original_image_height, new_image, new_image_height);
        assert.ok(res.result);

        // invalid pre-image with wrong height number
        new_image = pre_images[10];
        new_image_height = 0;
        res = boa_client.isValidPreimage(original_image, original_image_height, new_image, new_image_height);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The height of new pre-image is smaller than that of original one.");

        // invalid pre-image with wrong hash value
        new_image = pre_images[10];
        new_image_height = 10;
        res = boa_client.isValidPreimage(original_image, original_image_height, new_image, new_image_height);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The pre-image has a invalid hash value.");

        // invalid (original_image_height is NaN and new_image_height is NaN)
        new_image = pre_images[10];
        new_image_height = 11;
        res = boa_client.isValidPreimage(original_image, NaN, new_image, new_image_height);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The original pre-image height is not valid.");

        // invalid (original_image_height is NaN and new_image_height is NaN)
        new_image = pre_images[10];
        res = boa_client.isValidPreimage(original_image, original_image_height, new_image, NaN);
        assert.ok(!res.result);
        assert.strictEqual(res.message, "The new pre-image height is not valid.");

        doneIt();
    });

    it("test for getHeightAt", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());
        let date = new Date(Date.UTC(2021, 3, 29, 0, 0, 0));
        let height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 16992);

        date = new Date(Date.UTC(2020, 11, 29, 0, 0, 0));
        await assert.rejects(
            boa_client.getHeightAt(date),
            new Error("The date before Genesis Block creation is invalid.")
        );

        date = new Date(Date.UTC(2021, 0, 1, 0, 0, 0));
        height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 0);

        date = new Date(Date.UTC(2021, 0, 1, 0, 9, 59));
        height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 0);

        date = new Date(Date.UTC(2021, 0, 1, 0, 10, 0));
        height = await boa_client.getHeightAt(date);
        assert.strictEqual(height, 1);
    });

    it("Test client name and version", async () => {
        const version = require("../package.json").version;

        const stoa_uri = URI("http://localhost").port(stoa_port).directory("client_info");

        const response = await sdk.Request().get(stoa_uri.toString());
        assert.strictEqual(response.data["X-Client-Name"], "boa-sdk-ts");
        assert.strictEqual(response.data["X-Client-Version"], version);
    });

    it("Test creating a vote data", () => {
        const utxos = [
            {
                utxo: new sdk.Hash(
                    "0x4028965b7408566a66e4cf8c603a1cdebc7659a3e693d36d2fdcb39b196da967914f40ef4966d5b4b1f4b3aae00fbd68ffe8808b070464c2a101d44f4d7b0170"
                ),
                amount: sdk.JSBI.BigInt(100000),
            },
            {
                utxo: new sdk.Hash(
                    "0x81a326afa790003c32517a2a2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c229b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c7497"
                ),
                amount: sdk.JSBI.BigInt(200000),
            },
            {
                utxo: new sdk.Hash(
                    "0xb82cb96710af2e9804c59d1f1e1679f8b8b69f4c0f6cd79c8c12f365dd766c09aaa4febcc18b3665d33301cb248ac7afd343ac7b98b27beaf246ad12d3b3219a"
                ),
                amount: sdk.JSBI.BigInt(300000),
            },
        ];

        const keys: sdk.KeyPair[] = [
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")),
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SCUCEYS4ZHJ2L6ME4Y37Q77KC3CQE42GLGAV6YDWP5NJVDC53HTQ4IIM")),
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SDZQW3XBFXRXW2L7GVLS7DARGRKPQR5QIB5CDMGQ4KB24T46JURAAOLT")),
        ];

        const builder = new sdk.TxBuilder(
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4"))
        );

        const vote_data = Buffer.from("YXRhZCBldG92", "base64");
        const fee = sdk.TxPayloadFee.getFee(vote_data.length);

        const vote_tx = builder
            .addInput(sdk.OutputType.Payment, utxos[0].utxo, utxos[0].amount, keys[0].secret)
            .addInput(sdk.OutputType.Payment, utxos[1].utxo, utxos[1].amount, keys[1].secret)
            .addInput(sdk.OutputType.Payment, utxos[2].utxo, utxos[2].amount, keys[2].secret)
            .assignPayload(vote_data)
            .addOutput(new sdk.PublicKey(sdk.TxPayloadFee.CommonsBudgetAddress), fee)
            .sign(sdk.OutputType.Payment);

        const expected_object = {
            inputs: [
                {
                    utxo: "0x4028965b7408566a66e4cf8c603a1cdebc7659a3e693d36d2fdcb39b196da967914f40ef4966d5b4b1f4b3aae00fbd68ffe8808b070464c2a101d44f4d7b0170",
                    unlock: {
                        bytes: "QRMyC/pbMltGfwhCc5OuWyLJisOauLj0zFzLtJaaUAJGEO3y9XeMpkXyeDho7OnQpXPPf9T4+7vj7+pRTW5SywE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x81a326afa790003c32517a2a2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c229b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c7497",
                    unlock: {
                        bytes: "3atQAYEFbz2YMbRvBrr/dcTIqi0gm9PGBI+PUubgcw1JxV9pNutf0YENsaomNJ1jkaUxnoGJDf+xlAm8aETRKgE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xb82cb96710af2e9804c59d1f1e1679f8b8b69f4c0f6cd79c8c12f365dd766c09aaa4febcc18b3665d33301cb248ac7afd343ac7b98b27beaf246ad12d3b3219a",
                    unlock: {
                        bytes: "dVeHIXR+yvVL5DI+s3PIB+VdPQ6R0kcg52MQejiTQwyS9ww5p70UsVKv2lbEiT4vJMak2wb0l8k80MbzG/wuOQE=",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                {
                    type: 0,
                    value: "500000",
                    lock: {
                        type: 0,
                        bytes: "Mb3OFIOnt8RdJR0g/RwOdU46rnt6kUGwAtwNIZG8f4E=",
                    },
                },
                {
                    type: 0,
                    value: "100000",
                    lock: {
                        type: 0,
                        bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
                    },
                },
            ],
            payload: "YXRhZCBldG92",
            lock_height: "0",
        };

        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        vote_tx.inputs.forEach((value: sdk.TxInput, idx: number) => {
            expected_object.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.deepStrictEqual(JSON.stringify(vote_tx), JSON.stringify(expected_object));

        // Verify the signature
        for (let idx = 0; idx < vote_tx.inputs.length; idx++)
            assert.ok(
                keys[idx].address.verify<sdk.Hash>(
                    sdk.SigPair.decode(vote_tx.inputs[idx].unlock.bytes).signature,
                    vote_tx.getChallenge()
                )
            );
    });

    it("Test saving a vote data", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        const utxo = {
            utxo: new sdk.Hash(
                "0x81a326afa790003c32517a2a2556613004e6147edac28d576cf7bcc2daadf4bb60be1f644c229b775e7894844ec66b2d70ddf407b8196b46bc1dfe42061c7497"
            ),
            amount: sdk.JSBI.BigInt(100000000),
        };
        const vote_data = Buffer.from("YXRhZCBldG92", "base64");
        const fee = sdk.TxPayloadFee.getFee(vote_data.length);

        const builder = new sdk.TxBuilder(
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4"))
        );
        const tx = builder
            .addInput(sdk.OutputType.Payment, utxo.utxo, utxo.amount)
            .addOutput(new sdk.PublicKey(sdk.TxPayloadFee.CommonsBudgetAddress), fee)
            .assignPayload(vote_data)
            .sign(sdk.OutputType.Payment);

        const res = await boa_client.sendTransaction(tx);
        assert.ok(res);
    });

    it("Test saving a vote data with `UTXOProvider`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        const key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );

        const vote_data = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.TxPayloadFee.getFee(vote_data.length);
        const tx_fee = sdk.JSBI.BigInt(0);

        const builder = new sdk.TxBuilder(key_pair);

        // Create UTXOProvider
        const utxo_provider = new sdk.UTXOProvider(key_pair.address, boa_client);
        // Get UTXO for the amount to need.
        const utxos = await utxo_provider.getUTXO(sdk.JSBI.add(sdk.JSBI.add(payload_fee, tx_fee), sdk.JSBI.BigInt(1)));
        utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.type, u.utxo, u.amount));

        const expected = {
            inputs: [
                {
                    utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                    unlock: {
                        bytes: "o9cyxNiqXwcDe8n69KeTxkWYIPWEUIWFhVT7oaRgEwo2afRhDm3TcmdIkya+fTQYcSdJvDpTw8/HOh/PmSmfhAE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
                    unlock: {
                        bytes: "kEpHAjZeUIMvknZ0aRldt3pASFPBO8Nar8O/vpIf/Q5quNVCgfMmWqm7TO2VlWkWrcoEbFVIhcJRyEh+iPxxFQE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                    unlock: {
                        bytes: "x4uwQbqaPz2devDeR36CPYa3l4Jrdd8M4ePZWC16nwcIrsq08zh9Lj1+CbqFmjtJmI62yF5okm8v4R9bAe7iigE=",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                {
                    type: 0,
                    value: "100000",
                    lock: {
                        type: 0,
                        bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
                    },
                },
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

        const res = await boa_client.sendTransaction(tx);
        assert.ok(res);
    });

    it("Test saving a vote data with `UTXOProvider` - There is no output", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        const key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );

        const vote_data = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.JSBI.BigInt(200000);
        const tx_fee = sdk.JSBI.BigInt(0);

        const builder = new sdk.TxBuilder(key_pair);

        // Create UTXOProvider
        const utxo_provider = new sdk.UTXOProvider(key_pair.address, boa_client);
        // Get UTXO for the amount to need.
        // There can't be any output. An error occurs because the constraint of
        // the transaction is not satisfied that it must have at least one output.
        const utxos = await utxo_provider.getUTXO(sdk.JSBI.add(payload_fee, tx_fee));
        utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.type, u.utxo, u.amount));

        assert.throws(() => {
            const tx = builder.assignPayload(vote_data).sign(sdk.OutputType.Payment, tx_fee, payload_fee);
        });
    });

    it("Test saving a vote data - There is at least one output", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        const key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );

        const vote_data = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.JSBI.BigInt(200000);
        const tx_fee = sdk.JSBI.BigInt(0);

        const builder = new sdk.TxBuilder(key_pair);

        // Create UTXOProvider
        const utxo_provider = new sdk.UTXOProvider(key_pair.address, boa_client);
        // Get UTXO for the amount to need.
        // The amount of the UTXO found is one greater than the fee, allowing at least one change output.
        const utxos = await utxo_provider.getUTXO(sdk.JSBI.add(sdk.JSBI.add(payload_fee, tx_fee), sdk.JSBI.BigInt(1)));
        utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.type, u.utxo, u.amount));

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

        const res = await boa_client.sendTransaction(tx);
        assert.ok(res);
    });

    it("Test calculating fees of the transaction", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());
        let fees = await boa_client.getTransactionFee(0);
        assert.strictEqual(fees.medium, "100000");
        assert.strictEqual(fees.low, "100000");
        assert.strictEqual(fees.high, "110000");

        fees = await boa_client.getTransactionFee(500);
        assert.strictEqual(fees.medium, "100000");
        assert.strictEqual(fees.low, "100000");
        assert.strictEqual(fees.high, "110000");

        fees = await boa_client.getTransactionFee(1_000);
        assert.strictEqual(fees.medium, "200000");
        assert.strictEqual(fees.low, "180000");
        assert.strictEqual(fees.high, "220000");

        fees = await boa_client.getTransactionFee(100_000);
        assert.strictEqual(fees.medium, "20000000");
        assert.strictEqual(fees.low, "18000000");
        assert.strictEqual(fees.high, "22000000");
    });

    it("Test applying accurate transaction fee", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        const key_pair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4")
        );

        const vote_data = Buffer.from("YXRhZCBldG92", "base64");
        const payload_fee = sdk.TxPayloadFee.getFeeAmount(vote_data.length);

        const builder = new sdk.TxBuilder(key_pair);

        // Create UTXOProvider
        const utxo_provider = new sdk.UTXOProvider(key_pair.address, boa_client);

        const output_address = "boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg";
        const output_count = 2;
        let estimated_tx_fee = sdk.Amount.make(
            sdk.Utils.FEE_RATE * sdk.Transaction.getEstimatedNumberOfBytes(0, output_count, vote_data.length)
        );

        const send_boa = sdk.Amount.make(200000);
        let total_fee = sdk.Amount.add(payload_fee, estimated_tx_fee);
        let total_send_amount = sdk.Amount.add(total_fee, send_boa);

        const in_utxos = await utxo_provider.getUTXO(
            total_send_amount,
            sdk.Amount.make(sdk.Utils.FEE_RATE * sdk.TxInput.getEstimatedNumberOfBytes())
        );
        in_utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.type, u.utxo, u.amount));
        estimated_tx_fee = sdk.Amount.make(
            sdk.Utils.FEE_RATE *
                sdk.Transaction.getEstimatedNumberOfBytes(in_utxos.length, output_count, vote_data.length)
        );

        // Build a transaction
        let tx = builder
            .addOutput(new sdk.PublicKey(output_address), send_boa)
            .assignPayload(vote_data)
            .sign(sdk.OutputType.Payment, estimated_tx_fee, payload_fee);

        // Get the size of the transaction
        let tx_size = tx.getNumberOfBytes();

        // Fees based on the transaction size is obtained from Stoa.
        let fees = await boa_client.getTransactionFee(tx_size);

        // Select medium
        let tx_fee = sdk.Amount.make(fees.medium);

        const sum_amount_utxo = in_utxos.reduce<sdk.Amount>(
            (sum, n) => sdk.Amount.add(sum, n.amount),
            sdk.Amount.make(0)
        );
        total_fee = sdk.Amount.add(payload_fee, tx_fee);
        total_send_amount = sdk.Amount.add(total_fee, send_boa);

        // If the value of LockType in UTXO is not a 'LockType.Key', the size may vary. The code below is for that.
        if (sdk.Amount.lessThan(sum_amount_utxo, total_send_amount)) {
            //  Add additional UTXO for the required amount.
            const additional = await utxo_provider.getUTXO(
                sdk.Amount.subtract(total_send_amount, sum_amount_utxo),
                sdk.Amount.make(sdk.Utils.FEE_RATE * sdk.TxInput.getEstimatedNumberOfBytes())
            );
            in_utxos.push(...additional);
            in_utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.type, u.utxo, u.amount));
            estimated_tx_fee = sdk.Amount.make(
                sdk.Utils.FEE_RATE *
                    sdk.Transaction.getEstimatedNumberOfBytes(in_utxos.length, output_count, vote_data.length)
            );

            // Build a transaction
            tx = builder
                .addOutput(new sdk.PublicKey(output_address), send_boa)
                .assignPayload(vote_data)
                .sign(sdk.OutputType.Payment, estimated_tx_fee, payload_fee);

            // Get the size of the transaction
            tx_size = tx.getNumberOfBytes();

            // Fees based on the transaction size is obtained from Stoa.
            fees = await boa_client.getTransactionFee(tx_size);

            // Select medium
            tx_fee = sdk.Amount.make(fees.medium);
        }

        in_utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.type, u.utxo, u.amount));
        tx = builder
            .addOutput(new sdk.PublicKey(output_address), send_boa)
            .assignPayload(vote_data)
            .sign(sdk.OutputType.Payment, tx_fee, payload_fee);

        const expected = {
            inputs: [
                {
                    utxo: "0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                    unlock: {
                        bytes: "EfG5NZSb0qACJaWgsO+VZhypnWnBByst+ZHWm2RcPACuNls51gpAWuuOhLslQTuTuWr3XknT7BsSE3MTDpJVwQE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x451a5b7929615121e0f2be759222853ea3acb45c94430a03de29a47db7c70e04eb4fce5b4a0c5af01d98331732546fede05fdfaf6ab429b3960aad6a20bbf0eb",
                    unlock: {
                        bytes: "ROpyConbX+i2PyOwhiQ+ONdlrOaUd5SugQc0zz7LLw5ynpSuommZLClJiE8daf9h6VK5wACVrrUKMFz+LteRQwE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
                    unlock: {
                        bytes: "XqgeBdfXWvSQicrmTWfVlHGqqiK/4e4W9P/BmP5kngwLQtxEClhv+0CkeSLDDhq7t/FyibDmL4X2sb1PkqAaDAE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xc3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314",
                    unlock: {
                        bytes: "yqB8Ng9Bh68cFW8I39Qyb/rcD0TtaWPTd0ir7cbWfQngEBCDZjzilJq8xLVcnQjsgOmYWBi3oj5DHh23Es7SNQE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xcfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2",
                    unlock: {
                        bytes: "bQwYUQsecfKMsfXvfG49vP5hr0ab5y3uds1EOFeJ2gG5qmx9sWIEnTdoehsMt3KMlVskPLQUhUIKmHZQlDQ6BwE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xd44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92",
                    unlock: {
                        bytes: "URLI/BDry0UMe/OasNR/YQ9S5C5A10POYfcuqE5ixAy8GQznZevOv1Pe5dG1EXqwu9XalgEZE6RObW4IG3kyBAE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                    unlock: {
                        bytes: "nm9Bc6oQakBC/GVifShU1l9faHSdtku8cB6xghoe8gdCSM5KlJVgqOL3pDCwI5KUJZB7pN3ZcM5WpHsXWTHl5wE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0xff05579da497ac482ccd2be1851e9ff1196314e97228a1fca62e6292b5e7ea91cadca41d6afe2d57048bf594c6dd73ab1f93e96717c73c128807905e7175beeb",
                    unlock: {
                        bytes: "dHj6nlJx4t/Q5q4b3Sow1axxVa78RanGs6FRlFPSzQ9mFXqulxFDrIQ64XDbEW3IrXzI5V7OOONXkHx765cWwgE=",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                {
                    type: 0,
                    value: "665800",
                    lock: {
                        type: 0,
                        bytes: "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE=",
                    },
                },
                {
                    type: 0,
                    value: "200000",
                    lock: {
                        type: 0,
                        bytes: "x60Co13nUDL3h+pKXCsG460FHRgDZWnJFfTYnch/tLg=",
                    },
                },
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
    });

    it("Test a function of the BOA Client - `getWalletTransactionsHistory`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const public_key = new sdk.PublicKey("boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9");
        const data = await boa_client.getWalletTransactionsHistory(public_key, 10, 1, ["inbound", "outbound"]);
        assert.deepStrictEqual(data, sample_txs_history_client);
    });

    it("Test a function of the BOA Client - `getWalletTransactionHistory`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const public_key = new sdk.PublicKey("boa1xrx66ezhd6uzx2s0plpgtwwmwmv4tfzvgp5sswqcg8z6m79s05pactt2yc9");
        const data = await boa_client.getWalletTransactionHistory(public_key, 10, 1, ["inbound", "outbound"]);
        assert.deepStrictEqual(data, sample_tx_history_client);
    });

    it("Test a function of the BOA Client - `getWalletTransactionOverview`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const tx_hash = new sdk.Hash(
            "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814"
        );
        const data = await boa_client.getWalletTransactionOverview(tx_hash);
        assert.deepStrictEqual(data, sample_tx_overview_client);
    });

    it("Test a function of the BOA Client - `getWalletTransactionDetail`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const tx_hash = new sdk.Hash(
            "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814"
        );
        const data = await boa_client.getWalletTransactionDetail(tx_hash);
        assert.deepStrictEqual(data, sample_tx_detail_client);
    });

    it("Test a function of the BOA Client - `getWalletTransactionsPending`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const public_key = new sdk.PublicKey("boa1xrzwvvw6l6d9k84ansqgs9yrtsetpv44wfn8zm9a7lehuej3ssskxth867s");
        const data = await boa_client.getWalletTransactionsPending(public_key);
        assert.deepStrictEqual(data, sample_txs_pending_client);
    });

    it("Test a function of the BOA Client - `getPendingTransaction`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        const tx_hash = sample_tx_hash_client;
        const tx = await boa_client.getPendingTransaction(tx_hash);
        assert.deepStrictEqual(tx, sdk.Transaction.reviver("", sample_tx_client));
    });

    it("Test a function of the BOA Client - `getTransaction`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        const tx_hash = sample_tx_hash_client;
        const tx = await boa_client.getTransaction(tx_hash);
        assert.deepStrictEqual(tx, sdk.Transaction.reviver("", sample_tx_client));
    });

    it("Get a voting fee", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Get Voting Fee
        const fee = await boa_client.getVotingFee(273);

        assert.deepStrictEqual(fee, sdk.JSBI.BigInt(29310880));
    });

    it("Verify the payment", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        const tx_hash = sample_tx_hash_client;
        const status = await boa_client.verifyPayment(tx_hash);

        const expected = {
            result: true,
            message: "Success",
        };
        assert.deepStrictEqual(status, expected);
    });

    it("Test a function of the BOA Client - `getUTXOInfo`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

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
        const utxos = await boa_client.getUTXOInfo(utxo_hash);
        assert.strictEqual(
            JSON.stringify(utxos),
            `[{"utxo":"0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0","type":1,"unlock_height":[1],"amount":"200000","height":[],"time":1577836800000,"lock_type":0,"lock_bytes":"wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE="},{"utxo":"0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85","type":0,"unlock_height":[2],"amount":"200000","height":[1],"time":1577837400000,"lock_type":0,"lock_bytes":"wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE="},{"utxo":"0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685","type":0,"unlock_height":[4],"amount":"200000","height":[3],"time":1577838600000,"lock_type":0,"lock_bytes":"wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE="}]`
        );
    });

    it("Test a function of the BOA Client - `getBalance`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        const balance = await boa_client.getBalance(public_key);
        assert.deepStrictEqual(balance.address, "boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");
        assert.deepStrictEqual(balance.balance, sdk.JSBI.BigInt(2000000));
        assert.deepStrictEqual(balance.spendable, sdk.JSBI.BigInt(1800000));
        assert.deepStrictEqual(balance.frozen, sdk.JSBI.BigInt(200000));
        assert.deepStrictEqual(balance.locked, sdk.JSBI.BigInt(0));
    });

    it("Test a function of the BOA Client - `getWalletUTXO`", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");

        // Request First UTXO
        const first_utxos = await boa_client.getWalletUTXOs(public_key, sdk.JSBI.BigInt(300000), 0);
        assert.deepStrictEqual(first_utxos.length, 2);
        assert.deepStrictEqual(first_utxos[0].utxo.toString(), sample_utxo_client[1].utxo);
        assert.deepStrictEqual(first_utxos[1].utxo.toString(), sample_utxo_client[2].utxo);

        // Request Second UTXO
        const second_utxos = await boa_client.getWalletUTXOs(
            public_key,
            sdk.JSBI.BigInt(300000),
            0,
            first_utxos[1].utxo
        );
        assert.deepStrictEqual(second_utxos.length, 2);
        assert.deepStrictEqual(second_utxos[0].utxo.toString(), sample_utxo_client[3].utxo);
        assert.deepStrictEqual(second_utxos[1].utxo.toString(), sample_utxo_client[4].utxo);

        // Request Frozen UTXO
        const third_utxos = await boa_client.getWalletUTXOs(public_key, sdk.JSBI.BigInt(300000), 1);
        assert.deepStrictEqual(third_utxos.length, 1);
        assert.deepStrictEqual(third_utxos[0].utxo.toString(), sample_utxo_client[0].utxo);
    });

    it("Test the UTXOProvider", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        // Query
        const public_key = new sdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0");

        const utxoProvider = new sdk.UTXOProvider(public_key, boa_client);
        // Request First UTXO
        const first_utxos = await utxoProvider.getUTXO(sdk.JSBI.BigInt(300000), sdk.JSBI.BigInt(100000));
        assert.deepStrictEqual(first_utxos.length, 3);
        assert.deepStrictEqual(first_utxos[0].utxo.toString(), sample_utxo_client[1].utxo);
        assert.deepStrictEqual(first_utxos[1].utxo.toString(), sample_utxo_client[2].utxo);
        assert.deepStrictEqual(first_utxos[2].utxo.toString(), sample_utxo_client[3].utxo);

        // Request Second UTXO
        const second_utxos = await utxoProvider.getUTXO(sdk.JSBI.BigInt(300000), sdk.JSBI.BigInt(100000));
        assert.deepStrictEqual(second_utxos.length, 3);
        assert.deepStrictEqual(second_utxos[0].utxo.toString(), sample_utxo_client[4].utxo);
        assert.deepStrictEqual(second_utxos[1].utxo.toString(), sample_utxo_client[5].utxo);
        assert.deepStrictEqual(second_utxos[2].utxo.toString(), sample_utxo_client[6].utxo);
    });

    it("test for getHeightToTime", async () => {
        // Set URL
        const stoa_uri = URI("http://localhost").port(stoa_port);
        const agora_uri = URI("http://localhost").port(agora_port);

        // Create BOA Client
        const boa_client = new sdk.BOAClient(stoa_uri.toString(), agora_uri.toString());

        const zero = 1609459200;

        let time_stamp = await boa_client.getHeightToTime(sdk.JSBI.BigInt(0));
        assert.deepStrictEqual(time_stamp, zero);

        time_stamp = await boa_client.getHeightToTime(sdk.JSBI.BigInt(1));
        assert.deepStrictEqual(time_stamp, zero + 1 * 60 * 10);

        time_stamp = await boa_client.getHeightToTime(sdk.JSBI.BigInt(10));
        assert.deepStrictEqual(time_stamp, zero + 10 * 60 * 10);

        time_stamp = await boa_client.getHeightToTime(sdk.JSBI.BigInt(11));
        assert.deepStrictEqual(time_stamp, zero + 11 * 60 * 10);
    });
});
