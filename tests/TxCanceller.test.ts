/*******************************************************************************

    Test for TxCanceller

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../lib";

import * as assert from "assert";

describe("TxCanceller", () => {
    let key_pairs: sdk.KeyPair[];
    let utxo_array: any[];

    function makeOriginalTransaction(
        owner_keypair: sdk.KeyPair,
        in_amount: sdk.JSBI,
        out_amount: sdk.JSBI
    ): sdk.Transaction {
        const builder = new sdk.TxBuilder(owner_keypair);

        const output_address = "boa1xqd00qsu7n5ykyckc23wmcjglfalcdea3x2af88hx2x5qx65x7w8g2r5t29";
        const input_count = 2;
        const output_count = 2;
        const tx_size = sdk.Transaction.getEstimatedNumberOfBytes(input_count, output_count, 0);
        let tx_fee = sdk.JSBI.BigInt(sdk.Utils.FEE_RATE * tx_size);
        const minimum = sdk.JSBI.BigInt(100_000);
        if (sdk.JSBI.lessThan(tx_fee, minimum)) tx_fee = sdk.JSBI.BigInt(minimum);

        builder.addInput(
            sdk.OutputType.Payment,
            new sdk.Hash(
                "0x75283072696d82d8bca2fe45471906a26df1dbe0736e41a9f78e02a14e2bfced6e0cb671f023626f890f28204556aca217f3023c891fe64b9f4b3450cb3e80ad"
            ),
            in_amount
        );
        builder.addInput(
            sdk.OutputType.Payment,
            new sdk.Hash(
                "0x6fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673"
            ),
            in_amount
        );

        // Build a transaction
        return builder.addOutput(new sdk.PublicKey(output_address), out_amount).sign(sdk.OutputType.Payment, tx_fee);
    }

    before("Wait for the package libsodium to finish loading", () => {
        sdk.setChainId(sdk.ChainId.TestNet);
        if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
        return sdk.SodiumHelper.init();
    });

    before("Prepare variables", () => {
        key_pairs = [
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SAFRBTFVAB37EEJDIUGCDK5R3KSL3QDBO3SPS6GX752IILWB4NGQY7KJ")),
            sdk.KeyPair.fromSeed(new sdk.SecretKey("SCX34MSZILQJT42XRSOEOZLI7NYFB67HTCCFWPIVEGRPIUY7GW2Q4CDJ")),
        ];

        utxo_array = [
            {
                utxo: "0x6fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673",
                type: sdk.OutputType.Payment,
                unlock_height: "2",
                amount: "20000000000000",
                height: "1",
                time: 1609459200,
                lock_type: 0,
                lock_bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=",
            },
            {
                utxo: "0x75283072696d82d8bca2fe45471906a26df1dbe0736e41a9f78e02a14e2bfced6e0cb671f023626f890f28204556aca217f3023c891fe64b9f4b3450cb3e80ad",
                type: sdk.OutputType.Payment,
                unlock_height: "2",
                amount: "20000000000000",
                height: "1",
                time: 1609459800,
                lock_type: 0,
                lock_bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=",
            },
        ];
    });

    it("Can not cancel a frozen transaction", () => {
        const utxo_data = JSON.parse(JSON.stringify(utxo_array));
        // change transaction output type
        utxo_data[0].type = sdk.OutputType.Freeze;
        const utxos = utxo_data.map((m: any) => sdk.UnspentTxOutput.reviver("", m));

        const tx = makeOriginalTransaction(
            key_pairs[0],
            sdk.JSBI.BigInt("20000000000000"),
            sdk.JSBI.BigInt("30000000000000")
        );
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.Cancel_NotAllowUnfreezing);
        assert.ok(res.tx === undefined);
    });

    it("Transactions that do not exist UTXO cannot be canceled.", () => {
        const utxo_data = JSON.parse(JSON.stringify(utxo_array));
        // remove one utxo
        utxo_data.pop();
        const utxos = utxo_data.map((m: any) => sdk.UnspentTxOutput.reviver("", m));

        const tx = makeOriginalTransaction(
            key_pairs[0],
            sdk.JSBI.BigInt("20000000000000"),
            sdk.JSBI.BigInt("30000000000000")
        );
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.Cancel_NotFoundUTXO);
        assert.ok(res.tx === undefined);
    });

    it("Transactions with UTXO that `LockType` is not `Key` cannot be cancelled.", () => {
        const utxo_data = JSON.parse(JSON.stringify(utxo_array));
        // change a lock type
        utxo_data[0].lock_type = sdk.LockType.KeyHash;
        const utxos = utxo_data.map((m: any) => sdk.UnspentTxOutput.reviver("", m));

        const tx = makeOriginalTransaction(
            key_pairs[0],
            sdk.JSBI.BigInt("20000000000000"),
            sdk.JSBI.BigInt("30000000000000")
        );
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.Cancel_UnsupportedLockType);
        assert.ok(res.tx === undefined);
    });

    it("Transactions cannot be canceled without a KeyPair to use UTXO.", () => {
        const utxo_data = JSON.parse(JSON.stringify(utxo_array));
        const utxos = utxo_data.map((m: any) => sdk.UnspentTxOutput.reviver("", m));

        // remove a keypair
        const keys = key_pairs.slice();
        keys.pop();

        const tx = makeOriginalTransaction(
            key_pairs[0],
            sdk.JSBI.BigInt("20000000000000"),
            sdk.JSBI.BigInt("30000000000000")
        );
        const canceller = new sdk.TxCanceller(tx, utxos, keys);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.Cancel_NotFoundKey);
        assert.ok(res.tx === undefined);
    });

    it("Transactions with amounts of UTXO that are not large enough cannot be cancelled.", () => {
        const utxo_data = JSON.parse(JSON.stringify(utxo_array));
        // change amount
        utxo_data[0].amount = "152880";
        utxo_data[1].amount = "152880";
        const utxos = utxo_data.map((m: any) => sdk.UnspentTxOutput.reviver("", m));

        const tx = makeOriginalTransaction(key_pairs[0], sdk.JSBI.BigInt(152880), sdk.JSBI.BigInt(10000));
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.Cancel_NotEnoughFee);
        assert.ok(res.tx === undefined);
    });

    it("Successful testing of cancellation transactions", () => {
        const utxo_data = JSON.parse(JSON.stringify(utxo_array));
        const utxos: sdk.UnspentTxOutput[] = utxo_data.map((m: any) => sdk.UnspentTxOutput.reviver("", m));

        const tx = makeOriginalTransaction(
            key_pairs[0],
            sdk.JSBI.BigInt("20000000000000"),
            sdk.JSBI.BigInt("30000000000000")
        );
        const canceller = new sdk.TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();
        assert.strictEqual(res.code, sdk.TxCancelResultCode.Success);
        assert.ok(res.tx !== undefined);

        const expected = {
            inputs: [
                {
                    utxo: "0x6fbcdb2573e0f5120f21f1875b6dc281c2eca3646ec2c39d703623d89b0eb83cd4b12b73f18db6bc6e8cbcaeb100741f6384c498ff4e61dd189e728d80fb9673",
                    unlock: {
                        bytes: "ZU/TczLX33fadkwcS581ZxIVtC6R91TyfZR7LmOOIAnjljME5EFwYTM+WKR7UdZZJ+KsPyLFGhtySxtMNNg1lQE=",
                    },
                    unlock_age: 0,
                },
                {
                    utxo: "0x75283072696d82d8bca2fe45471906a26df1dbe0736e41a9f78e02a14e2bfced6e0cb671f023626f890f28204556aca217f3023c891fe64b9f4b3450cb3e80ad",
                    unlock: {
                        bytes: "qsG5dLefZuT16AspASU+UAhXMrbFGfJiVlVAopz0JwqipLYzhss57dRWgYQd4yzUpUrt4nQFkb3khKU39yqqmQE=",
                    },
                    unlock_age: 0,
                },
            ],
            outputs: [
                {
                    type: 0,
                    value: "19999999847120",
                    lock: { type: 0, bytes: "uvf5H/3E3rpj8r12wjpHMPSOcoAhhCa2ecQMw6HCI84=" },
                },
                {
                    type: 0,
                    value: "19999999847120",
                    lock: { type: 0, bytes: "8Pfbo1EB2MhMyXG64ZzvTt50VuOGRGwIDjiXoA5xyZ8=" },
                },
            ],
            payload: "",
            lock_height: "0",
        };
        if (res.tx !== undefined) {
            const tx_size = tx.getNumberOfBytes();
            let total_fee = sdk.Amount.make(sdk.Utils.FEE_RATE * tx_size);
            const minimum = sdk.Amount.make(100_000);
            if (sdk.Amount.lessThan(total_fee, minimum)) total_fee = sdk.Amount.make(minimum);

            const adjusted_fee = sdk.Amount.divide(total_fee, tx_size);

            const cancel_adjusted_fee = sdk.Amount.divide(
                sdk.Amount.multiply(adjusted_fee, 100 + sdk.TxCanceller.double_spent_threshold_pct),
                100
            );

            const cancel_tx_size = res.tx.getNumberOfBytes();
            const cancel_total_fee = sdk.Amount.multiply(cancel_adjusted_fee, cancel_tx_size);

            const in_sum = utxos.reduce<sdk.Amount>((sum, n) => sdk.Amount.add(sum, n.amount), sdk.Amount.make(0));
            const out_sum = res.tx.outputs.reduce<sdk.Amount>(
                (sum, n) => sdk.Amount.add(sum, n.value),
                sdk.Amount.make(0)
            );
            assert.deepStrictEqual(sdk.Amount.subtract(in_sum, out_sum), cancel_total_fee);

            res.tx.inputs.forEach((value: sdk.TxInput, idx: number) => {
                expected.inputs[idx].unlock = value.unlock.toJSON();
            });
            assert.deepStrictEqual(JSON.stringify(res.tx), JSON.stringify(expected));
        }
    });
});
