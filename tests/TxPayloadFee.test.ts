/*******************************************************************************

    Test for TxPayloadFee

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';

describe ('TxPayloadFee', () =>
{
    let payload_fee: boasdk.TxPayloadFee;

    before('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    before('Prepare variables', () =>
    {
        payload_fee = new boasdk.TxPayloadFee();
    });

    it ('When a negative number is entered for the size of the data.', () =>
    {
        assert.throws(() => {
            payload_fee.getFee(-1);
        }, new Error("Data size cannot be negative."));
    });

    it ('When the size of the data is greater than the maximum value.', () =>
    {
        assert.throws(() => {
            payload_fee.getFee(payload_fee.TxPayloadMaxSize+1);
        }, new Error("Data size cannot be greater than maximum."));
    });

    it ('Test for TxPayloadFee.getFee()', () =>
    {
        assert.strictEqual(payload_fee.getFee(0), BigInt(0));
        assert.strictEqual(payload_fee.getFee(10), BigInt(500000));
        assert.strictEqual(payload_fee.getFee(20), BigInt(1100000));
        assert.strictEqual(payload_fee.getFee(30), BigInt(1600000));
        assert.strictEqual(payload_fee.getFee(40), BigInt(2200000));
        assert.strictEqual(payload_fee.getFee(50), BigInt(2800000));
        assert.strictEqual(payload_fee.getFee(60), BigInt(3500000));
        assert.strictEqual(payload_fee.getFee(70), BigInt(4200000));
        assert.strictEqual(payload_fee.getFee(80), BigInt(4900000));
        assert.strictEqual(payload_fee.getFee(90), BigInt(5700000));
        assert.strictEqual(payload_fee.getFee(100), BigInt(6500000));
        assert.strictEqual(payload_fee.getFee(110), BigInt(7300000));
        assert.strictEqual(payload_fee.getFee(120), BigInt(8200000));
        assert.strictEqual(payload_fee.getFee(130), BigInt(9200000));
        assert.strictEqual(payload_fee.getFee(140), BigInt(10100000));
        assert.strictEqual(payload_fee.getFee(150), BigInt(11200000));
        assert.strictEqual(payload_fee.getFee(160), BigInt(12300000));
        assert.strictEqual(payload_fee.getFee(170), BigInt(13400000));
        assert.strictEqual(payload_fee.getFee(180), BigInt(14600000));
        assert.strictEqual(payload_fee.getFee(190), BigInt(15900000));
        assert.strictEqual(payload_fee.getFee(200), BigInt(17200000));
        assert.strictEqual(payload_fee.getFee(210), BigInt(18600000));
        assert.strictEqual(payload_fee.getFee(220), BigInt(20000000));
        assert.strictEqual(payload_fee.getFee(230), BigInt(21600000));
        assert.strictEqual(payload_fee.getFee(240), BigInt(23200000));
        assert.strictEqual(payload_fee.getFee(250), BigInt(24900000));
        assert.strictEqual(payload_fee.getFee(260), BigInt(26700000));
        assert.strictEqual(payload_fee.getFee(270), BigInt(28600000));
        assert.strictEqual(payload_fee.getFee(280), BigInt(30600000));
        assert.strictEqual(payload_fee.getFee(290), BigInt(32600000));
        assert.strictEqual(payload_fee.getFee(300), BigInt(34800000));
        assert.strictEqual(payload_fee.getFee(310), BigInt(37100000));
        assert.strictEqual(payload_fee.getFee(320), BigInt(39500000));
        assert.strictEqual(payload_fee.getFee(330), BigInt(42100000));
        assert.strictEqual(payload_fee.getFee(340), BigInt(44700000));
        assert.strictEqual(payload_fee.getFee(350), BigInt(47500000));
        assert.strictEqual(payload_fee.getFee(360), BigInt(50500000));
        assert.strictEqual(payload_fee.getFee(370), BigInt(53600000));
        assert.strictEqual(payload_fee.getFee(380), BigInt(56900000));
        assert.strictEqual(payload_fee.getFee(390), BigInt(60300000));
        assert.strictEqual(payload_fee.getFee(400), BigInt(63900000));
        assert.strictEqual(payload_fee.getFee(410), BigInt(67700000));
        assert.strictEqual(payload_fee.getFee(420), BigInt(71700000));
        assert.strictEqual(payload_fee.getFee(430), BigInt(75800000));
        assert.strictEqual(payload_fee.getFee(440), BigInt(80300000));
        assert.strictEqual(payload_fee.getFee(450), BigInt(84900000));
        assert.strictEqual(payload_fee.getFee(460), BigInt(89700000));
        assert.strictEqual(payload_fee.getFee(470), BigInt(94900000));
        assert.strictEqual(payload_fee.getFee(480), BigInt(100200000));
        assert.strictEqual(payload_fee.getFee(490), BigInt(105900000));
        assert.strictEqual(payload_fee.getFee(500), BigInt(111800000));
    });
});
