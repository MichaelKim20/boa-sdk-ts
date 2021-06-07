/*******************************************************************************

    Test for UTXOManager

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';
import { BOASodium } from "boa-sodium-ts";

import * as assert from 'assert';
import JSBI from 'jsbi';

describe ('Test for UTXOManager', () =>
{
    let manager: boasdk.UTXOManager;
    let utxos: Array<boasdk.UnspentTxOutput>;

    before('Wait for the package libsodium to finish loading', () =>
    {
        boasdk.SodiumHelper.assign(new BOASodium());
        return boasdk.SodiumHelper.init();
    });

    before('Prepare variables', () =>
    {
        utxos = [
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0"),
                boasdk.OutputType.Freeze,
                JSBI.BigInt(1),
                JSBI.BigInt(10)),
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0x3451d94322524e3923fd26f0597fb8a9cdbf3a9427c38ed1ca61104796d39c5b9b5ea33d576f17c2dc17bebc5d84a0559de8c8c521dfe725d4c352255fc71e85"),
                boasdk.OutputType.Payment,
                JSBI.BigInt(2),
                JSBI.BigInt(10)),
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0xfca92fe76629311c6208a49e89cb26f5260777278cd8b272e7bb3021adf429957fd6844eb3b8ff64a1f6074126163fd636877fa92a1f4329c5116873161fbaf8"),
                boasdk.OutputType.Payment,
                JSBI.BigInt(3),
                JSBI.BigInt(10)),
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0x7e1958dbe6839d8520d65013bbc85d36d47a9f64cf608cc66c0d816f0b45f5c8a85a8990725ffbb1ab13c3c65b45fdc06f4745d455e00e1068c4c5c0b661d685"),
                boasdk.OutputType.Payment,
                JSBI.BigInt(4),
                JSBI.BigInt(10)),
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0xd44608de8a5015b04f933098fd7f67f84ffbf00c678836d38c661ab6dc1f149606bdc96bad149375e16dc5722b077b14c0a4afdbe6d30932f783650f435bcb92"),
                boasdk.OutputType.Payment,
                JSBI.BigInt(5),
                JSBI.BigInt(10)),
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0xc3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314"),
                boasdk.OutputType.Payment,
                JSBI.BigInt(6),
                JSBI.BigInt(10)),
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0x451a5b7929615121e0f2be759222853ea3acb45c94430a03de29a47db7c70e04eb4fce5b4a0c5af01d98331732546fede05fdfaf6ab429b3960aad6a20bbf0eb"),
                boasdk.OutputType.Payment,
                JSBI.BigInt(7),
                JSBI.BigInt(10)),
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0xff05579da497ac482ccd2be1851e9ff1196314e97228a1fca62e6292b5e7ea91cadca41d6afe2d57048bf594c6dd73ab1f93e96717c73c128807905e7175beeb"),
                boasdk.OutputType.Payment,
                JSBI.BigInt(8),
                JSBI.BigInt(10)),
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0xcfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2"),
                boasdk.OutputType.Payment,
                JSBI.BigInt(9),
                JSBI.BigInt(10)),
            new boasdk.UnspentTxOutput(
                new boasdk.Hash("0x37e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b"),
                boasdk.OutputType.Payment,
                JSBI.BigInt(10),
                JSBI.BigInt(10))
        ];
        manager = new boasdk.UTXOManager(utxos);
    });

    it ('Tests not adding data with the same hash of UTXO', () =>
    {
        let test_manager = new boasdk.UTXOManager([]);

        test_manager.add([utxos[0]]);
        let sum1 = test_manager.getSum();

        test_manager.add([utxos[0]]);
        let sum2 = test_manager.getSum();

        assert.deepStrictEqual(sum1, [JSBI.BigInt(0), JSBI.BigInt(10), JSBI.BigInt(0)]);
        assert.deepStrictEqual(sum1, sum2);
    });

    it ('Check the available amount.', () =>
    {
        // (unlock_height - 1 <= 1)
        let sum = manager.getSum(JSBI.BigInt(1));
        assert.deepStrictEqual(sum, [JSBI.BigInt(10), JSBI.BigInt(10), JSBI.BigInt(80)])

        sum = manager.getSum();
        assert.deepStrictEqual(sum, [JSBI.BigInt(90), JSBI.BigInt(10), JSBI.BigInt(0)])
    });

    it ('Obtain a UTXO to use - if there is enough money', () =>
    {
        let res = manager.getUTXO(JSBI.BigInt(15), JSBI.BigInt(5));
        assert.deepStrictEqual(res, [utxos[1], utxos[2]]);
    });

    it ('Obtain a UTXO to use - if there is not enough money', () =>
    {
        let sum = manager.getSum(JSBI.BigInt(10));
        assert.deepStrictEqual(sum, [JSBI.BigInt(70), JSBI.BigInt(10), JSBI.BigInt(0)])

        let res = manager.getUTXO(JSBI.add(sum[0], JSBI.BigInt(1)), JSBI.BigInt(10));
        assert.deepStrictEqual(res, []);
    });
});
