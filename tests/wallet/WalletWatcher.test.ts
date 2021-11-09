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
    address: string;
    tx_hash: string;
    type: string;
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
     * An event occurs when the account's UTXO is consumed.
     */
    public onNewTransactionAccount(address: string, tx_hash: string, type: string) {
        const values = this.tables.get(address);
        if (values !== undefined) {
            values.forEach((m) => m.emit("new_tx_acc", { address, tx_hash, type }));
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
            this.socket.onNewTransactionAccount(elem.address, elem.tx_hash, elem.type);
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
    this.timeout(10000);

    let agora_server: FakeAgora;
    let stoa_server: FakeStoa;
    const agora_port: string = "2620";
    const stoa_port: string = "5620";

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

        watcher.addEventListener(sdk.Event.NEW_TRANSACTION, (type: string, data: any) => {
            WatchEvents.push(data);
        });

        // When an account is added, a watcher of the account is registered on the server.
        key_pairs.forEach((value, idx) => {
            accounts.add("Account" + idx.toString(), value.secret);
        });

        // A virtual event for data that will occur on the server.
        const test_data: IWatchEvent[] = [
            {
                address: "boa1xzcd00f8jn36mzppkue6w3gpt2ufevulupaa5a8f9uc0st8uh68jyak7p64",
                tx_hash:
                    "0x210f6551d648a4da654da116b100e941e434e4f232b8579439c2ef64b04819bd2782eb3524c7a29c38c347cdf26006bccac54a58a58f103ae7eb5b252eb53b64",
                type: "pending",
            },
            {
                address: "boa1xqam00nfz03mv4jr80c7wr4hd2zqtgezr9kysgjqg3gdz7ygyutvylhhwlx",
                tx_hash:
                    "0xcfc5b09bc53136c1691e0991ffae7f2657bba248da07fb153ddf08a5109ce1c7d38206bfab6da57d70c428286d65081db992fbade6c67b97c62e9cb2862433e1",
                type: "pending",
            },
            {
                address: "boa1xzce00jfyy7jxukasfx8xndpx2l8mcyf2kmcfrvux9800pdj2670q5htf0e",
                tx_hash:
                    "0x018389f5876ebac77ad4c2269415bf8a5b14e2374e9d30a933f70a10abbca2a4035ec0640ba07ea8b39416e65ff66d373e25265ce78541b582ac34f2e625fb90",
                type: "pending",
            },
            {
                address: "boa1xpcq00pz4md60d06vukmw8mj7xseslt3spu7sp6daz36dt7eg5q35m8ehhc",
                tx_hash:
                    "0x3b44d65edb3361dd91441ab4f449eeda55644026624c4b8ae12ecf0264fa8a228dbf672ef97e2c4f87fb98ad7099e17b7f9ba7dbe8479672066912b1ea24ba77",
                type: "pending",
            },
            {
                address: "boa1xrap00gy9ttpvhk9hfz5vhwuy430ua7td88exhq2rx9lm3l6sgfeqzaeew9",
                tx_hash:
                    "0xff4e39063d315690608429a08b1b74c4a32c9f1529f1d9a3243ece4227765e98c564da4f8b083494c1b542ffb375b0dfa600be83653a5854d274602533a6d698",
                type: "pending",
            },
            {
                address: "boa1xpazy00l0n5wkxz340jmkfew5s4jc2hpfal405u6cslng6djj688vzfsxfr",
                tx_hash:
                    "0xe3f959407fe99cb23f352be4477bbef8f619a11283319192418ac869eeb204060facc7e99186a09d9d6aa951d548e6ab228196f96ec104ae2f94741efa760344",
                type: "pending",
            },
            {
                address: "boa1xqs00rejsuwmlreljp8k2c0k7q8cmkgxx76m6tc9f8j2s97vsvw4gzyhdcq",
                tx_hash:
                    "0x7bacc99e9bf827f0fa6dc6a77303d2e6ba6f1591277b896a9305a9e200853986fe9527fd551077a4ac2b511633ada4190a7b82cddaf606171336e1efba87ea8f",
                type: "pending",
            },
            {
                address: "boa1xpt00hv2rrlrm56pq70dukq4trlrfveqwna20su7457dnrl33xkrua6s5tf",
                tx_hash:
                    "0x375eefbe1990a6e37b2f9a11b1ba68e3c8f8d0976f51a5de55e4d58a6798cd4f023fe780113d551a9afe61f6f56ee0a93fe8752ba92869103b8a1aaa6c8b89e5",
                type: "confirm",
            },
            {
                address: "boa1xzu00x9m4u5ke9uav3v5vxr9pmfdcxc6qmzw3ht7kk20cckyc7uzusk2zah",
                tx_hash:
                    "0xe0dce92ebd44c6398e582e5439dfe03a08a0cb9c45075f6ecbe1edac3bcacf201baddc9c522415eb2f8033f263122becaa7fc078aa2423d39de05df7eaa27c3e",
                type: "confirm",
            },
            {
                address: "boa1xzv00g8k23usvepjkqhf3xzp7r5d6crync0klk6zakwl3y8eh47hgjct2py",
                tx_hash:
                    "0xa72ed0e4b392632c51a923a79b319d9db6c5269319bb94ecff4588c18d0a9a1c0c754ea4dbea99c0386afb8bfae9a65d5c9ed0fe7ddba53521badbc957271e81",
                type: "confirm",
            },
        ];

        // The server generates an event with a certain liver.
        stoa_server.sendWatchEvent(test_data);

        await delay(2000);

        // Events for all accounts are delivered.
        assert.deepStrictEqual(WatchEvents, test_data);

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
                address: "boa1xqam00nfz03mv4jr80c7wr4hd2zqtgezr9kysgjqg3gdz7ygyutvylhhwlx",
                tx_hash:
                    "0xcfc5b09bc53136c1691e0991ffae7f2657bba248da07fb153ddf08a5109ce1c7d38206bfab6da57d70c428286d65081db992fbade6c67b97c62e9cb2862433e1",
                type: "pending",
            },
            {
                address: "boa1xpcq00pz4md60d06vukmw8mj7xseslt3spu7sp6daz36dt7eg5q35m8ehhc",
                tx_hash:
                    "0x3b44d65edb3361dd91441ab4f449eeda55644026624c4b8ae12ecf0264fa8a228dbf672ef97e2c4f87fb98ad7099e17b7f9ba7dbe8479672066912b1ea24ba77",
                type: "pending",
            },
            {
                address: "boa1xpazy00l0n5wkxz340jmkfew5s4jc2hpfal405u6cslng6djj688vzfsxfr",
                tx_hash:
                    "0xe3f959407fe99cb23f352be4477bbef8f619a11283319192418ac869eeb204060facc7e99186a09d9d6aa951d548e6ab228196f96ec104ae2f94741efa760344",
                type: "pending",
            },
            {
                address: "boa1xpt00hv2rrlrm56pq70dukq4trlrfveqwna20su7457dnrl33xkrua6s5tf",
                tx_hash:
                    "0x375eefbe1990a6e37b2f9a11b1ba68e3c8f8d0976f51a5de55e4d58a6798cd4f023fe780113d551a9afe61f6f56ee0a93fe8752ba92869103b8a1aaa6c8b89e5",
                type: "confirm",
            },
            {
                address: "boa1xzv00g8k23usvepjkqhf3xzp7r5d6crync0klk6zakwl3y8eh47hgjct2py",
                tx_hash:
                    "0xa72ed0e4b392632c51a923a79b319d9db6c5269319bb94ecff4588c18d0a9a1c0c754ea4dbea99c0386afb8bfae9a65d5c9ed0fe7ddba53521badbc957271e81",
                type: "confirm",
            },
        ]);

        watcher.finalize();
    });
});
