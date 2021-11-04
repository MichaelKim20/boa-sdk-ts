/*******************************************************************************

    Test of transaction builder for wallet with multi account

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
import { delay } from "../Utils";

// tslint:disable-next-line:no-implicit-dependencies
import bodyParser from "body-parser";
// tslint:disable-next-line:no-implicit-dependencies
import express from "express";
import * as http from "http";

import * as assert from "assert";
import URI from "urijs";

const seeds = [
    "SDLFMXEPWO5BNB64TUZQJP5JJUET2P4QFMTMDSPYELC2LZ6UXMSAOIKE",
    "SDLAFDIR6HVSP6AAAY5MH2MGAWZ24EGCHILI4GPAU2BETGNMTFYQKQ6V",
    "SCTP4PL5V635752FTC546RBNFBRZIWXL3QI34ZRNMY4C2PERCVRQJQYX",
    "SBTQUF4TQPRE5GKU3A6EICN35BZPSYNNYEYYZ2GNMNY76XQ7ILQALTKP",
    "SATBAW3HLRCRWA3LJIHFADM5RVWY4RDDG6ZNEXDNSDGC2MD3MBMQLUS5",
    "SCXE6LI5SNOSHAGD7K5LJD4GODHEHOQ7JFKHJZSEHBLVPJ4Q2MSQGTFL",
    "SDW6PSPMER4P7SZ2BXDQPSFIXEIW6V26QCKLGUHVTFX6YCBOA35AWCAW",
    "SDYNPHQIDC4CMNMLKRKLHIKWDEQ6WVNESNNWMONIJJFODT6YXUQQ7S36",
    "SCCQRMDR63E6I5QPCYMQAXQ2NYULG562PKPLVSNTKQ6CEDGPXXWAYZQE",
    "SARGARQL5O7K7AGVPJ6W2MLUEKAKFCPCSP5P7O7ZV25GGBQE5VKAN2CT",
];
let key_pairs: sdk.KeyPair[];
let sample_utxos: any = {};

/**
 * This allows data transfer and reception testing with the server.
 */
class TestStoa {
    /**
     * The bind port
     */
    private readonly port: number;

    /**
     * The application of express module
     */
    protected app: express.Application;

    /**
     * The Http server
     */
    protected server: http.Server | null = null;

    /**
     * Constructor
     * @param port The bind port
     */
    constructor(port: number | string) {
        if (typeof port === "string") this.port = parseInt(port, 10);
        else this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start(): Promise<void> {
        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: false, limit: "1mb" }));
        // parse application/json
        this.app.use(bodyParser.json({ limit: "1mb" }));

        // GET /client_info
        this.app.get("/client_info", (req: express.Request, res: express.Response) => {
            res.status(200).send({
                "X-Client-Name": req.header("X-Client-Name"),
                "X-Client-Version": req.header("X-Client-Version"),
            });
        });

        // GET /block_height
        this.app.get("/block_height", (req: express.Request, res: express.Response) => {
            res.status(200).send("10");
        });

        // GET /transaction/fees/:tx_size
        this.app.get("/transaction/fees/:tx_size", (req: express.Request, res: express.Response) => {
            const size: string = req.params.tx_size.toString();

            if (!sdk.Utils.isPositiveInteger(size)) {
                res.status(400).send(`Invalid value for parameter 'tx_size': ${size}`);
                return;
            }

            const tx_size = sdk.JSBI.BigInt(size);
            const rate = sdk.JSBI.BigInt(700);
            const minimum = sdk.JSBI.multiply(tx_size, rate);
            let medium = sdk.JSBI.multiply(tx_size, rate);
            if (sdk.JSBI.lessThan(medium, minimum)) medium = sdk.JSBI.BigInt(minimum);

            const width = sdk.JSBI.divide(medium, sdk.JSBI.BigInt(10));
            let high = sdk.JSBI.add(medium, width);
            let low = sdk.JSBI.subtract(medium, width);
            if (sdk.JSBI.lessThan(high, minimum)) high = sdk.JSBI.BigInt(minimum);
            if (sdk.JSBI.lessThan(low, minimum)) low = sdk.JSBI.BigInt(minimum);

            const data = {
                tx_size: sdk.JSBI.toNumber(tx_size),
                high: high.toString(),
                medium: medium.toString(),
                low: low.toString(),
            };

            res.status(200).send(JSON.stringify(data));
        });

        // GET /wallet/balance/:address
        this.app.get("/wallet/balance/:address", (req: express.Request, res: express.Response) => {
            const address: sdk.PublicKey = new sdk.PublicKey(req.params.address);

            const data_of_address: any = sample_utxos[address.toString()];
            if (data_of_address === undefined) {
                res.status(200).send(
                    JSON.stringify({
                        address: address.toString(),
                        balance: "0",
                        spendable: "0",
                        frozen: "0",
                        locked: "0",
                    })
                );
                return;
            }

            res.status(200).send(JSON.stringify(data_of_address.balance));
        });

        // GET /wallet/utxo/:address
        this.app.get("/wallet/utxo/:address", (req: express.Request, res: express.Response) => {
            const address: sdk.PublicKey = new sdk.PublicKey(req.params.address);

            let amount: sdk.JSBI;
            if (req.query.amount === undefined) {
                res.status(400).send(`Parameters 'amount' is not entered.`);
                return;
            } else if (!sdk.Utils.isPositiveInteger(req.query.amount.toString())) {
                res.status(400).send(`Invalid value for parameter 'amount': ${req.query.amount.toString()}`);
                return;
            }
            amount = sdk.JSBI.BigInt(req.query.amount.toString());

            // Balance Type (0: Spendable; 1: Frozen; 2: Locked)
            let balance_type: number;
            if (req.query.type !== undefined) {
                balance_type = Number(req.query.type.toString());
            } else {
                balance_type = 0;
            }

            // Last UTXO in previous request
            let last_utxo: sdk.Hash | undefined;
            if (req.query.last !== undefined) {
                try {
                    last_utxo = new sdk.Hash(String(req.query.last));
                } catch (error) {
                    res.status(400).send(`Invalid value for parameter 'last': ${req.query.last.toString()}`);
                    return;
                }
            } else {
                last_utxo = undefined;
            }

            const storage_of_address = sample_utxos[address.toString()];
            if (storage_of_address === undefined) {
                res.status(200).send(JSON.stringify([]));
                return;
            }
            const utxos_of_address: any = storage_of_address.utxo;

            let include = false;
            let sum = sdk.JSBI.BigInt(0);
            const utxos: any[] = utxos_of_address
                .filter((m: any) => {
                    if (balance_type === 0 && (m.type === 0 || m.type === 2)) return true;
                    else return balance_type === 1 && m.type === 1;
                })
                .filter((m: any) => {
                    if (last_utxo === undefined) return true;
                    if (include) return true;
                    include = last_utxo.toString() === m.utxo;
                })
                .filter((n: any) => {
                    if (sdk.JSBI.greaterThanOrEqual(sum, amount)) return false;
                    sum = sdk.JSBI.add(sum, sdk.JSBI.BigInt(n.amount));
                    return true;
                });

            res.status(200).send(JSON.stringify(utxos));
        });

        // GET /utxos
        this.app.post("/utxos", (req: express.Request, res: express.Response) => {
            if (req.body.utxos === undefined) {
                res.status(400).send({
                    statusMessage: "Missing 'utxos' object in body",
                });
                return;
            }

            let utxos_hash: sdk.Hash[];
            try {
                utxos_hash = req.body.utxos.map((m: string) => new sdk.Hash(m));
            } catch (error) {
                res.status(400).send(`Invalid value for parameter 'utxos': ${req.body.utxos.toString()}`);
                return;
            }

            const utxo_array: any[] = [];
            key_pairs.forEach((m) => {
                const storage_of_address = sample_utxos[m.address.toString()];
                const utxos_of_address: any[] = storage_of_address.utxo;
                utxos_hash.forEach((m) => {
                    const found = utxos_of_address.find((n) => n.utxo === m.toString());
                    if (found !== undefined) {
                        utxo_array.push(found);
                    }
                });
            });

            res.status(200).send(JSON.stringify(utxo_array));
        });

        this.app.set("port", this.port);

        // Listen on provided this.port on this.address.
        return new Promise<void>((resolve, reject) => {
            // Create HTTP server.
            this.server = http.createServer(this.app);
            this.server.on("error", reject);
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.server != null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else resolve();
        });
    }
}

