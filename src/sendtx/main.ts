import * as sdk from '../index';
import { WK } from './WK';
import * as boasdk from "../../lib";

// Create BOA Client
let boa_client = new sdk.BOAClient("http://localhost:2828/", "http://localhost:4002/");
//let boa_client = new sdk.BOAClient("http://localhost:2828/", "http://eu-002.bosagora.io:2826/");


let already_use_genesis_tx: boolean = false;


function prepare (): Promise<void>
{
    return new Promise<void>((resolve) => {
        sdk.SodiumHelper.init()
            .then(() =>
            {
                resolve();
            })
            .catch((err: any) =>
            {
                resolve();
            });
    });
}

function createTransaction (): Promise<sdk.Transaction[]>
{
    return new Promise<sdk.Transaction[]>(async (resolve) => {

        let block_height:bigint;

        try
        {
            block_height = await boa_client.getBlockHeight();
        }
        catch (ex)
        {
            block_height = BigInt(0);
        }

        // 제네시스 블럭 키의 UTXO를 가져온다.
        if (block_height == BigInt(0))
        {
            if (already_use_genesis_tx)
            {

                resolve([]);
                return;
            }
            already_use_genesis_tx = true;
            /*
            let count = 10;
            let utxos = await  boa_client.getUTXOs(WK.GenesisKey.address);
            let manager = new sdk.UTXOManager(utxos);
            let builder = new sdk.TxBuilder(WK.GenesisKey);
            let sum: bigint = manager.getSum()[0];
            console.log(`sum: ${sum}`);
            let amount = sum / BigInt(count);
            console.log(`amount: ${amount}`);
            let remain = sum - amount * BigInt(count);
            console.log(`remain: ${remain}`);
            for (let u of utxos)
                builder.addInput(u.utxo, u.amount);

            for (let idx = 0; idx < count; idx++) {
                if (idx < count-1)
                    builder.addOutput(WK.keys(idx).address, amount);
                else
                    builder.addOutput(WK.keys(idx).address, amount + remain);
            }

            resolve(builder.sign(sdk.TxType.Payment));
            */
            let count = 10;
            let utxos = await  boa_client.getUTXOs(WK.GenesisKey.address);

            let res: sdk.Transaction[] = [];
            let key_count = 0;
            for (let u of utxos)
            {
                let builder = new sdk.TxBuilder(WK.GenesisKey);
                builder.addInput(u.utxo, u.amount);

                //console.log(`utxo amount: ${u.amount}`);
                let amount = u.amount / BigInt(count);
                //console.log(`amount: ${amount}`);
                let remain = u.amount - amount * BigInt(count);
                for (let idx = 0; idx < count; idx++)
                {
                    //console.log(`${WK.GenesisKey.address.toString()} -> ${WK.keys(key_count).address.toString()}`)
                    if (idx < count - 1)
                        builder.addOutput(WK.keys(key_count).address, amount);
                    else
                        builder.addOutput(WK.keys(key_count).address, amount + remain);
                    key_count++;
                }
                let payload = Buffer.alloc(600);
                for (let i = 0; i < payload.length; i++)
                    payload[i] = i % 256;
                //let vote_data = new sdk.DataPayload("0x617461642065746f76");
                //builder.assignPayload(vote_data)
                res.push(builder.sign(sdk.TxType.Payment));
            }
            resolve(res);
        }
        else {
            let key_count = 80;
            let tx: sdk.Transaction;

            let res: sdk.Transaction[] = [];
            let idx: number = 0;
            let sources: Array<number> = [];
            while (idx < 8)
            {
                let source = Math.floor(Math.random() * key_count);
                while (sources.find(value => value == source) !== undefined)
                    source = Math.floor(Math.random() * key_count);
                sources.push(source);

                let destination = Math.floor(Math.random() * key_count);
                while (source === destination)
                    destination = Math.floor(Math.random() * key_count);
                let source_key_pair = WK.keys(source);
                let destination_key_pair = WK.keys(destination);

                //console.log(`${source_key_pair.address.toString()} -> ${destination_key_pair.address.toString()}`)

                let utxos = await boa_client.getUTXOs(source_key_pair.address);
                let builder = new sdk.TxBuilder(source_key_pair);
                let utxo_manager = new sdk.UTXOManager(utxos);

                let send_amount = BigInt(10000000) * BigInt(Math.floor(Math.random() * 1000));
                // Get UTXO for the amount to need.
                let spent_utxos = utxo_manager.getUTXO(send_amount, block_height);

                if (spent_utxos.length > 0)
                {
                    spent_utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));
                    tx = builder
                        .addOutput(destination_key_pair.address, send_amount)
                        .sign(sdk.TxType.Payment);
                    res.push(tx);
                    idx++
                }
            }
            resolve(res);
        }
    });
}

