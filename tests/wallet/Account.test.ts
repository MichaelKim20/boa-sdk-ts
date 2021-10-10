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

    it("Test Account", async () => {
        const seed1 = `SDV3GLVZ6W7R7UFB2EMMY4BBFJWNCQB5FTCXUMD5ZCFTDEVZZ3RQ2BZI`;
        const kp1 = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed1));
        const seed2 = `SDNGO67J7UKBZ2TZIGOZNPMTGZXEJUWPYMTJK4FX3GBDVZNNXVVAW3WR`;
        const kp2 = sdk.KeyPair.fromSeed(new sdk.SecretKey(seed2));

        const option = {
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        };
        const temp = new sdk.AccountContainer(new sdk.WalletClient(option));
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
        const option = {
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(option));

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

    it("Test AccountContainer - Balance", (done) => {
        const kps = sample_secret_multi_account.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
        const option = {
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(option));

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
        const option = {
            agoraEndpoint: URI("http://localhost").port(agora_port).toString(),
            stoaEndpoint: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        };
        const accounts = new sdk.AccountContainer(new sdk.WalletClient(option));

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
        accounts.checkBalance();
    });
});