/**
 * This is an Agora node for testing.
 */
class TestAgora {
    /**
     * The bind port
     */
    private readonly port: number;

    /**
     * The application of express module
     */
    protected app: express.Application;

    /**
     * The Http server
     */
    protected server: http.Server | null = null;

    /**
     * Constructor
     * @param port The bind port
     */
    constructor(port: number | string) {
        if (typeof port === "string") this.port = parseInt(port, 10);
        else this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start(): Promise<void> {
        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // parse application/json
        this.app.use(bodyParser.json());

        this.app.get("/block_height", (req: express.Request, res: express.Response) => {
            res.status(200).send("10");
        });

        this.app.post("/transaction", (req: express.Request, res: express.Response) => {
            if (req.body.tx === undefined) {
                res.status(400).send("Missing 'tx' object in body");
                return;
            }
            res.status(200).send();
        });

        this.app.set("port", this.port);

        // Listen on provided this.port on this.address.
        return new Promise<void>((resolve, reject) => {
            // Create HTTP server.
            this.server = http.createServer(this.app);
            this.server.on("error", reject);
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.server != null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else resolve();
        });
    }
}

describe("Wallet Transaction Builder", function () {
    this.timeout(20000);

    let agora_server: TestAgora;
    let stoa_server: TestStoa;
    const agora_port: string = "2510";
    const stoa_port: string = "5510";

    function makeRandomUTXO() {
        const result: any = {};
        for (const kp of key_pairs) {
            const utxos: any[] = sdk.iota(0, 10).map((m: number) => {
                return {
                    utxo: new sdk.Hash(Buffer.from(sdk.SodiumHelper.sodium.randombytes_buf(sdk.Hash.Width))).toString(),
                    type: Math.random() > 0.2 ? 0 : 1,
                    unlock_height: (m + 2).toString(),
                    amount: sdk.BOA(10 + Math.floor(Math.random() * 10000) / 100).toString(),
                    height: (m + 1).toString(),
                    time: m,
                    lock_type: 0,
                    lock_bytes: kp.address.data.toString("base64"),
                };
            });
            const values = utxos.reduce<[sdk.JSBI, sdk.JSBI, sdk.JSBI]>(
                (prev, value) => {
                    prev[0] = sdk.JSBI.add(prev[0], sdk.JSBI.BigInt(value.amount));
                    if (value.type === 0) {
                        prev[1] = sdk.JSBI.add(prev[1], sdk.JSBI.BigInt(value.amount));
                    } else {
                        prev[2] = sdk.JSBI.add(prev[2], sdk.JSBI.BigInt(value.amount));
                    }
                    return prev;
                },
                [sdk.JSBI.BigInt(0), sdk.JSBI.BigInt(0), sdk.JSBI.BigInt(0)]
            );

            result[kp.address.toString()] = {
                utxo: utxos,
                balance: {
                    address: kp.address.toString(),
                    balance: values[0].toString(),
                    spendable: values[1].toString(),
                    frozen: values[2].toString(),
                    locked: "0",
                },
            };
        }
        sample_utxos = result;
    }

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

    before("Create KeyPairs", async () => {
        key_pairs = seeds.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
    });

    it("When adding one sender at a time", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const builder = new sdk.WalletTxBuilder(wallet_client);

        const max_count = 50;
        for (let count = 0; count < max_count; count++) {
            makeRandomUTXO();
            accounts.clear();
            await builder.clear();
            await builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);

            let spendable = sdk.Amount.make(0);
            key_pairs.forEach((value, idx) => {
                const elem = sample_utxos[value.address.toString()];
                spendable = sdk.Amount.add(spendable, sdk.Amount.make(elem.balance.spendable));
            });
            const send_amount = sdk.Amount.divide(
                sdk.Amount.multiply(spendable, 10 + Math.floor(Math.random() * 80)),
                100
            );
            await builder.addReceiver({
                address: new sdk.PublicKey("boa1xpr00rxtcprlf99dnceuma0ftm9sv03zhtlwfytd5p0dkvzt4ryp595zpjp"),
                amount: send_amount,
            });

            for (const key_pair of key_pairs) {
                const account = accounts.add(key_pair.address.toString(), key_pair.secret);
                if (account === undefined) continue;
                await account.checkBalance();
                await builder.addSender(account, account.balance.spendable);

                let expected_in_count = 0;
                let expected_in_sum = sdk.Amount.make(0);
                let expected_drawn = sdk.Amount.make(0);
                let expected_fee = sdk.Amount.make(0);
                let expected_remaining = sdk.Amount.make(0);
                let done = false;
                for (const elem of builder.senders.items) {
                    for (const utxo of elem.utxos) {
                        expected_in_count++;
                        expected_fee = sdk.Amount.make(
                            sdk.Utils.FEE_RATE *
                                sdk.Transaction.getEstimatedNumberOfBytes(Math.max(expected_in_count, 1), 2, 0)
                        );
                        expected_in_sum = sdk.Amount.add(expected_in_sum, utxo.amount);
                        const amount = sdk.Amount.subtract(sdk.Amount.add(send_amount, expected_fee), expected_drawn);
                        if (sdk.Amount.greaterThanOrEqual(utxo.amount, amount)) {
                            expected_drawn = sdk.Amount.add(expected_drawn, amount);
                            expected_remaining = sdk.Amount.make(0);
                            done = true;
                            break;
                        } else {
                            expected_drawn = sdk.Amount.add(expected_drawn, utxo.amount);
                            expected_remaining = sdk.Amount.subtract(amount, utxo.amount);
                            done = false;
                        }
                    }
                    if (done) break;
                }

                let actual_in_count = 0;
                let actual_in_sum = sdk.Amount.make(0);
                for (const elem of builder.senders.items) {
                    actual_in_count += elem.utxos.length;
                    actual_in_sum = sdk.Amount.add(
                        actual_in_sum,
                        elem.utxos.reduce<sdk.Amount>((prev: sdk.Amount, value: sdk.UnspentTxOutput) => {
                            return sdk.Amount.add(prev, value.amount);
                        }, sdk.Amount.make(0))
                    );
                }
                assert.deepStrictEqual(actual_in_count, expected_in_count);
                assert.deepStrictEqual(actual_in_sum.toString(), expected_in_sum.toString());
                assert.deepStrictEqual(builder.total_drawn.toString(), expected_drawn.toString());
                assert.deepStrictEqual(builder.fee_tx.toString(), expected_fee.toString());
                assert.deepStrictEqual(builder.remaining, expected_remaining);
            }

            const res_transaction = builder.buildTransaction();
            assert.deepStrictEqual(res_transaction.code, sdk.WalletResultCode.Success);
            assert.ok(res_transaction.data !== undefined);
        }
    });

