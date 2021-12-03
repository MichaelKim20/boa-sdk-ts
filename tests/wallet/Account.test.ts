/*******************************************************************************

    Test of AccountContainer

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
// @ts-ignore
import * as sdk from "../../lib";

// @ts-ignore
import { sample_address_multi_account, sample_secret_multi_account, TestAgora, TestStoa } from "../Utils";

import * as assert from "assert";
import URI from "urijs";

describe("AccountContainer", () => {
    let agora_server: TestAgora;
    let stoa_server: TestStoa;
    const agora_port: string = "2210";
    const stoa_port: string = "5210";

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

    it("Test Account", async () => {
        const seed1 = `SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI`;
        const kp1 = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed1));
        const seed2 = `SDNGO67J7UKBZ2TZIGOZNPMTGZXEJUWPYMTJK4FX3GBDVZNNXVVAW3WR`;
        const kp2 = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed2));

        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const temp = new sdk.AccountContainer(new sdk.WalletClient(endpoint));
        const account1 = new sdk.Account(temp, "My Account", kp1.address);
        assert.strictEqual(account1.name, "My Account");
        assert.strictEqual(account1.address.toString(), kp1.address.toString());
        assert.strictEqual(account1.secret, undefined);
        assert.strictEqual(account1.mode, sdk.AccountMode.READ_ONLY);

        assert.strictEqual(account1.setSecret(kp2.secret), false);
        assert.strictEqual(account1.mode, sdk.AccountMode.READ_ONLY);

        assert.strictEqual(account1.setSecret(kp1.secret), true);
        assert.strictEqual(account1.mode, sdk.AccountMode.SUDO);

        const account2 = new sdk.Account(temp, "My Account", kp1.secret);
        assert.strictEqual(account2.address.toString(), kp1.address.toString());
        assert.strictEqual(account2.secret?.toString(true), kp1.secret.toString());
        assert.strictEqual(account2.mode, sdk.AccountMode.SUDO);
    });

    it("Test AccountContainer", async () => {
        const seeds = [
            "SDLFMXEPWO5BNB64TUZQJP5JJUET2P4QFMTMDSPYELC2LZ6UXMSAOIKE",
            "SDLAFDIR6HVSP6AAAY5MH2MGAWZ24EGCHILI4GPAU2BETGNMTFYQKQ6V",
            "SCTP4PL5V635752FTC546RBNFBRZIWXL3QI34ZRNMY4C2PERCVRQJQYX",
            "SBTQUF4TQPRE5GKU3A6EICN35BZPSYNNYEYYZ2GNMNY76XQ7ILQALTKP",
            "SATBAW3HLRCRWA3LJIHFADM5RVWY4RDDG6ZNEXDNSDGC2MD3MBMQLUS5",
            "SCXE6LI5SNOSHAGD7K5LJD4GODHEHOQ7JFKHJZSEHBLVPJ4Q2MSQGTFL",
        ];
        const kps = seeds.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(endpoint));

        accounts.add("Account1", kps[0].secret);
        accounts.add("Account2", kps[1].secret);
        accounts.add("Account3", kps[2].secret);
        accounts.add("Account4", kps[3].address);
        accounts.add("Account5", kps[4].address);

        assert.strictEqual(accounts.length, 5);
        assert.strictEqual(accounts.sudo_length, 3);
        assert.strictEqual(accounts.sudo_accounts.length, 3);
        assert.strictEqual(accounts.readonly_accounts.length, 2);

        assert.strictEqual(accounts.add("Account1", kps[5].address), undefined);
        assert.strictEqual(accounts.length, 5);

        assert.strictEqual(accounts.add("Account6", kps[2].secret), undefined);
        assert.strictEqual(accounts.length, 5);

        assert.strictEqual(accounts.add("Account6", kps[4].address), undefined);
        assert.strictEqual(accounts.length, 5);

        assert.strictEqual(accounts.add("Account6", kps[4].secret), undefined);
        assert.strictEqual(accounts.length, 5);

        assert.deepStrictEqual(accounts.find("Account1"), accounts.items[0]);
        assert.deepStrictEqual(accounts.find("Account8"), undefined);
        assert.deepStrictEqual(accounts.find(kps[2].address.toString()), accounts.items[2]);
        assert.deepStrictEqual(accounts.find(kps[2].secret.toString(false)), accounts.items[2]);
        assert.deepStrictEqual(accounts.find(kps[3].secret.toString(false)), accounts.items[3]);

        const acc = accounts.items[0];
        assert.deepStrictEqual(accounts.remove("Account1"), acc);
        assert.deepStrictEqual(accounts.remove("Account9"), undefined);

        accounts.clear();
        assert.strictEqual(accounts.length, 0);
    });

    it("Test AccountContainer find", async () => {
        const seeds = [
            "SDLFMXEPWO5BNB64TUZQJP5JJUET2P4QFMTMDSPYELC2LZ6UXMSAOIKE",
            "SDLAFDIR6HVSP6AAAY5MH2MGAWZ24EGCHILI4GPAU2BETGNMTFYQKQ6V",
            "SCTP4PL5V635752FTC546RBNFBRZIWXL3QI34ZRNMY4C2PERCVRQJQYX",
            "SBTQUF4TQPRE5GKU3A6EICN35BZPSYNNYEYYZ2GNMNY76XQ7ILQALTKP",
            "SATBAW3HLRCRWA3LJIHFADM5RVWY4RDDG6ZNEXDNSDGC2MD3MBMQLUS5",
            "SCXE6LI5SNOSHAGD7K5LJD4GODHEHOQ7JFKHJZSEHBLVPJ4Q2MSQGTFL",
        ];
        const kps = seeds.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(endpoint));

        accounts.add("Account0", kps[0].secret);
        accounts.add("Account1", kps[1].secret);
        accounts.add("Account2", kps[2].secret);
        accounts.add("Account3", kps[3].address);
        accounts.add("Account4", kps[4].secret);

        let acc = accounts.findByName("Account4");
        assert.ok(acc !== undefined);
        assert.deepStrictEqual(acc.secret, kps[4].secret);

        acc = accounts.findByPublicKey(kps[0].address);
        assert.ok(acc !== undefined);
        assert.deepStrictEqual(acc.secret, kps[0].secret);

        acc = accounts.findByPublicKey(kps[3].address);
        assert.ok(acc !== undefined);
        assert.deepStrictEqual(acc.address, kps[3].address);

        acc = accounts.findBySecretKey(kps[3].secret);
        assert.ok(acc !== undefined);
        assert.deepStrictEqual(acc.address, kps[3].address);

        acc = accounts.findBySecretKey(kps[2].secret);
        assert.ok(acc !== undefined);
        assert.deepStrictEqual(acc.secret, kps[2].secret);
    });

    it("Test AccountContainer - Balance", (done) => {
        const kps = sample_secret_multi_account.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(endpoint));

        kps.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });
        assert.strictEqual(accounts.length, kps.length);
        accounts.checkBalance();
        setTimeout(() => {
            assert.deepStrictEqual(accounts.items[0].balance.balance, sdk.Amount.make("8472222189351"));
            done();
        }, 1000);
    });

    it("Test AccountList - Balance use EventHandler", (done) => {
        const kps = sample_secret_multi_account.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(endpoint));

        kps.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });
        assert.strictEqual(accounts.length, kps.length);
        let count = 0;
        accounts.addEventListener(sdk.Event.CHANGE_BALANCE, (event: string) => {
            if (++count === accounts.length) {
                assert.deepStrictEqual(accounts.balance.balance.toString(), "48155740916753");
                done();
            }
        });
        accounts.checkBalance(false);
    });

    it("Test AccountList - toString & fromString", () => {
        const kps = sample_secret_multi_account.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(endpoint));

        kps.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });
        assert.strictEqual(accounts.length, kps.length);

        const serialized = accounts.toString();
        const expected = `[{"name":"Account0","address":"boa1xzcd00f8jn36mzppkue6w3gpt2ufevulupaa5a8f9uc0st8uh68jyak7p64"},{"name":"Account1","address":"boa1xqam00nfz03mv4jr80c7wr4hd2zqtgezr9kysgjqg3gdz7ygyutvylhhwlx"},{"name":"Account2","address":"boa1xzce00jfyy7jxukasfx8xndpx2l8mcyf2kmcfrvux9800pdj2670q5htf0e"},{"name":"Account3","address":"boa1xpcq00pz4md60d06vukmw8mj7xseslt3spu7sp6daz36dt7eg5q35m8ehhc"},{"name":"Account4","address":"boa1xrap00gy9ttpvhk9hfz5vhwuy430ua7td88exhq2rx9lm3l6sgfeqzaeew9"}]`;

        assert.deepStrictEqual(serialized, expected);

        const deserialized = new sdk.AccountContainer(new sdk.WalletClient(endpoint));
        deserialized.fromString(serialized);

        assert.deepStrictEqual(deserialized.items.length, accounts.items.length);
        for (let idx = 0; idx < deserialized.items.length; idx++) {
            assert.deepStrictEqual(deserialized.items[idx].name, accounts.items[idx].name);
            assert.deepStrictEqual(deserialized.items[idx].address, accounts.items[idx].address);
        }
    });

    it("Test AccountList - remove", () => {
        const kps = sample_secret_multi_account.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(endpoint));

        kps.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });
        assert.strictEqual(accounts.length, kps.length);

        accounts.selected_index = accounts.length - 1;
        accounts.addEventListener(sdk.Event.REMOVED, () => {
            assert.strictEqual(accounts.selected_index, 3);
        });
        if (accounts.selected_account) {
            accounts.remove(accounts.selected_account.name);
            assert.strictEqual(accounts.selected_index, 3);
        }
    });

    it("Test WalletSenderContainer", () => {
        const kps = sample_secret_multi_account.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(endpoint));
        const senders = new sdk.WalletSenderContainer();
        const account0 = new sdk.Account(accounts, "Account0", kps[0].secret);
        const account1 = new sdk.Account(accounts, "Account1", kps[1].secret);
        senders.add(account0, sdk.Amount.make(0));
        senders.add(account1, sdk.Amount.make(0));

        assert.strictEqual(senders.exist(kps[2].address), false);
        assert.strictEqual(senders.exist(kps[0].address), true);
        assert.strictEqual(senders.exist(kps[1].address), true);

        senders.remove(account0);
        assert.strictEqual(senders.exist(kps[0].address), false);
    });

    it("Test WalletReceiverContainer", () => {
        const kps = sample_secret_multi_account.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
        const receivers = new sdk.WalletReceiverContainer();
        const receiver0 = { address: kps[0].address, amount: sdk.BOA(100) };
        const receiver1 = { address: kps[1].address, amount: sdk.BOA(100) };
        receivers.add(receiver0);
        receivers.add(receiver1);

        assert.strictEqual(receivers.exist(kps[2].address), false);
        assert.strictEqual(receivers.exist(kps[0].address), true);
        assert.strictEqual(receivers.exist(kps[1].address), true);

        receivers.remove(receiver0);
        assert.strictEqual(receivers.exist(kps[0].address), false);

        receivers.removeAddress(receiver1.address);
        assert.strictEqual(receivers.exist(kps[1].address), false);
    });
});
