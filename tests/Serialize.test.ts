/*******************************************************************************

    Test that serialize.

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
import { SmartBuffer } from "smart-buffer";

describe("Serialize and Deserialize", () => {
    let block: sdk.Block;
    let enrollment: sdk.Enrollment;
    const sample_block = {
        header: {
            prev_block:
                "0x2515b2650e0defbc2419976e5306c6d014eb593a5969b49db6cd6858fdc5841e1a1794dfd203b840dccd5d068d8dada155bdf2ae4ed5230e6fd9bd6b6cbe9397",
            height: "1",
            merkle_root:
                "0x7dd5f1e82923a6bda0244c8ab9c7ae7ceeb3bb222cb13ad566ae12f752aa7d4a76509e46817efd664d90bcaeaa4ea11f7eec3d5f4fc935f93cd2c700665ed1e4",
            validators: "111111",
            signature:
                "0x0d6ca70b2610115885596e3826542c2275030b21d76eeae0233ce0ed8e2a324f0a0050e3aa2e6c629b274c65d2f5f656ce04dc6323d13aec91dcccc288e316c0",
            enrollments: [],
            random_seed:
                "0x6fde7d23564897bec575279b2fb6e215d8da31325b272ef992551d54ad5fceccd45da6fc2a4624e06a79bb0cd316ca10406c28cb689319469ea33568d70e1e09",
            missing_validators: [],
            time_offset: 600,
        },
        txs: [
            {
                inputs: [
                    {
                        utxo: "0x62582cff703565f17911f438f7bd30ffb7ef7809e016a916fde1d617ba090d37de2e2e0d6b45f0a7f9a2773d5eadb93b390d5eab197ead5247d62a776dc92197",
                        unlock: {
                            bytes: "aZrVB8TRcXxbxXJ0suSneElI/ex2zZ1O557eyVzqkADwyA0pmgQfwOm71qBgbJOisv3riyYsBPWdbk/Sgry/yAE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "609999999875400",
                        lock: { type: 0, bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
            {
                inputs: [
                    {
                        utxo: "0x33650ce9f62244d45c61cab51f1b0a3fbf94190e8f8ea79bfe85a0852fea6368fc7747db593c719e4f16d29889cdd37196796a76ba78c5facf9eb31824144a69",
                        unlock: {
                            bytes: "LhniS1vnbRjbpFm190R1MgnU2G5zAyNK/3FBIYsHpAznhz7X/4LBHuOqEk2id73VxSHp1FzgGoy5+HxfYnH4VwE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "609999999875400",
                        lock: { type: 0, bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
            {
                inputs: [
                    {
                        utxo: "0xb9794167a781561298bcb0f634346c85e56fba3f26c641e52dbf0066e8fb0b96d278cdd4c22c7e9885fceb307368e4130aaebd7800905c27c6a6e09870d8d9ca",
                        unlock: {
                            bytes: "TAIUNebdeaII2Nqww5/C6iKFRQ+gTheFZfTyRulVsg0icSFgE9LfPGB75vK43i9sQx+0LPglgTlyQQpljTcSvAE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "609999999875400",
                        lock: { type: 0, bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
            {
                inputs: [
                    {
                        utxo: "0x5671ec730a0233c1cec76a59332755c3f59f0310d87acd02261f53c650692a2c8d113a0b0df8fede65ea52010df84f2d67bd166e44f1afe1149910e61bcfa79e",
                        unlock: {
                            bytes: "JpbP6sljiQUk8RpnggXSqOHi3eRVOSut9C+4T22UvADjXAymMcPp9g+J1tRWOfU6CaxajzO8Xe0wfcMxGbYQWAE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "609999999875400",
                        lock: { type: 0, bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
            {
                inputs: [
                    {
                        utxo: "0xfabfc442dd2d5a65b8a65d648eaeb5371f1db46f8a9e7e06c80d36f239469db728758ca466f6933fad7ecbd8153c680184caf2ece953cd02d8d816fabbfb13f5",
                        unlock: {
                            bytes: "fEYsYsZu+RkmqssmSHXYM5ouNMFZPVLlzE9VEbh/DAxeUQ9HWVSEZKDNP/7h9D1HCnu4qj/g5895wPIqoCD+5wE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "609999999875400",
                        lock: { type: 0, bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
            {
                inputs: [
                    {
                        utxo: "0x1791b08829791b6ba128e65ee7091c1f53abffd0750f587da8da05ddb9bf892adce542e27e65c3a1c5fd1bbc42736ce1cfc4b9f90e9b33418ab3af8b7c0a10db",
                        unlock: {
                            bytes: "8v1pcRO9RD7v488vn2TVfYfZwdmUdL+HN79/HsWYFgL7Qh9L06Iid/eNaCf2ScWWmYM3YcglKXTf/GvnF9YtBwE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "609999999875400",
                        lock: { type: 0, bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
            {
                inputs: [
                    {
                        utxo: "0x359ab01b4c15f7dffa257a042335321b2a576b61ccd379bf6922451dabbd688ab5818bd1cc22d61a09f11859a0368d82a73329de6614b440486172011472f346",
                        unlock: {
                            bytes: "JbdFzE8GYPH4ej1CAr2NCCZztczq38LIiqREOW8SkwA0AmhFDr+vBNjM0PiHe0utUbQaVWD7rkI3ZePCm4Z1hgE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "609999999875400",
                        lock: { type: 0, bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
            {
                inputs: [
                    {
                        utxo: "0x3c18b4e7c93987a7bf71c905c36dda39f7adc61d8f1a4ad919ef1960a97df9dec270581153756820541f662e619a49db3f35a7c8b9ec7607812dd5b03e2653b8",
                        unlock: {
                            bytes: "brbe69jMFguDr/QQyDThEZB7nzD4lq4D+X6KOL7WfgigWgwoUbO7WEtDt772mDtU/mhgEqIx3DpoT5H4zLW46gE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "609999999875400",
                        lock: { type: 0, bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        ],
        merkle_tree: [
            "0x117045fc27521fe1524ba7e0abaecc1eab56324c12482a6d09892e1f2b4fd06d50a4efef6e114ef1faf868c1fa5c0d40878e3e778472f7ec56d8549e7f0271a1",
            "0x34f84b38f15b4dbc0534ae3c2d737ebbe8594bf4f855155918b3e833b5b346071e99afe098e025eb11556775e2f199b6faca6c88d4b5d379e83ff9e57654a1b8",
            "0x4a26fc3d28dec1a363931a2036a39a712f37e0190e8b128ac4712bcdc3e567d23501c5f856b8eaab9bd423c366c133b5d04b6549c97d891d929b700a6911dc5c",
            "0x68c308aabcdb5a1608f3ad109050593a6f28a9a9c03fc7453b7042c879ab420026cd2d80651d7d50ec9403ee75181467d2868eac71a4e1abed6b7310d587927d",
            "0x779df6e944c04056925b2993594ffc9c705842c6162691a5d42d8c7449aee28e66b76f3a61203a7a1b43181645234154ee960cba302ce78eb78b236cb6a43f94",
            "0x78eae812fab542eadfc34b7e66371b94ea47cf9bcd8991b2d17052c16877c5ac44aa2ba9ef99d9addb0b1fbee4d1e267821d460cdaea37c804d78ee505e95b93",
            "0x7dd11c5ac9df8cdca142a8bffb52b3b3d4df6ef9a43ce06851e825f903dbc7dfe4e6588af816400d74c07db9c41287e30d5e1b750b5fcdd07820408a2d8737cd",
            "0xaf1ce3485d5014807635ffdcb6ccb69de2adfd1d5744cbaa3770475785f148ee679d8f5edc8759957a83cd00708b53888fc01834a6d8248e6c31e18054154b9a",
            "0x6210d91dd2ff16fc31f538e6126ffcbe788adced4493fd80649440305d8876c324016122c0cede69b438f5df8945f9de0b95899621ab62f16cad047d9053a686",
            "0x30e389236cfd2143a0a1df825a89e7f085dbce19fd7c2302b558271db197908d868013e26bae9885fe28b94e455dfa55e26738ee148bda0944f8161e6e5c8fc5",
            "0x4ee7a90b49cea373ecfb2aa6356c9fb2003eee99625cdc8103fa43a6d23d0d1569ab9a79594417b61d11c822ba7f2b373037da5c556336cc749b3d1c1ab3f860",
            "0xdd32d7b8159e63e37950c03ce94239871bf8f97e9c72e982d2d1d39010e995baeff7cf35dad1b14d767217b8706180e85e799caae093bc24888e6b559c5917e4",
            "0x848efa0fee626813b60466151c576dd20f64fd55dabd3714d11249b87a3f2f6acc2d7f66d6371020cff1c1a7ea59713760bff56da566ae18145295ef3ec670dd",
            "0xa74df1fe3e3cf5d0d4f63add50af8073c8aed22b6e7c8a33e7b06a117ac5c0951b28b8743f1345c1a13efa3ab3133d97524c0ac0fcd08cecc5c34882529ec8ee",
            "0x7dd5f1e82923a6bda0244c8ab9c7ae7ceeb3bb222cb13ad566ae12f752aa7d4a76509e46817efd664d90bcaeaa4ea11f7eec3d5f4fc935f93cd2c700665ed1e4",
        ],
    };

    const sample_enrollment = {
        utxo_key:
            "0x210f6551d648a4da654da116b100e941e434e4f232b8579439c2ef64b04819bd2782eb3524c7a29c38c347cdf26006bccac54a58a58f103ae7eb5b252eb53b64",
        commitment:
            "0xcfc5b09bc53136c1691e0991ffae7f2657bba248da07fb153ddf08a5109ce1c7d38206bfab6da57d70c428286d65081db992fbade6c67b97c62e9cb2862433e1",
        cycle_length: 20,
        enroll_sig:
            "0x018389f5876ebac77ad4c2269415bf8a5b14e2374e9d30a933f70a10abbca2a40e0122b707d1a0b305efcbca42d73e884987396248c66d329bca486a39735f8c",
    };

    before("Wait for the package libsodium to finish loading", () => {
        sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    before("Prepare test for serialize and deserialize", () => {
        block = sdk.Block.reviver("", sample_block);
        enrollment = sdk.Enrollment.reviver("", sample_enrollment);
    });

    it("Test that serialize and deserialize Unlock", () => {
        const buffer = new SmartBuffer();
        block.txs[0].inputs[0].unlock.serialize(buffer);
        assert.deepStrictEqual(
            buffer.toBuffer().toString("hex"),
            "41699ad507c4d1717c5bc57274b2e4a7784948fdec76cd9d4ee79edec95cea9000f0c80d299a041fc0e9bbd6a0606c93a2b2fdeb8b262c04f59d6e4fd282bcbfc801"
        );

        const deserialized = sdk.Unlock.deserialize(buffer);
        assert.deepStrictEqual(
            block.txs[0].inputs[0].unlock,
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize TxInput", () => {
        const buffer = new SmartBuffer();
        block.txs[0].inputs[0].serialize(buffer);
        assert.deepStrictEqual(
            buffer.toBuffer().toString("hex"),
            "9721c96d772ad64752ad7e19ab5e0d393bb9ad5e3d77a2f9a7f0456b0d2e2ede370d09ba17d6e1fd16a916e00978efb7ff30bdf738f41179f1653570ff2c586241699ad507c4d1717c5bc57274b2e4a7784948fdec76cd9d4ee79edec95cea9000f0c80d299a041fc0e9bbd6a0606c93a2b2fdeb8b262c04f59d6e4fd282bcbfc80100"
        );

        const deserialized = sdk.TxInput.deserialize(buffer);
        assert.deepStrictEqual(
            block.txs[0].inputs[0],
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize Lock", () => {
        const buffer = new SmartBuffer();
        block.txs[0].outputs[0].lock.serialize(buffer);
        assert.deepStrictEqual(
            buffer.toBuffer().toString("hex"),
            "00209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71"
        );

        const deserialized = sdk.Lock.deserialize(buffer);
        assert.deepStrictEqual(
            block.txs[0].outputs[0].lock,
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize TxOutput", () => {
        const buffer = new SmartBuffer();
        block.txs[0].outputs[0].serialize(buffer);
        assert.deepStrictEqual(
            buffer.toBuffer().toString("hex"),
            "0000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948"
        );

        const deserialized = sdk.TxOutput.deserialize(buffer);
        assert.deepStrictEqual(
            block.txs[0].outputs[0],
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize Transaction", () => {
        const buffer = new SmartBuffer();
        block.txs[0].serialize(buffer);
        assert.deepStrictEqual(
            buffer.toBuffer().toString("hex"),
            "019721c96d772ad64752ad7e19ab5e0d393bb9ad5e3d77a2f9a7f0456b0d2e2ede370d09ba17d6e1fd16a916e00978efb7ff30bdf738f41179f1653570ff2c586241699ad507c4d1717c5bc57274b2e4a7784948fdec76cd9d4ee79edec95cea9000f0c80d299a041fc0e9bbd6a0606c93a2b2fdeb8b262c04f59d6e4fd282bcbfc80100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e39480000"
        );

        const deserialized = sdk.Transaction.deserialize(buffer);
        assert.deepStrictEqual(
            block.txs[0],
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize Enrollment", () => {
        const buffer = new SmartBuffer();
        enrollment.serialize(buffer);
        assert.strictEqual(
            buffer.toBuffer().toString("hex"),
            "643bb52e255bebe73a108fa5584ac5cabc0660f2cd47c3389ca2c72435eb8227bd1948b064efc2399457b832f2e434e441e900b116a14d65daa448d651650f21e1332486b29c2ec6977bc6e6adfb92b91d08656d2828c4707da56dabbf0682d3c7e19c10a508df3d15fb07da48a2bb57267faeff91091e69c13631c59bb0c5cf14a4a2bcab100af733a9309d4e37e2145b8abf159426c2d47ac7ba6e87f58983018c5f73396a48ca9b326dc64862398749883ed742cacbef05b3a0d107b722010e"
        );

        const deserialized = sdk.Enrollment.deserialize(buffer);
        assert.deepStrictEqual(
            enrollment,
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize BitMask", () => {
        const buffer = new SmartBuffer();
        block.header.validators.serialize(buffer);
        assert.deepStrictEqual(buffer.toBuffer().toString("hex"), "06fc");

        const deserialized = sdk.BitMask.deserialize(buffer);
        assert.deepStrictEqual(
            block.header.validators,
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize Height", () => {
        const buffer = new SmartBuffer();
        block.header.height.serialize(buffer);
        assert.deepStrictEqual(buffer.toBuffer().toString("hex"), "01");

        const deserialized = sdk.Height.deserialize(buffer);
        assert.deepStrictEqual(
            block.header.height,
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize Signature", () => {
        const buffer = new SmartBuffer();
        block.header.signature.serialize(buffer);
        assert.deepStrictEqual(
            buffer.toBuffer().toString("hex"),
            "4f322a8eede03c23e0ea6ed7210b0375222c5426386e5985581110260ba76c0dc016e388c2ccdc91ec3ad12363dc04ce56f6f5d2654c279b626c2eaae350000a"
        );

        const deserialized = sdk.Signature.deserialize(buffer);
        assert.deepStrictEqual(
            block.header.signature,
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize BlockHeader", () => {
        const buffer = new SmartBuffer();
        block.header.serialize(buffer);
        assert.strictEqual(
            buffer.toBuffer().toString("hex"),
            "9793be6c6bbdd96f0e23d54eaef2bd55a1ad8d8d065dcddc40b803d2df94171a1e84c5fd5868cdb69db469593a59eb14d0c606536e971924bcef0d0e65b21525e4d15e6600c7d23cf935c94f5f3dec7e1fa14eaaaebc904d66fd7e81469e50764a7daa52f712ae66d53ab12c22bbb3ee7caec7b98a4c24a0bda62329e8f1d57d091e0ed76835a39e46199368cb286c4010ca16d30cbb796ae024462afca65dd4ccce5fad541d5592f92e275b3231dad815e2b62f9b2775c5be974856237dde6f4f322a8eede03c23e0ea6ed7210b0375222c5426386e5985581110260ba76c0dc016e388c2ccdc91ec3ad12363dc04ce56f6f5d2654c279b626c2eaae350000a06fc010000fd0258"
        );
        const deserialized = sdk.BlockHeader.deserialize(buffer);
        assert.deepStrictEqual(
            block.header,
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });

    it("Test that serialize and deserialize Block", () => {
        const buffer = new SmartBuffer();
        block.serialize(buffer);
        assert.strictEqual(
            buffer.toBuffer().toString("hex"),
            "9793be6c6bbdd96f0e23d54eaef2bd55a1ad8d8d065dcddc40b803d2df94171a1e84c5fd5868cdb69db469593a59eb14d0c606536e971924bcef0d0e65b21525e4d15e6600c7d23cf935c94f5f3dec7e1fa14eaaaebc904d66fd7e81469e50764a7daa52f712ae66d53ab12c22bbb3ee7caec7b98a4c24a0bda62329e8f1d57d091e0ed76835a39e46199368cb286c4010ca16d30cbb796ae024462afca65dd4ccce5fad541d5592f92e275b3231dad815e2b62f9b2775c5be974856237dde6f4f322a8eede03c23e0ea6ed7210b0375222c5426386e5985581110260ba76c0dc016e388c2ccdc91ec3ad12363dc04ce56f6f5d2654c279b626c2eaae350000a06fc010000fd025808019721c96d772ad64752ad7e19ab5e0d393bb9ad5e3d77a2f9a7f0456b0d2e2ede370d09ba17d6e1fd16a916e00978efb7ff30bdf738f41179f1653570ff2c586241699ad507c4d1717c5bc57274b2e4a7784948fdec76cd9d4ee79edec95cea9000f0c80d299a041fc0e9bbd6a0606c93a2b2fdeb8b262c04f59d6e4fd282bcbfc80100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001694a142418b39ecffac578ba766a799671d3cd8998d2164f9e713c59db4777fc6863ea2f85a085fe9ba78e8f0e1994bf3f0a1b1fb5ca615cd44422f6e90c6533412e19e24b5be76d18dba459b5f744753209d4d86e7303234aff7141218b07a40ce7873ed7ff82c11ee3aa124da277bdd5c521e9d45ce01a8cb9f87c5f6271f8570100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001cad9d87098e0a6c6275c900078bdae0a13e4687330ebfc85987e2cc2d4cd78d2960bfbe86600bf2de541c6263fba6fe5856c3434f6b0bc98125681a7674179b9414c021435e6dd79a208d8dab0c39fc2ea2285450fa04e178565f4f246e955b20d2271216013d2df3c607be6f2b8de2f6c431fb42cf825813972410a658d3712bc0100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e39480000019ea7cf1be6109914e1aff1446e16bd672d4ff80d0152ea65defef80d0b3a118d2c2a6950c6531f2602cd7ad810039ff5c3552733596ac7cec133020a73ec7156412696cfeac963890524f11a678205d2a8e1e2dde455392badf42fb84f6d94bc00e35c0ca631c3e9f60f89d6d45639f53a09ac5a8f33bc5ded307dc33119b610580100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001f513fbbbfa16d8d802cd53e9ecf2ca8401683c15d8cb7ead3f93f666a48c7528b79d4639f2360dc8067e9e8a6fb41d1f37b5ae8e645da6b8655a2ddd42c4bffa417c462c62c66ef91926aacb264875d8339a2e34c1593d52e5cc4f5511b87f0c0c5e510f4759548464a0cd3ffee1f43d470a7bb8aa3fe0e7cf79c0f22aa020fee70100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001db100a7c8bafb38a41339b0ef9b9c4cfe16c7342bc1bfdc5a1c3657ee242e5dc2a89bfb9dd05daa87d580f75d0ffab531f1c09e75ee628a16b1b792988b0911741f2fd697113bd443eefe3cf2f9f64d57d87d9c1d99474bf8737bf7f1ec5981602fb421f4bd3a22277f78d6827f649c59699833761c8252974dffc6be717d62d070100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e394800000146f372140172614840b41466de2933a7828d36a05918f1091ad622ccd18b81b58a68bdab1d452269bf79d3cc616b572a1b323523047a25fadff7154c1bb09a354125b745cc4f0660f1f87a3d4202bd8d082673b5cceadfc2c88aa444396f129300340268450ebfaf04d8ccd0f8877b4bad51b41a5560fbae423765e3c29b8675860100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001b853263eb0d52d810776ecb9c8a7353fdb499a612e661f5420687553115870c2def97da96019ef19d94a1a8f1dc6adf739da6dc305c971bfa78739c9e7b4183c416eb6deebd8cc160b83aff410c834e111907b9f30f896ae03f97e8a38bed67e08a05a0c2851b3bb584b43b7bef6983b54fe686012a231dc3a684f91f8ccb5b8ea0100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e394800000fa171027f9e54d856ecf77284773e8e87400d5cfac168f8faf14e116eefefa4506dd04f2b1f2e89096d2a48124c3256ab1eccaeabe0a74b52e11f5227fc457011b8a15476e5f93fe879d3b5d4886ccafab699f1e275675511eb25e098e0af991e0746b3b533e8b318591555f8f44b59e8bb7e732d3cae3405bc4d5bf1384bf8345cdc11690a709b921d897dc949654bd0b533c166c323d49babeab856f8c50135d267e5c3cd2b71c48a128b0e19e0372f719aa336201a9363a3c1de283dfc264a7d9287d510736bedabe1a471ac8e86d267141875ee0394ec507d1d65802dcd260042ab79c842703b45c73fc0a9a9286f3a59509010adf308165adbbcaa08c368943fa4b66c238bb78ee72c30ba0c96ee544123451618431b7a3a20613a6fb7668ee2ae49748c2dd4a5912616c64258709cfc4f5993295b925640c044e9f69d77935be905e58ed704c837eada0c461d8267e2d1e4be1f0bdbadd999efa92baa44acc57768c15270d1b29189cd9bcf47ea941b37667e4bc3dfea42b5fa12e8ea78cd37872d8a402078d0cd5f0b751b5e0de38712c4b97dc0740d4016f88a58e6e4dfc7db03f925e85168e03ca4f96edfd4b3b352fbbfa842a1dc8cdfc95a1cd17d9a4b155480e1316c8e24d8a63418c08f88538b7000cd837a955987dc5e8f9d67ee48f18557477037aacb44571dfdade29db6ccb6dcff35768014505d48e31caf86a653907d04ad6cf162ab219689950bdef94589dff538b469decec022610124c376885d3040946480fd9344eddc8a78befc6f12e638f531fc16ffd21dd91062c58f5c6e1e16f84409da8b14ee3867e255fa5d454eb928fe8598ae6be21380868d9097b11d2758b502237cfd19cedb85f0e7895a82dfa1a04321fd6c2389e33060f8b31a1c3d9b74cc3663555cda3730372b7fba22c8111db6174459799aab69150d3dd2a643fa0381dc5c6299ee3e00b29f6c35a62afbec73a3ce490ba9e74ee417599c556b8e8824bc93e0aa9c795ee8806170b81772764db1d1da35cff7efba95e91090d3d1d282e9729c7ef9f81b873942e93cc05079e3639e15b8d732dddd70c63eef95521418ae66a56df5bf60377159eaa7c1f1cf201037d6667f2dcc6a2f3f7ab84912d11437bdda55fd640fd26d571c156604b6136862ee0ffa8e84eec89e528248c3c5ec8cd0fcc00a4c52973d13b33afa3ea1c145133f74b8281b95c0c57a116ab0e7338a7c6e2bd2aec87380af50dd3af6d4d0f53c3efef14da7e4d15e6600c7d23cf935c94f5f3dec7e1fa14eaaaebc904d66fd7e81469e50764a7daa52f712ae66d53ab12c22bbb3ee7caec7b98a4c24a0bda62329e8f1d57d"
        );

        const deserialized = sdk.Block.deserialize(buffer);
        assert.deepStrictEqual(
            block,
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });
});
