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
import * as sdk from "../../lib";
// @ts-ignore
import { sample_tx_hash_wallet, sample_tx_wallet, TestAgora, TestStoa } from "../Utils";

import * as assert from "assert";
import URI from "urijs";

describe("Wallet", () => {
    let stoa_server: TestStoa;
    let agora_server: TestAgora;
    const agora_port: string = "2310";
    const stoa_port: string = "5310";

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

    it("Test the Wallet - getBalance", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet.getBalance();
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);

        assert.deepStrictEqual(res.data.address, "boa1xza007gllhzdawnr727hds36guc0frnjsqscgf4k08zqesapcg3uujh9g93");
        assert.deepStrictEqual(res.data.balance, sdk.Amount.make(20000000000));
        assert.deepStrictEqual(res.data.spendable, sdk.Amount.make(18000000000));
        assert.deepStrictEqual(res.data.frozen, sdk.Amount.make(2000000000));
        assert.deepStrictEqual(res.data.locked, sdk.Amount.make(0));
    });

    it("Test the Wallet - transfer", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.BOA(10),
            },
        ]);

        const expected = {
            code: 0,
            message: "Success",
            data: {
                inputs: [
                    {
                        utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "ihKCEMuCl9PXfhrsUQMEmmXMEIW0exrKvx5PLg7o8Qg3oN+NMCIbW4mDpQVY/yWmegg8RYuODrceVgxnUDMgCw==",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1899900000",
                        lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
                    },
                    {
                        type: 0,
                        value: "100000000",
                        lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - transfer - Fail access to Agora", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: "http://localhost",
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.BOA(10),
            },
        ]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.FailedAccessToAgora);
        assert.ok(res.data === undefined);
    });

    it("Test the Wallet - transfer - Fail access to Stoa", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: "http://localhost",
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.BOA(10),
            },
        ]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.FailedAccessToStoa);
        assert.ok(res.data === undefined);
    });

    it("Test the Wallet - transfer - Not Enough Amount", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SDPVYLR53EAL2F4L3ACTBSZWVZU2WGAQFSABMMWC65M4GNXFQGMAQPAX")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet.transfer([
            {
                address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
                amount: sdk.BOA(10),
            },
        ]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.NotEnoughAmount);
        assert.ok(res.data === undefined);
    });

    it("Test the Wallet - transfer - Fail not exists any receiver", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet.transfer([]);

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.NotExistReceiver);
        assert.ok(res.data === undefined);
    });

    it("Test the Wallet - cancel", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const tx = sdk.Transaction.reviver("", sample_tx_wallet);

        const res = await wallet.cancel(tx, (address: sdk.PublicKey[]) => {
            return [keypair];
        });

        const expected = {
            code: 0,
            message: "Success",
            data: {
                inputs: [
                    {
                        utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "+x8n8fbcCdwGemBZs+6RqDAET89N71qQ8UmMUq56PQL/t+pAuKSNY4JqniWV8/Xecoz3UriDYK2rb+BrvUJERQE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1999903280",
                        lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };

        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - cancel with a transaction hash", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet.cancelWithHash(sample_tx_hash_wallet);

        const expected = {
            code: 0,
            message: "Success.",
            data: {
                inputs: [
                    {
                        utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "hGUZsCYoX3tOZEHNKwc42FRYSHN7Z3AZV8diNPIJzwl0PlpTCJgYXXQIYVZeeTEiaGpcjNItfOuoQv19h0yyUgE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "1999903280",
                        lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);

        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - freeze", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet.freeze({
            address: new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl"),
            amount: sdk.BOA(10),
        });

        const expected = {
            code: 0,
            message: "Success",
            data: {
                inputs: [
                    {
                        utxo: "0x0ca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8",
                        unlock: {
                            bytes: "03BOQLWy1Tob1q8GtkdBQXTsDb5wbC3NHTqBaXxAUgxuWDwyrXCwmcmIVksYXzw30v+C6pc27Tzga5mTwpVMqgE=",
                        },
                        unlock_age: 0,
                    },
                    {
                        utxo: "0x0f05579da497ac482ccd2be1851e9ff1196314e97228a1fca62e6292b5e7ea91cadca41d6afe2d57048bf594c6dd73ab1f93e96717c73c128807905e7175beeb",
                        unlock: {
                            bytes: "6K8DQoCL2Elec3Y5MNbIV3VEkZrrIz2OUbi/iXb92QIS/3l3Fyb/M49Qdwf1MzTqFDU9DO1odkJZmLyOhtcjbwE=",
                        },
                        unlock_age: 0,
                    },
                    {
                        utxo: "0x4451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85",
                        unlock: {
                            bytes: "dRYB7dYxX5hS86ChZgc7A7r+q64/RSU3QBpX6BNG/Aq5+IkWgYcBFgPMgdYwHXPfgyhGopXAcJzfxmUNaHy8AgE=",
                        },
                        unlock_age: 0,
                    },
                    {
                        utxo: "0x47e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b",
                        unlock: {
                            bytes: "Veo5lP2l+y9bzpbd7gHloV719EjP7h1lSnAVn4k1ugU7FvSZkxxALujNjQcypqA+EaJEcLwU6fi4EK8fnLPZMAE=",
                        },
                        unlock_age: 0,
                    },
                    {
                        utxo: "0x551a5b7929615121e0f2be759222853ea3acb45c94430a03de29a47db7c70e04eb4fce5b4a0c5af01d98331732546fede05fdfaf6ab429b3960aad6a20bbf0eb",
                        unlock: {
                            bytes: "42lGt5Dg4LAoP18bxlFy3qbspMEERnrk+7g4cpQSTw8a8cABw0rrn3tpeXAwUqyHG5RJ4MNvjJEp8oiC1x9TTwE=",
                        },
                        unlock_age: 0,
                    },
                    {
                        utxo: "0x8e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685",
                        unlock: {
                            bytes: "xt+FEo7zqjIIR5YxHFG5VGRuymXc8bOHQ/Hch6EY2A8x98GLycNi373GLDLmO6LBedsy838NUhJN9XFQhtKgWQE=",
                        },
                        unlock_age: 0,
                    },
                    {
                        utxo: "0x90959b83ee81cf2757eff613a0bcc35be9a9b6d3394e3c0255af4d68a43a6aeea1bfff1c5a84de5d54e1dd46436c18f6301bbfedae4168f632294c8f1d111ee3",
                        unlock: {
                            bytes: "VjrsEt7Cf7aRzoe2byDGhBEOnEI/xWixd9fdiMVbVgxtZ7tXwArI7bLiEhsZ4ll/VEE4+bl7roUiMtw6S2NUqQE=",
                        },
                        unlock_age: 0,
                    },
                    {
                        utxo: "0xd3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314",
                        unlock: {
                            bytes: "p5M1WUl3+1a7p+Aoza7w+Dq5X8baPQYN8FwlKRBb+AQ6V0IBQOtZ9K4rnh79+yy1RuIt3xroGRMdTURZEoYQpQE=",
                        },
                        unlock_age: 0,
                    },
                    {
                        utxo: "0xdfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2",
                        unlock: {
                            bytes: "hLtk3N6X9X9Qw62YQlIfvkD0wUzhQkJpJQbLeuAeSw1yzqsS4nKPOBxy3m3cQ7LlY2mBhjgxeu5TMjFIPLQOogE=",
                        },
                        unlock_age: 0,
                    },
                    {
                        utxo: "0xe44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92",
                        unlock: {
                            bytes: "nMSnaIi4WBYG6ySMhQJ0sKyt3q/161+0Nr0nopQasA5TfGB5fe534Hg59LeaiM+F0nP21eVKMt95Bp6K4QSkOwE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "17899714400",
                        lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
                    },
                    {
                        type: 1,
                        value: "100000000",
                        lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);

        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - unfreeze", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });

        const res = await wallet.unfreeze(
            [
                new sdk.Hash(
                    "0x7d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0"
                ),
            ],
            new sdk.PublicKey("boa1xrc00kar2yqa3jzve9cm4cvuaa8duazkuwrygmqgpcuf0gqww8ye7ua9lkl")
        );

        const expected = {
            code: 0,
            message: "Success.",
            data: {
                inputs: [
                    {
                        utxo: "0x7d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0",
                        unlock: {
                            bytes: "j+o6tOkLFYDak8cIDNx6OwtIeFNuSQjMLHhD9ooDLgBLvbtuDYFUgVQTC8lZ+pRwHVwL34qwF4IDSXMnjYKvRQE=",
                        },
                        unlock_age: 0,
                    },
                ],
                outputs: [
                    {
                        type: 0,
                        value: "101999900000",
                        lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                    },
                ],
                payload: "",
                lock_height: "0",
            },
        };
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);

        assert.deepStrictEqual(res.data.inputs[0].utxo.toString(), expected.data.inputs[0].utxo);
        assert.deepStrictEqual(JSON.stringify(res.data.outputs), JSON.stringify(expected.data.outputs));
    });

    it("Test the Wallet - getFrozenUTXOs", async () => {
        const keypair = sdk.KeyPair.fromSeed(
            new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")
        );

        const wallet = new sdk.Wallet(keypair, {
            endpoint: {
                agora: URI("http://localhost").port(agora_port).toString(),
                stoa: URI("http://localhost").port(stoa_port).toString(),
            },
            fee: sdk.WalletTransactionFeeOption.Medium,
        });
        const balance_res = await wallet.getBalance();
        assert.ok(balance_res.data !== undefined);

        const res = await wallet.getFrozenUTXOs(balance_res.data.frozen);
        assert.ok(res.data !== undefined);
        assert.deepStrictEqual(res.data.length, 1);
        assert.deepStrictEqual(
            res.data[0].utxo.toString(),
            "0x7d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0"
        );
        assert.deepStrictEqual(res.data[0].type, sdk.OutputType.Freeze);
    });
});
