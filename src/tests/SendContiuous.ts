import * as boasdk from '../index';

// Create BOA Client
let boa_client = new boasdk.BOAClient("http://localhost:4242/", "http://localhost:4000/");

function prepare (): Promise<void>
{
    return new Promise<void>((resolve) => {
        boasdk.SodiumHelper.init()
            .then(() =>
            {
                resolve();
            })
            .catch((err: any) =>
            {
                resolve();
            });
    })
}

function waitFor (limit: number): Promise<void>
{
    return new Promise<void>(async (resolve) => {
        let checker = async () => {
            let height = await boa_client.getBlockHeight();
            if (height == limit)
            {
                console.log(`Height is ${height}`);
                resolve();
            } else {
                //console.log(`Height is ${height}`);
                setTimeout(checker, 100);
            }
        };
        await checker()
    });
}

function createTransaction (height: number): Array<boasdk.Transaction>
{
    let txs1: Array<boasdk.Transaction> = [];
    for (let idx = 0; idx < 8; idx++) {
        txs1.push(
            boasdk.TransactionBuilder.create(boasdk.GenesisTx(), idx)
                .refund(boasdk.WK.keys(idx).address)
                .sign()
        );
    }

    if (height == 1)
        return txs1;

    let txs2: Array<boasdk.Transaction> = [];
    for (let h = 1; h < height; h++)
    {
        for (let idx = 0; idx < txs1.length; idx++) {
            txs2.push(
                boasdk.TransactionBuilder.create(txs1[idx])
                    .refund(boasdk.WK.keys(idx + 8*(h%2)).address)
                    .sign()
            );
        }
        txs1 = txs2;
        txs2 = [];
    }
    return txs1;
}
/*
if (process.argv.length < 3)
    process.exit(1);

let height = Number(process.argv[2]);
*/

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
    return new Promise<void>(async (resolve) => {
        console.log(`Started`);
        await prepare();
        let height = await boa_client.getBlockHeight();

        console.log(`Current height is ${height}`);
        let txs = createTransaction(height + 1);

        console.log(`Send for height is ${height + 1}`);
        for (let idx = 0; idx < txs.length; idx++) {
            console.log(`${idx + 1}th transactions`);
            console.log(JSON.stringify({"tx": txs[idx].toObject()}));
            await boa_client.sendTransaction(txs[idx]);
            await wait(15000);
        }

        await waitFor(height + 1);
        console.log(`Fished`);

        resolve();
    });
}

(async () => {
    for (let idx = 0; idx < 100; idx++)
        await makeBlock();
})();