    it("When adding all senders at once, check the final result.", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const builder = new sdk.WalletTxBuilder(wallet_client);

        const max_count = 50;
        for (let count = 0; count < max_count; count++) {
            makeRandomUTXO();
            accounts.clear();
            await builder.clear();
            await builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);

            key_pairs.forEach((value, idx) => {
                accounts.add("Account" + idx.toString(), value.secret);
            });
            let spendable = sdk.Amount.make(0);
            key_pairs.forEach((value, idx) => {
                const elem = sample_utxos[value.address.toString()];
                spendable = sdk.Amount.add(spendable, sdk.Amount.make(elem.balance.spendable));
            });

            const send_amount = sdk.Amount.divide(
                sdk.Amount.multiply(spendable, 10 + Math.floor(Math.random() * 80)),
                100
            );
            await builder.addReceiver({
                address: new sdk.PublicKey("boa1xpr00rxtcprlf99dnceuma0ftm9sv03zhtlwfytd5p0dkvzt4ryp595zpjp"),
                amount: send_amount,
            });

            for (const elem of accounts.items) {
                await elem.checkBalance();
            }

            for (const elem of accounts.items) {
                await builder.addSender(elem, elem.balance.spendable);
            }

            let expected_in_count = 0;
            let expected_in_sum = sdk.Amount.make(0);
            let expected_drawn = sdk.Amount.make(0);
            let expected_fee = sdk.Amount.make(0);
            let expected_remaining = sdk.Amount.make(0);
            let done = false;
            for (const elem of builder.senders.items) {
                for (const utxo of elem.utxos) {
                    expected_in_count++;
                    expected_fee = sdk.Amount.make(
                        sdk.Utils.FEE_RATE *
                            sdk.Transaction.getEstimatedNumberOfBytes(Math.max(expected_in_count, 1), 2, 0)
                    );
                    expected_in_sum = sdk.Amount.add(expected_in_sum, utxo.amount);
                    const amount = sdk.Amount.subtract(sdk.Amount.add(send_amount, expected_fee), expected_drawn);
                    if (sdk.Amount.greaterThanOrEqual(utxo.amount, amount)) {
                        expected_drawn = sdk.Amount.add(expected_drawn, amount);
                        expected_remaining = sdk.Amount.make(0);
                        done = true;
                        break;
                    } else {
                        expected_drawn = sdk.Amount.add(expected_drawn, utxo.amount);
                        expected_remaining = sdk.Amount.subtract(amount, utxo.amount);
                        done = false;
                    }
                }
                if (done) break;
            }

            let actual_in_count = 0;
            let actual_in_sum = sdk.Amount.make(0);
            for (const elem of builder.senders.items) {
                actual_in_count += elem.utxos.length;
                actual_in_sum = sdk.Amount.add(
                    actual_in_sum,
                    elem.utxos.reduce<sdk.Amount>((prev: sdk.Amount, value: sdk.UnspentTxOutput) => {
                        return sdk.Amount.add(prev, value.amount);
                    }, sdk.Amount.make(0))
                );
            }
            assert.deepStrictEqual(actual_in_count, expected_in_count);
            assert.deepStrictEqual(actual_in_sum.toString(), expected_in_sum.toString());
            assert.deepStrictEqual(builder.total_drawn.toString(), expected_drawn.toString());
            assert.deepStrictEqual(builder.fee_tx.toString(), expected_fee.toString());
            assert.ok(sdk.Amount.greaterThanOrEqual(actual_in_sum, builder.total_drawn));
            assert.deepStrictEqual(builder.remaining, sdk.Amount.ZERO_BOA);

            const res_transaction = builder.buildTransaction();
            assert.deepStrictEqual(res_transaction.code, sdk.WalletResultCode.Success);
            assert.ok(res_transaction.data !== undefined);
        }
    });

    it("When the transaction fee is changed", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const builder = new sdk.WalletTxBuilder(wallet_client);

        makeRandomUTXO();
        accounts.clear();
        await builder.clear();
        await builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);

        key_pairs.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });
        let spendable = sdk.Amount.make(0);
        key_pairs.forEach((value, idx) => {
            const elem = sample_utxos[value.address.toString()];
            spendable = sdk.Amount.add(spendable, sdk.Amount.make(elem.balance.spendable));
        });

        const send_amount = sdk.Amount.divide(sdk.Amount.multiply(spendable, 10 + Math.floor(Math.random() * 80)), 100);
        await builder.addReceiver({
            address: new sdk.PublicKey("boa1xpr00rxtcprlf99dnceuma0ftm9sv03zhtlwfytd5p0dkvzt4ryp595zpjp"),
            amount: send_amount,
        });

        for (const elem of accounts.items) {
            await elem.checkBalance();
        }

        for (const elem of accounts.items) {
            await builder.addSender(elem, elem.balance.spendable);
        }

        let expected_in_count = 0;
        let expected_in_sum = sdk.Amount.make(0);
        let expected_drawn = sdk.Amount.make(0);
        let expected_fee = sdk.Amount.make(0);
        let expected_remaining = sdk.Amount.make(0);
        let fee_rate = builder.fee_rate;
        let done = false;
        for (const elem of builder.senders.items) {
            for (const utxo of elem.utxos) {
                expected_in_count++;
                expected_fee = sdk.Amount.make(
                    fee_rate * sdk.Transaction.getEstimatedNumberOfBytes(Math.max(expected_in_count, 1), 2, 0)
                );
                expected_in_sum = sdk.Amount.add(expected_in_sum, utxo.amount);
                const amount = sdk.Amount.subtract(sdk.Amount.add(send_amount, expected_fee), expected_drawn);
                if (sdk.Amount.greaterThanOrEqual(utxo.amount, amount)) {
                    expected_drawn = sdk.Amount.add(expected_drawn, amount);
                    expected_remaining = sdk.Amount.make(0);
                    done = true;
                    break;
                } else {
                    expected_drawn = sdk.Amount.add(expected_drawn, utxo.amount);
                    expected_remaining = sdk.Amount.subtract(amount, utxo.amount);
                    done = false;
                }
            }
            if (done) break;
        }

        assert.deepStrictEqual(builder.fee_tx.toString(), expected_fee.toString());
        // When the transaction fee is changed,
        // the values of the senders are recalculated to prepare for building the transaction.
        const original_fee = sdk.Amount.make(builder.fee_tx);
        const new_fee = sdk.Amount.divide(sdk.Amount.multiply(builder.fee_tx, 120), 100);
        const applied_fee = await builder.setTransactionFee(new_fee);
        assert.deepStrictEqual(applied_fee.toString(), new_fee.toString());

        expected_in_count = 0;
        expected_in_sum = sdk.Amount.make(0);
        expected_drawn = sdk.Amount.make(0);
        expected_fee = sdk.Amount.make(0);
        done = false;
        fee_rate = builder.fee_rate;
        for (const elem of builder.senders.items) {
            for (const utxo of elem.utxos) {
                expected_in_count++;
                expected_fee = sdk.Amount.make(
                    fee_rate * sdk.Transaction.getEstimatedNumberOfBytes(Math.max(expected_in_count, 1), 2, 0)
                );
                expected_in_sum = sdk.Amount.add(expected_in_sum, utxo.amount);
                const amount = sdk.Amount.subtract(sdk.Amount.add(send_amount, expected_fee), expected_drawn);
                if (sdk.Amount.greaterThanOrEqual(utxo.amount, amount)) {
                    expected_drawn = sdk.Amount.add(expected_drawn, amount);
                    expected_remaining = sdk.Amount.make(0);
                    done = true;
                    break;
                } else {
                    expected_drawn = sdk.Amount.add(expected_drawn, utxo.amount);
                    expected_remaining = sdk.Amount.subtract(amount, utxo.amount);
                    done = false;
                }
            }
            if (done) break;
        }

        assert.deepStrictEqual(builder.fee_tx.toString(), expected_fee.toString());
        assert.deepStrictEqual(builder.fee_tx.toString(), applied_fee.toString());

        // When the transaction fee is changed,
        // If a value is set too small, it is adjusted to an optimal value.
        const applied_fee2 = await builder.setTransactionFee(sdk.BOA(0.001));
        assert.deepStrictEqual(applied_fee2.toString(), original_fee.toString());

        expected_in_count = 0;
        expected_in_sum = sdk.Amount.make(0);
        expected_drawn = sdk.Amount.make(0);
        expected_fee = sdk.Amount.make(0);
        done = false;
        fee_rate = builder.fee_rate;
        for (const elem of builder.senders.items) {
            for (const utxo of elem.utxos) {
                expected_in_count++;
                expected_fee = sdk.Amount.make(
                    fee_rate * sdk.Transaction.getEstimatedNumberOfBytes(Math.max(expected_in_count, 1), 2, 0)
                );
                expected_in_sum = sdk.Amount.add(expected_in_sum, utxo.amount);
                const amount = sdk.Amount.subtract(sdk.Amount.add(send_amount, expected_fee), expected_drawn);
                if (sdk.Amount.greaterThanOrEqual(utxo.amount, amount)) {
                    expected_drawn = sdk.Amount.add(expected_drawn, amount);
                    expected_remaining = sdk.Amount.make(0);
                    done = true;
                    break;
                } else {
                    expected_drawn = sdk.Amount.add(expected_drawn, utxo.amount);
                    expected_remaining = sdk.Amount.subtract(amount, utxo.amount);
                    done = false;
                }
            }
            if (done) break;
        }

        assert.deepStrictEqual(builder.fee_tx.toString(), expected_fee.toString());
        assert.deepStrictEqual(builder.fee_tx.toString(), applied_fee2.toString());
    });

    it("Build & Get Overview", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };
        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const builder = new sdk.WalletTxBuilder(wallet_client);

        makeRandomUTXO();
        accounts.clear();
        await builder.clear();
        await builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);

        key_pairs.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });
        let spendable = sdk.Amount.make(0);
        key_pairs.forEach((value, idx) => {
            const elem = sample_utxos[value.address.toString()];
            spendable = sdk.Amount.add(spendable, sdk.Amount.make(elem.balance.spendable));
        });

        const receiver_address = new sdk.PublicKey("boa1xpr00rxtcprlf99dnceuma0ftm9sv03zhtlwfytd5p0dkvzt4ryp595zpjp");
        const send_amount = sdk.Amount.divide(sdk.Amount.multiply(spendable, 10 + Math.floor(Math.random() * 80)), 100);
        await builder.addReceiver({
            address: receiver_address,
            amount: send_amount,
        });

        for (const elem of accounts.items) {
            await elem.checkBalance();
        }

        for (const elem of accounts.items) {
            await builder.addSender(elem, elem.balance.spendable);
        }

        const res = builder.buildTransaction();
        assert.deepStrictEqual(res.code, sdk.WalletResultCode.Success);
        assert.ok(res.data !== undefined);

        const res_overview = builder.getTransactionOverview();
        assert.deepStrictEqual(res_overview.code, sdk.WalletResultCode.Success);
        assert.ok(res_overview.data !== undefined);

        const receiver = res_overview.data.receivers.find((m) => sdk.PublicKey.equal(m.address, receiver_address));
        assert.ok(receiver !== undefined);
        assert.deepStrictEqual(receiver.amount, send_amount);

        const refund_receiver = res_overview.data.receivers.find(
            (m) => !sdk.PublicKey.equal(m.address, receiver_address)
        );
        assert.ok(refund_receiver !== undefined);

        const refund_sender = res_overview.data.senders.find((m) =>
            sdk.PublicKey.equal(m.address, refund_receiver.address)
        );
        assert.ok(refund_sender !== undefined);
    });

    class FakeUIComponent {
        private accounts: sdk.AccountContainer;
        private builder: sdk.WalletTxBuilder;

        public events: string[] = [];

        constructor(values: sdk.AccountContainer, tx_builder: sdk.WalletTxBuilder) {
            this.accounts = values;
            this.builder = tx_builder;

            this.builder.addEventListener(sdk.Event.CHANGE_BALANCE, this.onEvent, this);
            this.builder.addEventListener(sdk.Event.CHANGE_RECEIVER, this.onEvent, this);
            this.builder.addEventListener(sdk.Event.CHANGE_SENDER, this.onEvent, this);
            this.builder.addEventListener(sdk.Event.CHANGE_TX_FEE, this.onEvent, this);
            this.builder.addEventListener(sdk.Event.CHANGE_PAYLOAD_FEE, this.onEvent, this);
            this.builder.addEventListener(sdk.Event.ERROR, this.onEvent, this);
        }

        public onEvent(type: string) {
            this.events.push(type);
        }
    }

    it("Test of EventDispatch", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
            fee: sdk.WalletTransactionFeeOption.Medium,
        };
        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const builder = new sdk.WalletTxBuilder(wallet_client);

        makeRandomUTXO();
        accounts.clear();
        await builder.clear();
        await builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);

        key_pairs.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });
        let spendable = sdk.Amount.make(0);
        key_pairs.forEach((value, idx) => {
            const elem = sample_utxos[value.address.toString()];
            spendable = sdk.Amount.add(spendable, sdk.Amount.make(elem.balance.spendable));
        });

        const component = new FakeUIComponent(accounts, builder);

        // Add Receiver
        const send_amount = sdk.Amount.divide(sdk.Amount.multiply(spendable, 10 + Math.floor(Math.random() * 80)), 100);
        await builder.addReceiver({
            address: new sdk.PublicKey("boa1xpr00rxtcprlf99dnceuma0ftm9sv03zhtlwfytd5p0dkvzt4ryp595zpjp"),
            amount: send_amount,
        });

        const expected = [];
        expected.push(sdk.Event.CHANGE_RECEIVER);
        assert.deepStrictEqual(component.events, expected);

        // Add Sender
        expected.length = 0;
        component.events.length = 0;

        for (const elem of accounts.items) {
            const old_fee = builder.fee_tx;
            await builder.addSender(elem, elem.balance.spendable);
            expected.push(sdk.Event.CHANGE_SENDER);
            if (!sdk.Amount.equal(old_fee, builder.fee_tx)) expected.push(sdk.Event.CHANGE_TX_FEE);
        }
        assert.deepStrictEqual(component.events, expected);

        // Change Fee
        expected.length = 0;
        component.events.length = 0;
        const new_fee = sdk.Amount.divide(sdk.Amount.multiply(builder.fee_tx, 120), 100);
        const applied_fee = await builder.setTransactionFee(new_fee);
        assert.deepStrictEqual(applied_fee.toString(), new_fee.toString());
        expected.push(...[sdk.Event.CHANGE_SENDER, sdk.Event.CHANGE_TX_FEE]);
        assert.deepStrictEqual(component.events, expected);

        expected.length = 0;
        component.events.length = 0;
        const new_fee2 = sdk.Amount.divide(sdk.Amount.multiply(builder.fee_tx, 20), 100);
        const applied_fee2 = await builder.setTransactionFee(new_fee);
        assert.notDeepStrictEqual(applied_fee2.toString(), new_fee2.toString());
        assert.deepStrictEqual(component.events, expected);

        // Change Receiver Amount
        expected.length = 0;
        component.events.length = 0;

        const old_fee_tx2 = builder.fee_tx;
        const send_amount2 = sdk.Amount.divide(
            sdk.Amount.multiply(spendable, 10 + Math.floor(Math.random() * 70)),
            100
        );
        await builder.addReceiver({
            address: new sdk.PublicKey("boa1xpr00rxtcprlf99dnceuma0ftm9sv03zhtlwfytd5p0dkvzt4ryp595zpjp"),
            amount: send_amount2,
        });
        expected.push(sdk.Event.CHANGE_SENDER);
        if (!sdk.Amount.equal(old_fee_tx2, builder.fee_tx)) expected.push(sdk.Event.CHANGE_TX_FEE);
        expected.push(sdk.Event.CHANGE_RECEIVER);
        assert.deepStrictEqual(component.events, expected);
    });

    it("Test of EventDispatch for Wallet with Single Receiver", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const builder = new sdk.WalletTxBuilderSingleReceiver(wallet_client);

        makeRandomUTXO();
        accounts.clear();
        await builder.clear();
        await builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);

        key_pairs.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });

        let spendable = sdk.Amount.make(0);
        key_pairs.forEach((value, idx) => {
            const elem = sample_utxos[value.address.toString()];
            spendable = sdk.Amount.add(spendable, sdk.Amount.make(elem.balance.spendable));
        });

        const component = new FakeUIComponent(accounts, builder);

        // Add Sender
        for (const elem of accounts.items) {
            await builder.addSender(elem, elem.balance.spendable);
        }

        // Set first receiver address
        component.events.length = 0;
        await builder.setReceiverAddress(
            new sdk.PublicKey("boa1xpr00rxtcprlf99dnceuma0ftm9sv03zhtlwfytd5p0dkvzt4ryp595zpjp")
        );
        assert.strictEqual(component.events.find((m) => m === sdk.Event.CHANGE_RECEIVER) !== undefined, true);

        // Set other receiver address
        component.events.length = 0;
        await builder.setReceiverAddress(
            new sdk.PublicKey("boa1xzaq00973gwxst86hm6mxqlgr3vslsywxsfg5j9870r2c7q4kh832mnwxpa")
        );
        assert.strictEqual(component.events.find((m) => m === sdk.Event.CHANGE_RECEIVER) !== undefined, true);

        // Set same receiver address
        component.events.length = 0;
        await builder.setReceiverAddress(
            new sdk.PublicKey("boa1xzaq00973gwxst86hm6mxqlgr3vslsywxsfg5j9870r2c7q4kh832mnwxpa")
        );
        assert.strictEqual(component.events.find((m) => m === sdk.Event.CHANGE_RECEIVER) !== undefined, false);

        // Set first receiver amount
        component.events.length = 0;
        const send_amount1 = sdk.Amount.divide(
            sdk.Amount.multiply(spendable, 10 + Math.floor(Math.random() * 90)),
            100
        );
        await builder.setReceiverAmount(send_amount1);
        assert.strictEqual(component.events.find((m) => m === sdk.Event.CHANGE_RECEIVER) !== undefined, true);

        // Set other receiver amount
        component.events.length = 0;
        const send_amount2 = sdk.Amount.divide(
            sdk.Amount.multiply(spendable, 10 + Math.floor(Math.random() * 80)),
            100
        );
        await builder.setReceiverAmount(send_amount2);
        assert.strictEqual(component.events.find((m) => m === sdk.Event.CHANGE_RECEIVER) !== undefined, true);

        // Set same receiver amount
        component.events.length = 0;
        const send_amount3 = sdk.Amount.make(send_amount2);
        await builder.setReceiverAmount(send_amount3);
        assert.strictEqual(component.events.find((m) => m === sdk.Event.CHANGE_RECEIVER) !== undefined, false);
    });

    it("Store data - without receiver", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const builder = new sdk.WalletTxBuilder(wallet_client);

        const max_count = 5;
        for (let count = 0; count < max_count; count++) {
            makeRandomUTXO();
            accounts.clear();
            await builder.clear();
            await builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);
            await builder.setPayload(Buffer.from(sdk.iota(256).map((m) => m)));

            for (const key_pair of key_pairs) {
                const account = accounts.add(key_pair.address.toString(), key_pair.secret);
                if (account === undefined) continue;
                await account.checkBalance();
                await builder.addSender(account, account.balance.spendable);
            }

            const res_transaction = builder.buildTransaction();
            assert.deepStrictEqual(res_transaction.code, sdk.WalletResultCode.Success);
            assert.ok(res_transaction.data !== undefined);

            const res_overview = builder.getTransactionOverview();
            assert.deepStrictEqual(res_overview.code, sdk.WalletResultCode.Success);
            assert.ok(res_overview.data !== undefined);
        }
    });

    it("Store data - Check Event", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const builder = new sdk.WalletTxBuilder(wallet_client);
        const component = new FakeUIComponent(accounts, builder);

        makeRandomUTXO();
        await builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);
        const account = accounts.add(key_pairs[0].address.toString(), key_pairs[0].secret);
        assert.ok(account !== undefined);
        await account.checkBalance();
        await builder.addSender(account, account.balance.spendable);

        component.events.length = 0;
        await builder.setPayload(Buffer.from(sdk.iota(256).map((m) => m)));
        // Check if event CHANGE_SENDER has been received.
        assert.strictEqual(component.events.find((m) => m === sdk.Event.CHANGE_SENDER) !== undefined, true);
        // Check if event CHANGE_TX_FEE has been received.
        assert.strictEqual(component.events.find((m) => m === sdk.Event.CHANGE_TX_FEE) !== undefined, true);
        // Check if event CHANGE_PAYLOAD_FEE has been received.
        assert.strictEqual(component.events.find((m) => m === sdk.Event.CHANGE_PAYLOAD_FEE) !== undefined, true);
    });
});

