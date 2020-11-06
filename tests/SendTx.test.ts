import * as boasdk from '../src/index';

import * as assert from 'assert';
import URI from 'urijs';

describe ('Send Transaction', () =>
{
    let port: string = '4242';
    let agora_port: string = '4000';

    // Set URL
    let uri = URI("http://localhost").port(port);
    let agora_uri = URI("http://localhost").port(agora_port);

    // Create BOA Client
    let boa_client = new boasdk.BOAClient(uri.toString(), agora_uri.toString());

    before('Wait for the package libsodium to finish loading', (doneIt: () => void) =>
    {
        boasdk.SodiumHelper.init()
            .then(() =>
            {
                doneIt();
            })
            .catch((err: any) =>
            {
                doneIt();
            });
    });

    it ('트랜잭션 생성하기', async () =>
    {
        let gen_key = boasdk.KeyPair.fromSeed(boasdk.Seed.fromString('SCT4KKJNYLTQO4TVDPVJQZEONTVVW66YLRWAINWI3FZDY7U4JS4JJEI4'));
        let gen_address = gen_key.address.toString();
        assert.strictEqual(gen_address, "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ")
        let genesisTx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [],
            [
                new boasdk.TxOutput(BigInt("610000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("610000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("610000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("610000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("610000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("610000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("610000000000000"), boasdk.PublicKey.fromString(gen_address)),
                new boasdk.TxOutput(BigInt("610000000000000"), boasdk.PublicKey.fromString(gen_address))
            ]);
        let gen_tx_hash = boasdk.hashFull(genesisTx);

        //console.log(gen_tx_hash.toString());

        assert.strictEqual(gen_tx_hash.toString(), "0x7a5bfeb96f9caefa377cb9" +
            "a7ffe3ea3dd59ea84d4a1c66304ab8c307a4f47706fe0aec2a73ce2b186a9f4" +
            "5641620995f8c7e4c157cee7940872d96d9b2f0f95c");

        let txs1 = [];
        for (let idx = 0; idx < 8; idx++) {
            txs1.push(
                boasdk.TransactionBuilder.create(genesisTx, idx)
                    .refund(gen_key.address)
                    .sign(gen_key)
            );
        }

        console.log("send 1~8");

        for (let tx of txs1)
            await boa_client.sendTransaction(tx);

        let waitFor = (limit: number): Promise<void> => {
            return new Promise<void>((resolve) => {
                let checker = async () => {
                    let height = await boa_client.getBlockHeight();
                    if (height == limit)
                        resolve();
                    else
                        setTimeout(checker, 100);
                }
            });
        };

        console.log("waiting");

        await waitFor(1);


        let txs2 = [];
        for (let tx of txs1)
        {
            txs2.push(
                boasdk.TransactionBuilder.create(tx)
                    .refund(gen_key.address)
                    .sign(gen_key)
            );
        }

        console.log("send 9~16");

        for (let tx of txs2)
            await boa_client.sendTransaction(tx);

        console.log("waiting");

        await waitFor(2);
    });

    it ('아고라 노드의 블록높이 얻어오기', async () =>
    {
        let height = await boa_client.getBlockHeight();
        //assert.deepStrictEqual(height, 0);
        console.log(`아고라의 블록높이 = ${height}`)
    });

    it ('아고라 노드의 제네시스 블록 얻어오기', async () =>
    {
        let blocks = await boa_client.getBlocksFrom(0, 1);
        let expected =
            {
                "header":{
                    "prev_block":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "height":"0",
                    "merkle_root":"0x788c159d62b565655d9f725786c38e6802038ee73d7a9d187b3be1c7de95aa0ba856bf81bb556d7448488e71f4b89ce6eba319d0536798308112416413289254",
                    "validators":{
                        "_storage":[

                        ]
                    },
                    "signature":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                    "enrollments":[
                        {
                            "utxo_key":"0x46883e83778481d640a95fcffd6e1a1b6defeaac5a8001cd3f99e17576b809c7e9bc7a44c3917806765a5ff997366e217ff54cd4da09c0c51dc339c47052a3ac",
                            "random_seed":"0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328",
                            "cycle_length":20,
                            "enroll_sig":"0x0cab27862571d2d2e33d6480e1eab4c82195a508b72672d609610d01f23b0beedc8b89135fe3f5df9e2815b9bdb763c41b8b2dab5911e313acc82470c2147422"
                        },
                        {
                            "utxo_key":"0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                            "random_seed":"0xd0348a88f9b7456228e4df5689a57438766f4774d760776ec450605c82348c461db84587c2c9b01c67c8ed17f297ee4008424ad3e0e5039179719d7e9df297c1",
                            "cycle_length":20,
                            "enroll_sig":"0x0ed498b867c33d316b468d817ba8238aec68541abd912cecc499f8e780a8cdaf2692d0b8b04133a34716169a4b1d33d77c3e585357d8a2a2c48a772275255c01"
                        },
                        {
                            "utxo_key":"0x8c1561a4475df42afa0830da1f8a678ad4b1d82b6c610f7b03ce69b7e0fabcf537d48ecd0aee6f1cab14290a0fc6313c729edf928ff3576f8656f3b7be5670e0",
                            "random_seed":"0xaf43c67d9dd0f53de3eaede63cdcda8643422d62205df0b5af65706ec28b372adb785ce681d559d7a7137a4494ccbab4658ce11ec75a8ec84be5b73590bffceb",
                            "cycle_length":20,
                            "enroll_sig":"0x09474f489579c930dbac46f638f3202ac24407f1fa419c1d95be38ab474da29d7e3d4753b6b4ccdb35c2864be4195e83b7b8433ca1d27a57fb9f48a631001304"
                        },
                        {
                            "utxo_key":"0x94908ec79866cf54bb8e87b605e31ce0b5d7c3090f3498237d83edaca9c8ba2d3d180c572af46c1221fb81add163e14adf738df26e3679626e82113b9fe085b0",
                            "random_seed":"0xa24b7e6843220d3454523ceb7f9b43f037e56a01d2bee82958b080dc6350ebac2da12b561cbd96c6fb3f5ae5a3c8df0ac2c559ae1c45b11d42fdf866558112bc",
                            "cycle_length":20,
                            "enroll_sig":"0x0e4566eca30feb9ad47a65e7ff7e7ce1a7555ccedcf61e1143c2e5fddbec6866fd787c4518b78ab9ed73a3760741d557ac2aca631fc2796be86fcf391d3a6634"
                        },
                        {
                            "utxo_key":"0xb20da9cfbda971f3f573f55eabcd677feaf12f7948e8994a97cdf9e570799b71631e87bb9ebce0d6a402275adfb6e365fdb72139c18559a10df0e5fe4bae08eb",
                            "random_seed":"0xa0502960ddbe816729f60aeaa480c7924fb020d864deec6a9db778b8e56dd2ff8e987be748ff6ca0a43597ecb575da5d532696e376dc70bb4567b5b1fa512cb4",
                            "cycle_length":20,
                            "enroll_sig":"0x052ee1d975c49f19fd26b077740dcac399f174f40b5df1aba5f09ebea11faacfd79a36ace4d3097869dc009b8939fc83bdf940c8822c6931d5c09326aa746b31"
                        },
                        {
                            "utxo_key":"0xdb3931bd87d2cea097533d82be0a5e36c54fec8e5570790c3369bd8300c65a03d76d12a74aa38ec3e6866fd64ae56091ed3cbc3ca278ae0c8265ab699ffe2d85",
                            "random_seed":"0xdd1b9c62d4c62246ea124e5422d5a2e23d3ca9accb0eba0e46cd46708a4e7b417f46df34dc2e3cba9a57b1dc35a66dfc2d5ef239ebeaaa00299232bc7e3b7bfa",
                            "cycle_length":20,
                            "enroll_sig":"0x0e0070e5951ef5be897cb593c4c57ce28b7529463f7e5644b1314ab7cc69fd625c71e74382a24b7e644d32b0306fe3cf14ecd7de5635c70aa592f4721aa74fe2"
                        }
                    ]
                },
                "txs":[
                    {
                        "type":1,
                        "inputs":[

                        ],
                        "outputs":[
                            {
                                "value":"20000000000000",
                                "address":"GDNODE2IMTDH7SZHXWDS24EZCMYCEJMRZWB3S4HLRIUP6UNGKVVFLVHQ"
                            },
                            {
                                "value":"20000000000000",
                                "address":"GDNODE3EWQKF33TPK35DAQ3KXAYSOT4E4ACDOVJMDZQDVKP66IMJEACM"
                            },
                            {
                                "value":"20000000000000",
                                "address":"GDNODE4KTE7VQUHVBLXIGD7VEFY57X4XV547P72D37SDG7UEO7MWOSNY"
                            },
                            {
                                "value":"20000000000000",
                                "address":"GDNODE5T7TWJ2S4UQSTM7KDHU2HQHCJUXFYLPZDDYGXIBUAH3U3PJQC2"
                            },
                            {
                                "value":"20000000000000",
                                "address":"GDNODE6ZXW2NNOOQIGN24MBEZRO5226LSMHGQA3MUAMYQSTJVR7XT6GH"
                            },
                            {
                                "value":"20000000000000",
                                "address":"GDNODE7J5EUK7T6HLEO2FDUBWZEXVXHJO7C4AF5VZAKZENGQ4WR3IX2U"
                            }
                        ]
                    },
                    {
                        "type":0,
                        "inputs":[

                        ],
                        "outputs":[
                            {
                                "value":"610000000000000",
                                "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                            },
                            {
                                "value":"610000000000000",
                                "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                            },
                            {
                                "value":"610000000000000",
                                "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                            },
                            {
                                "value":"610000000000000",
                                "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                            },
                            {
                                "value":"610000000000000",
                                "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                            },
                            {
                                "value":"610000000000000",
                                "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                            },
                            {
                                "value":"610000000000000",
                                "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                            },
                            {
                                "value":"610000000000000",
                                "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                            }
                        ]
                    }
                ],
                "merkle_tree":[
                    "0x6314ce9bc41a7f5b98309c3a3d824647d7613b714c4e3ddbc1c5e9ae46db29715c83127ce259a3851363bff36af2e1e9a51dfa15c36a77c9f8eba6826ff975bc",
                    "0x7a5bfeb96f9caefa377cb9a7ffe3ea3dd59ea84d4a1c66304ab8c307a4f47706fe0aec2a73ce2b186a9f45641620995f8c7e4c157cee7940872d96d9b2f0f95c",
                    "0x788c159d62b565655d9f725786c38e6802038ee73d7a9d187b3be1c7de95aa0ba856bf81bb556d7448488e71f4b89ce6eba319d0536798308112416413289254"
                ]
            };
        assert.deepStrictEqual(blocks[0], expected);
        //console.log(`아고라의 제네시스블록 = ${JSON.stringify(blocks)}`)
    });
});
/*
let g = [
    {
        "header":{
            "prev_block":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            "height":"0",
            "merkle_root":"0x788c159d62b565655d9f725786c38e6802038ee73d7a9d187b3be1c7de95aa0ba856bf81bb556d7448488e71f4b89ce6eba319d0536798308112416413289254",
            "validators":{
                "_storage":[

                ]
            },
            "signature":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            "enrollments":[
                {
                    "utxo_key":"0x46883e83778481d640a95fcffd6e1a1b6defeaac5a8001cd3f99e17576b809c7e9bc7a44c3917806765a5ff997366e217ff54cd4da09c0c51dc339c47052a3ac",
                    "random_seed":"0x0a8201f9f5096e1ce8e8de4147694940a57a188b78293a55144fc8777a774f2349b3a910fb1fb208514fb16deaf49eb05882cdb6796a81f913c6daac3eb74328",
                    "cycle_length":20,
                    "enroll_sig":"0x0cab27862571d2d2e33d6480e1eab4c82195a508b72672d609610d01f23b0beedc8b89135fe3f5df9e2815b9bdb763c41b8b2dab5911e313acc82470c2147422"
                },
                {
                    "utxo_key":"0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    "random_seed":"0xd0348a88f9b7456228e4df5689a57438766f4774d760776ec450605c82348c461db84587c2c9b01c67c8ed17f297ee4008424ad3e0e5039179719d7e9df297c1",
                    "cycle_length":20,
                    "enroll_sig":"0x0ed498b867c33d316b468d817ba8238aec68541abd912cecc499f8e780a8cdaf2692d0b8b04133a34716169a4b1d33d77c3e585357d8a2a2c48a772275255c01"
                },
                {
                    "utxo_key":"0x8c1561a4475df42afa0830da1f8a678ad4b1d82b6c610f7b03ce69b7e0fabcf537d48ecd0aee6f1cab14290a0fc6313c729edf928ff3576f8656f3b7be5670e0",
                    "random_seed":"0xaf43c67d9dd0f53de3eaede63cdcda8643422d62205df0b5af65706ec28b372adb785ce681d559d7a7137a4494ccbab4658ce11ec75a8ec84be5b73590bffceb",
                    "cycle_length":20,
                    "enroll_sig":"0x09474f489579c930dbac46f638f3202ac24407f1fa419c1d95be38ab474da29d7e3d4753b6b4ccdb35c2864be4195e83b7b8433ca1d27a57fb9f48a631001304"
                },
                {
                    "utxo_key":"0x94908ec79866cf54bb8e87b605e31ce0b5d7c3090f3498237d83edaca9c8ba2d3d180c572af46c1221fb81add163e14adf738df26e3679626e82113b9fe085b0",
                    "random_seed":"0xa24b7e6843220d3454523ceb7f9b43f037e56a01d2bee82958b080dc6350ebac2da12b561cbd96c6fb3f5ae5a3c8df0ac2c559ae1c45b11d42fdf866558112bc",
                    "cycle_length":20,
                    "enroll_sig":"0x0e4566eca30feb9ad47a65e7ff7e7ce1a7555ccedcf61e1143c2e5fddbec6866fd787c4518b78ab9ed73a3760741d557ac2aca631fc2796be86fcf391d3a6634"
                },
                {
                    "utxo_key":"0xb20da9cfbda971f3f573f55eabcd677feaf12f7948e8994a97cdf9e570799b71631e87bb9ebce0d6a402275adfb6e365fdb72139c18559a10df0e5fe4bae08eb",
                    "random_seed":"0xa0502960ddbe816729f60aeaa480c7924fb020d864deec6a9db778b8e56dd2ff8e987be748ff6ca0a43597ecb575da5d532696e376dc70bb4567b5b1fa512cb4",
                    "cycle_length":20,
                    "enroll_sig":"0x052ee1d975c49f19fd26b077740dcac399f174f40b5df1aba5f09ebea11faacfd79a36ace4d3097869dc009b8939fc83bdf940c8822c6931d5c09326aa746b31"
                },
                {
                    "utxo_key":"0xdb3931bd87d2cea097533d82be0a5e36c54fec8e5570790c3369bd8300c65a03d76d12a74aa38ec3e6866fd64ae56091ed3cbc3ca278ae0c8265ab699ffe2d85",
                    "random_seed":"0xdd1b9c62d4c62246ea124e5422d5a2e23d3ca9accb0eba0e46cd46708a4e7b417f46df34dc2e3cba9a57b1dc35a66dfc2d5ef239ebeaaa00299232bc7e3b7bfa",
                    "cycle_length":20,
                    "enroll_sig":"0x0e0070e5951ef5be897cb593c4c57ce28b7529463f7e5644b1314ab7cc69fd625c71e74382a24b7e644d32b0306fe3cf14ecd7de5635c70aa592f4721aa74fe2"
                }
            ]
        },
        "txs":[
            {
                "type":1,
                "inputs":[

                ],
                "outputs":[
                    {
                        "value":"20000000000000",
                        "address":"GDNODE2IMTDH7SZHXWDS24EZCMYCEJMRZWB3S4HLRIUP6UNGKVVFLVHQ"
                    },
                    {
                        "value":"20000000000000",
                        "address":"GDNODE3EWQKF33TPK35DAQ3KXAYSOT4E4ACDOVJMDZQDVKP66IMJEACM"
                    },
                    {
                        "value":"20000000000000",
                        "address":"GDNODE4KTE7VQUHVBLXIGD7VEFY57X4XV547P72D37SDG7UEO7MWOSNY"
                    },
                    {
                        "value":"20000000000000",
                        "address":"GDNODE5T7TWJ2S4UQSTM7KDHU2HQHCJUXFYLPZDDYGXIBUAH3U3PJQC2"
                    },
                    {
                        "value":"20000000000000",
                        "address":"GDNODE6ZXW2NNOOQIGN24MBEZRO5226LSMHGQA3MUAMYQSTJVR7XT6GH"
                    },
                    {
                        "value":"20000000000000",
                        "address":"GDNODE7J5EUK7T6HLEO2FDUBWZEXVXHJO7C4AF5VZAKZENGQ4WR3IX2U"
                    }
                ]
            },
            {
                "type":0,
                "inputs":[

                ],
                "outputs":[
                    {
                        "value":"610000000000000",
                        "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                    },
                    {
                        "value":"610000000000000",
                        "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                    },
                    {
                        "value":"610000000000000",
                        "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                    },
                    {
                        "value":"610000000000000",
                        "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                    },
                    {
                        "value":"610000000000000",
                        "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                    },
                    {
                        "value":"610000000000000",
                        "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                    },
                    {
                        "value":"610000000000000",
                        "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                    },
                    {
                        "value":"610000000000000",
                        "address":"GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ"
                    }
                ]
            }
        ],
        "merkle_tree":[
            "0x6314ce9bc41a7f5b98309c3a3d824647d7613b714c4e3ddbc1c5e9ae46db29715c83127ce259a3851363bff36af2e1e9a51dfa15c36a77c9f8eba6826ff975bc",
            "0x7a5bfeb96f9caefa377cb9a7ffe3ea3dd59ea84d4a1c66304ab8c307a4f47706fe0aec2a73ce2b186a9f45641620995f8c7e4c157cee7940872d96d9b2f0f95c",
            "0x788c159d62b565655d9f725786c38e6802038ee73d7a9d187b3be1c7de95aa0ba856bf81bb556d7448488e71f4b89ce6eba319d0536798308112416413289254"
        ]
    }
];
 */