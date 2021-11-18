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
                "0x6db06ab1cae5c4b05e806401e2c42d526ebf4ac81411d0fcd82344561b5a25ae0d29728f5c1c9bec6cf254f621c183be71858a6ed5339c06fc5b34d7881b9b23",
            merkle_root:
                "0x7dd5f1e82923a6bda0244c8ab9c7ae7ceeb3bb222cb13ad566ae12f752aa7d4a76509e46817efd664d90bcaeaa4ea11f7eec3d5f4fc935f93cd2c700665ed1e4",
            signature:
                "0x281455444da07c9331d32b8104e3587de80ee5fd016a1f387764c13fec9460fd0973cfbb1339caa180932d91df3cb04113eb4e2ca11b1f70fd4807809f3c526a",
            validators: "111111",
            height: "1",
            preimages: [
                "0xe99832a1469beb4830f2faf3a6b8da5d027afe6f3f80098d89c4e6d22b8a22b1074b493041c124c86333891f5c62df8bd2bb0b6a493b6ea0ed276ad03db59b3f",
                "0x4afa2116ac0cd18bcca6234d801f5ee26f71499d49e415b227dd31772b691ac10a9d3df956c6f651c6e9b6a5bba2586ed3f17e5ecdcaa2cfd4475d69a1b4b699",
                "0x31a2bbfd9f848ed3b2d8c7232dab19415e95598550a4f2ba007127b320f4d1483264fd2c7b28e975bed7df47cec82d2cb2ef6ee2edfed59b22e342770566e601",
                "0x62c3fe6222b6bed5c5948f9328d46a7b7f4563a3fa485a332f832d0e4cae96a6d55ccf23b347b5f6c964e1888e47320c22a56080e56b6bd951ad8e3213056572",
                "0x58a468b0702d9188f7bf82a181d7ae8e32d968dbe1b09ece2d5e910e3724d81a99103f17b5646d0fc9e5cdaa5ec4132407c9fb39e07b21d119b353da27d69659",
                "0x2787959876b76c70776569a64711b1794467b20a4f6d2f426840d4d56200835fe814196736596b6fc9a79818238156a5661496d6601498d806c7988c9d4182ae",
            ],
            enrollments: [],
        },
        txs: [
            {
                inputs: [
                    {
                        utxo: "0x62582cff703565f17911f438f7bd30ffb7ef7809e016a916fde1d617ba090d37de2e2e0d6b45f0a7f9a2773d5eadb93b390d5eab197ead5247d62a776dc92197",
                        unlock: {
                            bytes: "GkNB1HXmBCT8Gvllw7oZQ5znVrzBMG7RUdgR75TmKA1SRnw4tTlYs+/bxfsO+t9BRDKxo0G/kXd1xMk0Owyg5gE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        lock: {
                            type: 0,
                            bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                        },
                        value: "609999999875400",
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
                            bytes: "tXxfVlXeq/ty1eg/txpumPQ/MqFVUyc6HGNtRAbLtAwij0vBdB2DW07m3TI6jHb8apZRGUTf+HuPH9W0KERwywE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        lock: {
                            type: 0,
                            bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                        },
                        value: "609999999875400",
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
                            bytes: "p/DNhPblxyxM3UZLei+Gou6w/41KnV896F2ReIn5VAQSOikiWTMsdrIT0p+awIy3QmbiVhnpnbdlc5B4zwquAgE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        lock: {
                            type: 0,
                            bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                        },
                        value: "609999999875400",
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
                            bytes: "QHoavQEIDYi//7u4dSHajCRhM1w345/U97Stl3MHjA5CY5cYPLHkkIIUcVOyq23f8xfLW5rHWccFl1fxngtctwE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        lock: {
                            type: 0,
                            bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                        },
                        value: "609999999875400",
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
                            bytes: "4cIE0Luv7qculiFbrKSPFb1eLk8tFje6NqOdEXOvWgFDmeLWqXhnpezoPX88YXgJgvpwBp02cCK4o1lE2mfhVQE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        lock: {
                            type: 0,
                            bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                        },
                        value: "609999999875400",
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
                            bytes: "aTfpxVLlp+knQ1Ny6cIsOhjMfh8QCw9vnBV36Zfh2A02b4BDajWn1slpmLu6QYITIzrIvtTRBXQtkpNr0e6EIwE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        lock: {
                            type: 0,
                            bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                        },
                        value: "609999999875400",
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
                            bytes: "G4BPsh4X52qjKlfncf33JEhNUb4xM12qdke0BoYRwwzmSo8MYwAPNNChR4NoadVhBemmN0Ux/E1Yp48ZMyzF0gE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        lock: {
                            type: 0,
                            bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                        },
                        value: "609999999875400",
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
                            bytes: "jn8av7eobFlhbGf5bXZVubFL26SLvrTt5rtp6qikngK0+Zgg7PRZxPR7aKFGRMt7RIuN664HMbJlNfYEO+orpwE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        lock: {
                            type: 0,
                            bytes: "kZnmFMJObP4+SLxUChUrKaFP/7ek7wIYk79A66URrHE=",
                        },
                        value: "609999999875400",
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
        enroll_sig:
            "0x018389f5876ebac77ad4c2269415bf8a5b14e2374e9d30a933f70a10abbca2a40e0122b707d1a0b305efcbca42d73e884987396248c66d329bca486a39735f8c",
    };

    before("Wait for the package libsodium to finish loading", () => {
        if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
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
            "411a4341d475e60424fc1af965c3ba19439ce756bcc1306ed151d811ef94e6280d52467c38b53958b3efdbc5fb0efadf414432b1a341bf917775c4c9343b0ca0e601"
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
            "9721c96d772ad64752ad7e19ab5e0d393bb9ad5e3d77a2f9a7f0456b0d2e2ede370d09ba17d6e1fd16a916e00978efb7ff30bdf738f41179f1653570ff2c5862411a4341d475e60424fc1af965c3ba19439ce756bcc1306ed151d811ef94e6280d52467c38b53958b3efdbc5fb0efadf414432b1a341bf917775c4c9343b0ca0e60100"
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
            "019721c96d772ad64752ad7e19ab5e0d393bb9ad5e3d77a2f9a7f0456b0d2e2ede370d09ba17d6e1fd16a916e00978efb7ff30bdf738f41179f1653570ff2c5862411a4341d475e60424fc1af965c3ba19439ce756bcc1306ed151d811ef94e6280d52467c38b53958b3efdbc5fb0efadf414432b1a341bf917775c4c9343b0ca0e60100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e39480000"
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
            "643bb52e255bebe73a108fa5584ac5cabc0660f2cd47c3389ca2c72435eb8227bd1948b064efc2399457b832f2e434e441e900b116a14d65daa448d651650f21e1332486b29c2ec6977bc6e6adfb92b91d08656d2828c4707da56dabbf0682d3c7e19c10a508df3d15fb07da48a2bb57267faeff91091e69c13631c59bb0c5cfa4a2bcab100af733a9309d4e37e2145b8abf159426c2d47ac7ba6e87f58983018c5f73396a48ca9b326dc64862398749883ed742cacbef05b3a0d107b722010e"
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
            "fd6094ec3fc16477381f6a01fde50ee87d58e304812bd331937ca04d445514286a523c9f800748fd701f1ba12c4eeb1341b03cdf912d9380a1ca3913bbcf7309"
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
            "239b1b88d7345bfc069c33d56e8a8571be83c121f654f26cec9b1c5c8f72290dae255a1b564423d8fcd01114c84abf6e522dc4e20164805eb0c4e5cab16ab06de4d15e6600c7d23cf935c94f5f3dec7e1fa14eaaaebc904d66fd7e81469e50764a7daa52f712ae66d53ab12c22bbb3ee7caec7b98a4c24a0bda62329e8f1d57dfd6094ec3fc16477381f6a01fde50ee87d58e304812bd331937ca04d445514286a523c9f800748fd701f1ba12c4eeb1341b03cdf912d9380a1ca3913bbcf730906fc01063f9bb53dd06a27eda06e3b496a0bbbd28bdf625c1f893363c824c14130494b07b1228a2bd2e6c4898d09803f6ffe7a025ddab8a6f3faf23048eb9b46a13298e999b6b4a1695d47d4cfa2cacd5e7ef1d36e58a2bba5b6e9c651f6c656f93d9d0ac11a692b7731dd27b215e4499d49716fe25e1f804d23a6cc8bd10cac1621fa4a01e666057742e3229bd5feede26eefb22c2dc8ce47dfd7be75e9287b2cfd643248d1f420b3277100baf2a4508559955e4119ab2d23c7d8b2d38e849ffdbba23172650513328ead51d96b6be58060a5220c32478e88e164c9f6b547b323cf5cd5a696ae4c0e2d832f335a48faa363457f7b6ad428938f94c5d5beb62262fec3625996d627da53b319d1217be039fbc9072413c45eaacde5c90f6d64b5173f10991ad824370e915e2dce9eb0e1db68d9328eaed781a182bff788912d70b068a458ae82419d8c98c706d8981460d6961466a55681231898a7c96f6b5936671914e85f830062d5d44068422f6d4f0ab2674479b11147a6696577706cb7769895872700"
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
            "239b1b88d7345bfc069c33d56e8a8571be83c121f654f26cec9b1c5c8f72290dae255a1b564423d8fcd01114c84abf6e522dc4e20164805eb0c4e5cab16ab06de4d15e6600c7d23cf935c94f5f3dec7e1fa14eaaaebc904d66fd7e81469e50764a7daa52f712ae66d53ab12c22bbb3ee7caec7b98a4c24a0bda62329e8f1d57dfd6094ec3fc16477381f6a01fde50ee87d58e304812bd331937ca04d445514286a523c9f800748fd701f1ba12c4eeb1341b03cdf912d9380a1ca3913bbcf730906fc01063f9bb53dd06a27eda06e3b496a0bbbd28bdf625c1f893363c824c14130494b07b1228a2bd2e6c4898d09803f6ffe7a025ddab8a6f3faf23048eb9b46a13298e999b6b4a1695d47d4cfa2cacd5e7ef1d36e58a2bba5b6e9c651f6c656f93d9d0ac11a692b7731dd27b215e4499d49716fe25e1f804d23a6cc8bd10cac1621fa4a01e666057742e3229bd5feede26eefb22c2dc8ce47dfd7be75e9287b2cfd643248d1f420b3277100baf2a4508559955e4119ab2d23c7d8b2d38e849ffdbba23172650513328ead51d96b6be58060a5220c32478e88e164c9f6b547b323cf5cd5a696ae4c0e2d832f335a48faa363457f7b6ad428938f94c5d5beb62262fec3625996d627da53b319d1217be039fbc9072413c45eaacde5c90f6d64b5173f10991ad824370e915e2dce9eb0e1db68d9328eaed781a182bff788912d70b068a458ae82419d8c98c706d8981460d6961466a55681231898a7c96f6b5936671914e85f830062d5d44068422f6d4f0ab2674479b11147a6696577706cb776989587270008019721c96d772ad64752ad7e19ab5e0d393bb9ad5e3d77a2f9a7f0456b0d2e2ede370d09ba17d6e1fd16a916e00978efb7ff30bdf738f41179f1653570ff2c5862411a4341d475e60424fc1af965c3ba19439ce756bcc1306ed151d811ef94e6280d52467c38b53958b3efdbc5fb0efadf414432b1a341bf917775c4c9343b0ca0e60100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001694a142418b39ecffac578ba766a799671d3cd8998d2164f9e713c59db4777fc6863ea2f85a085fe9ba78e8f0e1994bf3f0a1b1fb5ca615cd44422f6e90c653341b57c5f5655deabfb72d5e83fb71a6e98f43f32a15553273a1c636d4406cbb40c228f4bc1741d835b4ee6dd323a8c76fc6a96511944dff87b8f1fd5b4284470cb0100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001cad9d87098e0a6c6275c900078bdae0a13e4687330ebfc85987e2cc2d4cd78d2960bfbe86600bf2de541c6263fba6fe5856c3434f6b0bc98125681a7674179b941a7f0cd84f6e5c72c4cdd464b7a2f86a2eeb0ff8d4a9d5f3de85d917889f95404123a292259332c76b213d29f9ac08cb74266e25619e99db765739078cf0aae020100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e39480000019ea7cf1be6109914e1aff1446e16bd672d4ff80d0152ea65defef80d0b3a118d2c2a6950c6531f2602cd7ad810039ff5c3552733596ac7cec133020a73ec715641407a1abd01080d88bfffbbb87521da8c2461335c37e39fd4f7b4ad9773078c0e426397183cb1e49082147153b2ab6ddff317cb5b9ac759c7059757f19e0b5cb70100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001f513fbbbfa16d8d802cd53e9ecf2ca8401683c15d8cb7ead3f93f666a48c7528b79d4639f2360dc8067e9e8a6fb41d1f37b5ae8e645da6b8655a2ddd42c4bffa41e1c204d0bbafeea72e96215baca48f15bd5e2e4f2d1637ba36a39d1173af5a014399e2d6a97867a5ece83d7f3c61780982fa70069d367022b8a35944da67e1550100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001db100a7c8bafb38a41339b0ef9b9c4cfe16c7342bc1bfdc5a1c3657ee242e5dc2a89bfb9dd05daa87d580f75d0ffab531f1c09e75ee628a16b1b792988b09117416937e9c552e5a7e927435372e9c22c3a18cc7e1f100b0f6f9c1577e997e1d80d366f80436a35a7d6c96998bbba418213233ac8bed4d105742d92936bd1ee84230100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e394800000146f372140172614840b41466de2933a7828d36a05918f1091ad622ccd18b81b58a68bdab1d452269bf79d3cc616b572a1b323523047a25fadff7154c1bb09a35411b804fb21e17e76aa32a57e771fdf724484d51be31335daa7647b4068611c30ce64a8f0c63000f34d0a147836869d56105e9a6374531fc4d58a78f19332cc5d20100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e3948000001b853263eb0d52d810776ecb9c8a7353fdb499a612e661f5420687553115870c2def97da96019ef19d94a1a8f1dc6adf739da6dc305c971bfa78739c9e7b4183c418e7f1abfb7a86c59616c67f96d7655b9b14bdba48bbeb4ede6bb69eaa8a49e02b4f99820ecf459c4f47b68a14644cb7b448b8debae0731b26535f6043bea2ba70100010000000000209199e614c24e6cfe3e48bc540a152b29a14fffb7a4ef021893bf40eba511ac71ff00022acab14e394800000fa171027f9e54d856ecf77284773e8e87400d5cfac168f8faf14e116eefefa4506dd04f2b1f2e89096d2a48124c3256ab1eccaeabe0a74b52e11f5227fc457011b8a15476e5f93fe879d3b5d4886ccafab699f1e275675511eb25e098e0af991e0746b3b533e8b318591555f8f44b59e8bb7e732d3cae3405bc4d5bf1384bf8345cdc11690a709b921d897dc949654bd0b533c166c323d49babeab856f8c50135d267e5c3cd2b71c48a128b0e19e0372f719aa336201a9363a3c1de283dfc264a7d9287d510736bedabe1a471ac8e86d267141875ee0394ec507d1d65802dcd260042ab79c842703b45c73fc0a9a9286f3a59509010adf308165adbbcaa08c368943fa4b66c238bb78ee72c30ba0c96ee544123451618431b7a3a20613a6fb7668ee2ae49748c2dd4a5912616c64258709cfc4f5993295b925640c044e9f69d77935be905e58ed704c837eada0c461d8267e2d1e4be1f0bdbadd999efa92baa44acc57768c15270d1b29189cd9bcf47ea941b37667e4bc3dfea42b5fa12e8ea78cd37872d8a402078d0cd5f0b751b5e0de38712c4b97dc0740d4016f88a58e6e4dfc7db03f925e85168e03ca4f96edfd4b3b352fbbfa842a1dc8cdfc95a1cd17d9a4b155480e1316c8e24d8a63418c08f88538b7000cd837a955987dc5e8f9d67ee48f18557477037aacb44571dfdade29db6ccb6dcff35768014505d48e31caf86a653907d04ad6cf162ab219689950bdef94589dff538b469decec022610124c376885d3040946480fd9344eddc8a78befc6f12e638f531fc16ffd21dd91062c58f5c6e1e16f84409da8b14ee3867e255fa5d454eb928fe8598ae6be21380868d9097b11d2758b502237cfd19cedb85f0e7895a82dfa1a04321fd6c2389e33060f8b31a1c3d9b74cc3663555cda3730372b7fba22c8111db6174459799aab69150d3dd2a643fa0381dc5c6299ee3e00b29f6c35a62afbec73a3ce490ba9e74ee417599c556b8e8824bc93e0aa9c795ee8806170b81772764db1d1da35cff7efba95e91090d3d1d282e9729c7ef9f81b873942e93cc05079e3639e15b8d732dddd70c63eef95521418ae66a56df5bf60377159eaa7c1f1cf201037d6667f2dcc6a2f3f7ab84912d11437bdda55fd640fd26d571c156604b6136862ee0ffa8e84eec89e528248c3c5ec8cd0fcc00a4c52973d13b33afa3ea1c145133f74b8281b95c0c57a116ab0e7338a7c6e2bd2aec87380af50dd3af6d4d0f53c3efef14da7e4d15e6600c7d23cf935c94f5f3dec7e1fa14eaaaebc904d66fd7e81469e50764a7daa52f712ae66d53ab12c22bbb3ee7caec7b98a4c24a0bda62329e8f1d57d"
        );

        const deserialized = sdk.Block.deserialize(buffer);
        assert.deepStrictEqual(
            block,
            deserialized,
            "When serialize, then deserialize, it does not match the original."
        );
    });
});
