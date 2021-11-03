/*******************************************************************************

    Test of the class WalletWatcher

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

// tslint:disable-next-line:no-implicit-dependencies
import { Socket } from "socket.io";

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

interface IWatchEvent {
    type: string;
    address?: string;
    height?: number;
}

/**
 * A class that optionally delivers real-time events to only one client who subscribed.
 */
class WalletWatcherIO {
    public io: Socket;
    private tables: Map<string, Socket[]> = new Map<string, Socket[]>();
    private ping: Map<string, number> = new Map<string, number>();
    public height: number;
    constructor(server: http.Server) {
        this.height = 0;
        // tslint:disable-next-line:no-implicit-dependencies
        this.io = require("socket.io")(server, {
            cors: {
                origin: "*",
                methods: ["GET"],
                allowedHeaders: true,
                credentials: true,
            },
        });
        this.io.on("connection", this.onConnection.bind(this));
    }

    private onConnection(socket: Socket) {
        this.ping.set(socket.id, new Date().getTime());

        socket.on("subscribe", (data: { address: string }) => {
            this.ping.set(socket.id, new Date().getTime());
            const values = this.tables.get(data.address);
            if (values === undefined) this.tables.set(data.address, [socket]);
            else {
                if (values.find((m) => m === socket) === undefined) values.push(socket);
            }
        });

        socket.on("unsubscribe", (data: { address: string }) => {
            this.ping.set(socket.id, new Date().getTime());
            const values = this.tables.get(data.address);
            if (values !== undefined) {
                const found = values.findIndex((m) => m === socket);
                if (found >= 0) values.splice(found, 1);
            }
        });

        socket.on("ping", (data: any) => {
            this.ping.set(socket.id, new Date().getTime());
        });

        socket.on("disconnect", () => {
            this.tables.forEach((values, key) => {
                const found_idx = values.findIndex((m) => m === socket);
                if (found_idx >= 0) values.splice(found_idx, 1);
            });
        });
    }

    /**
     * When a new block occurs, an event occurs.
     * @param height
     */
    public onNewBlock(height: number) {
        this.height = height;
        const values = this.tables.get("block");
        if (values !== undefined) {
            for (const elem of values) {
                try {
                    elem.emit("new_block", { height });
                } catch (e) {
                    //
                }
            }
        }
    }

    /**
     * An event occurs when the account's UTXO is consumed.
     */
    public onNewTransactionAccount(address: string) {
        const values = this.tables.get(address);
        if (values !== undefined) {
            values.forEach((m) => m.emit("new_tx_acc", { address }));
        }
    }
}

/**
 * This allows data transfer and reception testing with the server.
 */
class FakeStoa {
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
     * The instance of WalletWatcherIO
     * @protected
     */
    protected _watcher_io: WalletWatcherIO | null = null;

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