describe("WalletTxBuilder - When the balance of the selected account changes,", function () {
    this.timeout(20000);

    let agora_server: TestAgora;
    let stoa_server: TestStoa;
    const agora_port: string = "2550";
    const stoa_port: string = "5550";

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

    before("Create KeyPairs", async () => {
        key_pairs = seeds.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));

        sample_utxos = {};
        for (const kp of key_pairs) {
            const address = kp.address.toString();
            sample_utxos[address] = {
                utxo: [],
                balance: {
                    address,
                    balance: "0",
                    spendable: "0",
                    frozen: "0",
                    locked: "0",
                },
            };
        }
    });

    it("Test for changing balance", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const builder = new sdk.WalletTxBuilderSingleReceiver(wallet_client);

        function addUTXO(key: sdk.KeyPair, height: number) {
            const address = key.address.toString();
            sample_utxos[address].utxo.push({
                utxo: new sdk.Hash(Buffer.from(sdk.SodiumHelper.sodium.randombytes_buf(sdk.Hash.Width))).toString(),
                type: sdk.OutputType.Payment,
                unlock_height: "1",
                amount: sdk.BOA(100),
                height: height.toString(),
                time: 0,
                lock_type: 0,
                lock_bytes: key.address.data.toString("base64"),
            });
            calcBalance(key);
        }

        function removeUTXO(key: sdk.KeyPair) {
            const address = key.address.toString();
            sample_utxos[address].utxo.shift();
            calcBalance(key);
        }

        function calcBalance(key: sdk.KeyPair) {
            const address = key.address.toString();
            const utxos: any[] = sample_utxos[address].utxo;
            const values = utxos.reduce<[sdk.JSBI, sdk.JSBI, sdk.JSBI]>(
                (prev, value) => {
                    prev[0] = sdk.JSBI.add(prev[0], sdk.JSBI.BigInt(value.amount));
                    if (value.type === 0) {
                        prev[1] = sdk.JSBI.add(prev[1], sdk.JSBI.BigInt(value.amount));
                    } else {
                        prev[2] = sdk.JSBI.add(prev[2], sdk.JSBI.BigInt(value.amount));
                    }
                    return prev;
                },
                [sdk.JSBI.BigInt(0), sdk.JSBI.BigInt(0), sdk.JSBI.BigInt(0)]
            );
            sample_utxos[address].balance.balance = values[0].toString();
            sample_utxos[address].balance.spendable = values[1].toString();
            sample_utxos[address].balance.frozen = values[2].toString();
            sample_utxos[address].balance.locked = "0";
        }

        addUTXO(key_pairs[0], 0);
        addUTXO(key_pairs[0], 1);
        addUTXO(key_pairs[1], 0);
        addUTXO(key_pairs[1], 1);

        accounts.add("Account0", key_pairs[0].secret);
        accounts.add("Account1", key_pairs[1].secret);

        await builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);

        await builder.setReceiverAddress(
            new sdk.PublicKey("boa1xpr00rxtcprlf99dnceuma0ftm9sv03zhtlwfytd5p0dkvzt4ryp595zpjp")
        );
        await builder.setReceiverAmount(sdk.BOA(350));

        for (const elem of accounts.items) {
            await builder.addSender(elem, sdk.Amount.make(0));
        }

        assert.strictEqual(builder.senders.items.length, 2);
        assert.strictEqual(builder.senders.items[0].spendable.toString(), "2000000000");
        assert.strictEqual(builder.senders.items[0].remaining.toString(), "1500254800");
        assert.strictEqual(builder.senders.items[1].spendable.toString(), "2000000000");
        assert.strictEqual(builder.senders.items[1].remaining.toString(), "0");
        assert.strictEqual(builder.remaining.toString(), "0");
        assert.strictEqual(builder.total_drawn.toString(), "3500441000");
        assert.strictEqual(builder.total_spendable.toString(), "4000000000");

        removeUTXO(key_pairs[1]);
        removeUTXO(key_pairs[1]);

        accounts.checkBalance();

        await delay(100);

        assert.strictEqual(builder.senders.items[0].spendable.toString(), "2000000000");
        assert.strictEqual(builder.senders.items[0].remaining.toString(), "1500254800");
        assert.strictEqual(builder.senders.items[1].spendable.toString(), "0");
        assert.strictEqual(builder.senders.items[1].remaining.toString(), "1500254800");
    });
});