function createTransaction2 (): Promise<sdk.Transaction[]>
{
    return new Promise<sdk.Transaction[]>(async (resolve) => {

        let block_height:bigint;

        try
        {
            block_height = await boa_client.getBlockHeight();
        }
        catch (ex)
        {
            block_height = BigInt(0);
        }

        // 제네시스 블럭 키의 UTXO를 가져온다.
        if (block_height == BigInt(0))
        {
            if (already_use_genesis_tx)
            {
                resolve([]);
                return;
            }
            already_use_genesis_tx = true;
            let res: sdk.Transaction[] = [];
            let key_count = 1000;
            let utxos = await  boa_client.getUTXOs(WK.GenesisKey.address);
            let manager = new sdk.UTXOManager(utxos);
            let builder = new sdk.TxBuilder(WK.GenesisKey);
            let sum: bigint = manager.getSum()[0];
            console.log(`sum: ${sum}`);
            let amount = sum / BigInt(key_count);
            console.log(`amount: ${amount}`);
            let remain = sum - amount * BigInt(key_count);
            console.log(`remain: ${remain}`);
            for (let u of utxos)
                builder.addInput(u.utxo, u.amount);

            for (let idx = 0; idx < key_count; idx++) {
                if (idx < key_count-1)
                    builder.addOutput(WK.keys(idx % key_count).address, amount);
                else
                    builder.addOutput(WK.keys(idx % key_count).address, amount + remain);
            }
            let payload = Buffer.alloc(600);
            for (let i = 0; i < payload.length; i++)
                payload[i] = i % 256;
            let vote_data = new sdk.DataPayload(payload);
            builder.assignPayload(vote_data)
            res.push(builder.sign(sdk.TxType.Payment));

            resolve(res);
        }
        else {
            let key_count = 80;
            let tx: sdk.Transaction;

            let res: sdk.Transaction[] = [];
            let idx: number = 0;
            let sources: Array<number> = [];
            while (idx < 8)
            {
                let source = Math.floor(Math.random() * key_count);
                while (sources.find(value => value == source) !== undefined)
                    source = Math.floor(Math.random() * key_count);
                sources.push(source);

                let destination = Math.floor(Math.random() * key_count);
                while (source === destination)
                    destination = Math.floor(Math.random() * key_count);
                let source_key_pair = WK.keys(source);
                let destination_key_pair = WK.keys(destination);

                //console.log(`${source_key_pair.address.toString()} -> ${destination_key_pair.address.toString()}`)

                let utxos = await boa_client.getUTXOs(source_key_pair.address);
                let builder = new sdk.TxBuilder(source_key_pair);
                let utxo_manager = new sdk.UTXOManager(utxos);

                let send_amount = BigInt(10000000) * BigInt(Math.floor(Math.random() * 1000));
                // Get UTXO for the amount to need.
                let spent_utxos = utxo_manager.getUTXO(send_amount, block_height);

                if (spent_utxos.length > 0)
                {
                    spent_utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));
                    tx = builder
                        .addOutput(destination_key_pair.address, send_amount)
                        .sign(sdk.TxType.Payment);
                    res.push(tx);
                    idx++
                }
            }
            resolve(res);
        }
    });
}