        // GET /block_height
        this.app.get("/block_height", (req: express.Request, res: express.Response) => {
            res.status(200).send(this.socket.height.toString());
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

        this.app.set("port", this.port);

        // Listen on provided this.port on this.address.
        return new Promise<void>((resolve, reject) => {
            // Create HTTP server.
            this.server = http.createServer(this.app);
            this.server.on("error", reject);
            this.server.listen(this.port, () => {
                if (this.server) this._watcher_io = new WalletWatcherIO(this.server);
                resolve();
            });
        });
    }

    public get socket(): WalletWatcherIO {
        if (this._watcher_io !== null) return this._watcher_io;
        else process.exit(1);
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

    public sendWatchEvent(events: IWatchEvent[]) {
        let idx = 0;

        const _emit = () => {
            if (idx >= events.length) return;
            const elem = events[idx];
            if (elem.type === "block" && elem.height !== undefined) {
                this.socket.onNewBlock(elem.height);
            }
            if (elem.type === "transaction" && elem.address !== undefined) {
                this.socket.onNewTransactionAccount(elem.address);
            }
            idx++;

            setTimeout(_emit.bind(this), 100);
        };
        setTimeout(_emit.bind(this), 1000);
    }
}

/**
 * This is an Agora node for testing.
 */
class FakeAgora {
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

describe("Wallet Watcher ", function () {
    this.timeout(8000);

    let agora_server: FakeAgora;
    let stoa_server: FakeStoa;
    const agora_port: string = "2610";
    const stoa_port: string = "5610";

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
        stoa_server = new FakeStoa(stoa_port);
        await stoa_server.start();
    });

    before("Start TestAgora", async () => {
        agora_server = new FakeAgora(agora_port);
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

    it("Test for event of new blocks", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const watcher = new sdk.WalletWatcher(accounts, wallet_client);
        const WatchEvents: { event: string; value: string }[] = [];
        await watcher.initialize();

        watcher.addEventListener(sdk.Event.NEW_BLOCK, (type: string, height: number) => {
            WatchEvents.push({
                event: sdk.Event.NEW_BLOCK,
                value: height.toString(),
            });
        });

        const test_data: IWatchEvent[] = [
            {
                type: "block",
                height: 1,
            },
            {
                type: "block",
                height: 2,
            },
            {
                type: "block",
                height: 3,
            },
        ];

        stoa_server.sendWatchEvent(test_data);

        await delay(2000);

        // Events for all accounts are delivered.
        assert.deepStrictEqual(WatchEvents, [
            {
                event: "new_block",
                value: "1",
            },
            {
                event: "new_block",
                value: "2",
            },
            {
                event: "new_block",
                value: "3",
            },
        ]);

        watcher.finalize();
    });

    it("Test for event of new transactions", async () => {
        const endpoint = {
            agora: URI("http://localhost").port(agora_port).toString(),
            stoa: URI("http://localhost").port(stoa_port).toString(),
        };

        const wallet_client = new sdk.WalletClient(endpoint);
        const accounts = new sdk.AccountContainer(wallet_client);
        const watcher = new sdk.WalletWatcher(accounts, wallet_client);
        const WatchEvents: { event: string; value: string }[] = [];
        await watcher.initialize();

        watcher.addEventListener(sdk.Event.NEW_TRANSACTION, (type: string, account: sdk.Account) => {
            WatchEvents.push({
                event: sdk.Event.NEW_TRANSACTION,
                value: account.address.toString(),
            });
        });

        // When an account is added, a watcher of the account is registered on the server.
        key_pairs.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });

        // A virtual event for data that will occur on the server.
        const test_data: IWatchEvent[] = [
            {
                type: "transaction",
                address: "boa1xzcd00f8jn36mzppkue6w3gpt2ufevulupaa5a8f9uc0st8uh68jyak7p64",
            },
            {
                type: "transaction",
                address: "boa1xqam00nfz03mv4jr80c7wr4hd2zqtgezr9kysgjqg3gdz7ygyutvylhhwlx",
            },
            {
                type: "transaction",
                address: "boa1xzce00jfyy7jxukasfx8xndpx2l8mcyf2kmcfrvux9800pdj2670q5htf0e",
            },
            {
                type: "transaction",
                address: "boa1xpcq00pz4md60d06vukmw8mj7xseslt3spu7sp6daz36dt7eg5q35m8ehhc",
            },
            {
                type: "transaction",
                address: "boa1xrap00gy9ttpvhk9hfz5vhwuy430ua7td88exhq2rx9lm3l6sgfeqzaeew9",
            },
            {
                type: "transaction",
                address: "boa1xpazy00l0n5wkxz340jmkfew5s4jc2hpfal405u6cslng6djj688vzfsxfr",
            },
            {
                type: "transaction",
                address: "boa1xqs00rejsuwmlreljp8k2c0k7q8cmkgxx76m6tc9f8j2s97vsvw4gzyhdcq",
            },
            {
                type: "transaction",
                address: "boa1xpt00hv2rrlrm56pq70dukq4trlrfveqwna20su7457dnrl33xkrua6s5tf",
            },
            {
                type: "transaction",
                address: "boa1xzu00x9m4u5ke9uav3v5vxr9pmfdcxc6qmzw3ht7kk20cckyc7uzusk2zah",
            },
            {
                type: "transaction",
                address: "boa1xzv00g8k23usvepjkqhf3xzp7r5d6crync0klk6zakwl3y8eh47hgjct2py",
            },
        ];

        // The server generates an event with a certain liver.
        stoa_server.sendWatchEvent(test_data);

        await delay(2000);

        // Events for all accounts are delivered.
        assert.deepStrictEqual(WatchEvents, [
            {
                event: "new_transaction",
                value: "boa1xzcd00f8jn36mzppkue6w3gpt2ufevulupaa5a8f9uc0st8uh68jyak7p64",
            },
            {
                event: "new_transaction",
                value: "boa1xqam00nfz03mv4jr80c7wr4hd2zqtgezr9kysgjqg3gdz7ygyutvylhhwlx",
            },
            {
                event: "new_transaction",
                value: "boa1xzce00jfyy7jxukasfx8xndpx2l8mcyf2kmcfrvux9800pdj2670q5htf0e",
            },
            {
                event: "new_transaction",
                value: "boa1xpcq00pz4md60d06vukmw8mj7xseslt3spu7sp6daz36dt7eg5q35m8ehhc",
            },
            {
                event: "new_transaction",
                value: "boa1xrap00gy9ttpvhk9hfz5vhwuy430ua7td88exhq2rx9lm3l6sgfeqzaeew9",
            },
            {
                event: "new_transaction",
                value: "boa1xpazy00l0n5wkxz340jmkfew5s4jc2hpfal405u6cslng6djj688vzfsxfr",
            },
            {
                event: "new_transaction",
                value: "boa1xqs00rejsuwmlreljp8k2c0k7q8cmkgxx76m6tc9f8j2s97vsvw4gzyhdcq",
            },
            {
                event: "new_transaction",
                value: "boa1xpt00hv2rrlrm56pq70dukq4trlrfveqwna20su7457dnrl33xkrua6s5tf",
            },
            {
                event: "new_transaction",
                value: "boa1xzu00x9m4u5ke9uav3v5vxr9pmfdcxc6qmzw3ht7kk20cckyc7uzusk2zah",
            },
            {
                event: "new_transaction",
                value: "boa1xzv00g8k23usvepjkqhf3xzp7r5d6crync0klk6zakwl3y8eh47hgjct2py",
            },
        ]);

        // When the account is removed, the registered subscription to the server is released.
        accounts.remove("Account0");
        accounts.remove("Account2");
        accounts.remove("Account4");
        accounts.remove("Account6");
        accounts.remove("Account8");

        WatchEvents.length = 0;

        stoa_server.sendWatchEvent(test_data);

        await delay(2000);

        // Events for the removed account are not delivered.
        assert.deepStrictEqual(WatchEvents, [
            {
                event: "new_transaction",
                value: "boa1xqam00nfz03mv4jr80c7wr4hd2zqtgezr9kysgjqg3gdz7ygyutvylhhwlx",
            },
            {
                event: "new_transaction",
                value: "boa1xpcq00pz4md60d06vukmw8mj7xseslt3spu7sp6daz36dt7eg5q35m8ehhc",
            },
            {
                event: "new_transaction",
                value: "boa1xpazy00l0n5wkxz340jmkfew5s4jc2hpfal405u6cslng6djj688vzfsxfr",
            },
            {
                event: "new_transaction",
                value: "boa1xpt00hv2rrlrm56pq70dukq4trlrfveqwna20su7457dnrl33xkrua6s5tf",
            },
            {
                event: "new_transaction",
                value: "boa1xzv00g8k23usvepjkqhf3xzp7r5d6crync0klk6zakwl3y8eh47hgjct2py",
            },
        ]);

        watcher.finalize();
    });
});