describe("Test for the class WalletUnfreeze", function () {
    this.timeout(20000);

    let agora_server: TestAgora;
    let stoa_server: TestStoa;
    const agora_port: string = "2520";
    const stoa_port: string = "5520";

    function makeRandomFrozenUTXO() {
        const result: any = {};
        for (const kp of key_pairs) {
            const utxos: any[] = sdk.iota(0, 10).map((m: number) => {
                return {
                    utxo: new sdk.Hash(Buffer.from(sdk.SodiumHelper.sodium.randombytes_buf(sdk.Hash.Width))).toString(),
                    type: Math.random() + 0.3 > 0.5 ? 1 : 0,
                    unlock_height: (m + 2).toString(),
                    amount: sdk.BOA(10 + Math.floor(Math.random() * 10000) / 100).toString(),
                    height: (m + 1).toString(),
                    time: m,
                    lock_type: 0,
                    lock_bytes: kp.address.data.toString("base64"),
                };
            });
            const values = utxos.reduce<[sdk.JSBI, sdk.JSBI, sdk.JSBI]>(
                (prev, value) => {
                    prev[0] = sdk.JSBI.add(prev[0], sdk.JSBI.BigInt(value.amount));
                    if (value.type === 0) {
                        prev[1] = sdk.JSBI.add(prev[1], sdk.JSBI.BigInt(value.amount));
                    } else {
                        prev[2] = sdk.JSBI.add(prev[2], sdk.JSBI.BigInt(value.amount));
                    }
                    return prev;
                },
                [sdk.JSBI.BigInt(0), sdk.JSBI.BigInt(0), sdk.JSBI.BigInt(0)]
            );

            result[kp.address.toString()] = {
                utxo: utxos,
                balance: {
                    address: kp.address.toString(),
                    balance: values[0].toString(),
                    spendable: values[1].toString(),
                    frozen: values[2].toString(),
                    locked: "0",
                },
            };
        }
        sample_utxos = result;
    }

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

    before("Create KeyPairs", async () => {
        key_pairs = seeds.map((m) => sdk.KeyPair.fromSeed(new sdk.SecretKey(m)));
    });

    it("Test for the class WalletUnfreeze", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);

        const max_count = 50;
        for (let count = 0; count < max_count; count++) {
            // Make Random UTXO
            makeRandomFrozenUTXO();
            accounts.clear();
            accounts.add(key_pairs[0].address.toString(), key_pairs[0].secret);
            const account = accounts.items[accounts.items.length - 1];
            const unfreeze_builder = new sdk.WalletUnfreeze(account, wallet_client);
            await unfreeze_builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);
            const res = await account.getFrozenUTXOs();

            assert.strictEqual(res.code, sdk.WalletResultCode.Success);
            assert.ok(res.data !== undefined);

            for (const m of res.data) await unfreeze_builder.addUTXO(m.utxo);

            // Calculate sum of UTXO
            const sum = res.data.reduce<sdk.Amount>(
                (prev, value) => sdk.Amount.add(prev, value.amount),
                sdk.Amount.make(0)
            );

            // Verify amount
            assert.deepStrictEqual(sum, sdk.Amount.add(unfreeze_builder.unfreeze_amount, unfreeze_builder.fee_tx));

            // Build Transaction
            const res_builder = unfreeze_builder.buildTransaction();
            assert.deepStrictEqual(res_builder.code, sdk.WalletResultCode.Success);
            assert.ok(res_builder.data !== undefined);

            // Create Overview
            const res_overview = unfreeze_builder.getTransactionOverview();
            assert.deepStrictEqual(res_overview.code, sdk.WalletResultCode.Success);
            assert.ok(res_overview.data !== undefined);

            assert.deepStrictEqual(res_overview.data.receivers.length, 1);
            for (const sender of res_overview.data.senders) {
                assert.deepStrictEqual(sender.address, account.address);
            }
            assert.deepStrictEqual(res_overview.data.receivers[0].address, account.address);
        }
    });

    it("Test for the class WalletUnfreezeBuilder", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);

        const max_count = 50;
        for (let count = 0; count < max_count; count++) {
            // Make Random UTXO
            makeRandomFrozenUTXO();
            accounts.clear();
            accounts.add(key_pairs[0].address.toString(), key_pairs[0].secret);
            const account = accounts.items[accounts.items.length - 1];

            const unfreeze_builder = new sdk.WalletUnfreezeBuilder(wallet_client);
            await unfreeze_builder.setFeeOption(sdk.WalletTransactionFeeOption.Medium);

            assert.deepStrictEqual(unfreeze_builder.summary.items.length, 0);
            assert.deepStrictEqual(unfreeze_builder.utxos.length, 0);

            await unfreeze_builder.addSender(account);

            assert.deepStrictEqual(unfreeze_builder.utxos.length, account.frozenUTXOProvider.length);
            assert.deepStrictEqual(unfreeze_builder.summary.items.length, 0);

            let to_be_unfrozen = sdk.Amount.make(0);
            for (const m of unfreeze_builder.utxos) {
                // Select UTXO
                await unfreeze_builder.selectUTXO(m.utxo.utxo, true);
                to_be_unfrozen = sdk.Amount.add(to_be_unfrozen, m.utxo.amount);

                // Check Amount
                assert.deepStrictEqual(
                    sdk.Amount.add(unfreeze_builder.unfreeze_amount, unfreeze_builder.fee_tx).toString(),
                    to_be_unfrozen.toString()
                );

                assert.deepStrictEqual(unfreeze_builder.summary.items.length, 1);
                assert.deepStrictEqual(unfreeze_builder.summary.items[0].account, account);
                assert.deepStrictEqual(unfreeze_builder.summary.items[0].to_be_unfrozen, to_be_unfrozen);
                assert.deepStrictEqual(unfreeze_builder.summary.items[0].frozen_balance, account.balance.frozen);
                assert.deepStrictEqual(unfreeze_builder.summary.items[0].total_balance, account.balance.balance);
            }

            // Build Transaction
            const res_builder = unfreeze_builder.buildTransaction();
            assert.deepStrictEqual(res_builder.code, sdk.WalletResultCode.Success);
            assert.ok(res_builder.data !== undefined);

            // Create Overview
            const res_overview = unfreeze_builder.getTransactionOverview();
            assert.deepStrictEqual(res_overview.code, sdk.WalletResultCode.Success);
            assert.ok(res_overview.data !== undefined);

            assert.deepStrictEqual(res_overview.data.receivers.length, 1);
            for (const sender of res_overview.data.senders) {
                assert.deepStrictEqual(sender.address, account.address);
            }
            assert.deepStrictEqual(res_overview.data.receivers[0].address, account.address);
        }
    });
});