function createTransaction3 (): Promise<sdk.Transaction[]>
{
    return new Promise<sdk.Transaction[]>(async (resolve) => {

        let block_height:bigint;

        try
        {
            block_height = await boa_client.getBlockHeight();
        }
        catch (ex)
        {
            block_height = BigInt(0);
        }

        // 제네시스 블럭 키의 UTXO를 가져온다.
        if (block_height == BigInt(0))
        {
            if (already_use_genesis_tx)
            {
                resolve([]);
                return;
            }
            already_use_genesis_tx = true;
            let res: sdk.Transaction[] = [];
            let key_count = 10;
            let utxos = await  boa_client.getUTXOs(WK.GenesisKey.address);
            let manager = new sdk.UTXOManager(utxos);
            let builder = new sdk.TxBuilder(WK.GenesisKey);

            let payload = Buffer.alloc(600);
            for (let i = 0; i < payload.length; i++)
                payload[i] = i % 256;
            let vote_data = new sdk.DataPayload(payload);
            let fee = sdk.TxPayloadFee.getFee(vote_data.data.length);

            let sum: bigint = manager.getSum()[0];
            console.log(`sum: ${sum}`);
            let amount = (sum - fee) / BigInt(key_count);
            console.log(`amount: ${amount}`);
            let remain = (sum - fee) - amount * BigInt(key_count);
            console.log(`remain: ${remain}`);
            for (let u of utxos)
                builder.addInput(u.utxo, u.amount);

            builder.assignPayload(vote_data);

            for (let idx = 0; idx < key_count; idx++) {
                if (idx < key_count-1)
                    builder.addOutput(WK.keys(idx % key_count).address, amount);
                else
                    builder.addOutput(WK.keys(idx % key_count).address, amount + remain);
            }
            let tx = builder.sign(sdk.TxType.Payment, BigInt(0), fee);
            console.log(JSON.stringify(tx));
            //console.log(sdk.hashFull(tx).toString());
            //console.log(`TX_HASH (createTransaction3) : ${sdk.hashFull(tx).toString()}`);
            res.push(tx);

            resolve(res);
        }
        else {
            let key_count = 10;
            let tx: sdk.Transaction;

            let res: sdk.Transaction[] = [];
            let idx: number = 0;
            let sources: Array<number> = [];
            while (idx < 8)
            {
                let source = Math.floor(Math.random() * key_count);
                while (sources.find(value => value == source) !== undefined)
                    source = Math.floor(Math.random() * key_count);
                sources.push(source);

                let destination = Math.floor(Math.random() * key_count);
                while (source === destination)
                    destination = Math.floor(Math.random() * key_count);
                let source_key_pair = WK.keys(source);
                let destination_key_pair = WK.keys(destination);

                //console.log(`${source_key_pair.address.toString()} -> ${destination_key_pair.address.toString()}`)

                let utxos = await boa_client.getUTXOs(source_key_pair.address);
                let builder = new sdk.TxBuilder(source_key_pair);
                let utxo_manager = new sdk.UTXOManager(utxos);

                let send_amount = BigInt(10000000) * BigInt(Math.floor(Math.random() * 1000));
                // Get UTXO for the amount to need.
                let spent_utxos = utxo_manager.getUTXO(send_amount, block_height);

                if (spent_utxos.length > 0)
                {
                    spent_utxos.forEach((u: sdk.UnspentTxOutput) => builder.addInput(u.utxo, u.amount));
                    tx = builder
                        .addOutput(destination_key_pair.address, send_amount)
                        .sign(sdk.TxType.Payment);
                    res.push(tx);
                    idx++
                }
            }
            resolve(res);
        }
    });
}

function wait (interval: number): Promise<void>
{
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, interval)
    })
}

function makeBlock(): Promise<void>
{
    return new Promise<void>(async (resolve) =>
    {
        console.log(`Started`);

        let height = await boa_client.getBlockHeight();
        console.log(`Current height is ${height}`);

        let txs = await createTransaction3();

        if (txs.length === 0) {
            await wait(5000);
        } else {
            for (let tx of txs) {
                //console.log(JSON.stringify(tx));
                console.log(`TX_HASH (send) : ${sdk.hashFull(tx).toString()}`);
                try {
                    await boa_client.sendTransaction(tx);
                } catch (e)
                {
                    console.log(e);
                }
                await wait(15000);
            }
        }

        console.log(`Fished`);

        resolve();
    });
}

(async () => {
    await prepare();
    WK.make();
    for (let idx = 0; idx < 1000; idx++)
    {
        await makeBlock();
    }
})();
