import * as boasdk from "../index";

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

(async () => {
    console.log(`Started`);
    await prepare();
    boasdk.WK.make();
    for (let key of boasdk.WK._keys)
        console.log(key.address.toString());
    console.log(`Fished`);
})();
