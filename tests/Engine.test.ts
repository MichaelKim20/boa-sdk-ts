/*******************************************************************************

     Test for Engine

     Copyright:
         Copyright (c) 2020 BOS Platform Foundation Korea
         All rights reserved.

     License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as sdk from '../lib';

import * as assert from 'assert';

describe ('Test Engine', () =>
{
    const TestStackMaxTotalSize = 16_384;
    const TestStackMaxItemSize = 512;

    before('Wait for the package libsodium to finish loading', () =>
    {
        return sdk.SodiumHelper.init();
    });

    it ('Engine', () =>
    {
        const engine = new sdk.Engine(TestStackMaxTotalSize, TestStackMaxItemSize);
        let res = engine.execute(
            new sdk.Lock(sdk.LockType.Script, Buffer.from([sdk.OP.DUP])),
            new sdk.Unlock(""),
            new sdk.Transaction(0, [], [], new sdk.DataPayload(Buffer.alloc(0))),
            new sdk.TxInput(new sdk.Hash(Buffer.alloc(sdk.Hash.Width))));
        assert.strictEqual(res, "DUP opcode requires an item on the stack");

        res = engine.execute(
            new sdk.Lock(sdk.LockType.Script, Buffer.from([1, 2, sdk.OP.CHECK_EQUAL])),
            new sdk.Unlock(""),
            new sdk.Transaction(0, [], [], new sdk.DataPayload(Buffer.alloc(0))),
            new sdk.TxInput(new sdk.Hash(Buffer.alloc(sdk.Hash.Width))));
        assert.strictEqual(res, "CHECK_EQUAL opcode requires two items on the stack");

        res = engine.execute(
            new sdk.Lock(sdk.LockType.Script, Buffer.from([1, 1, sdk.OP.DUP, sdk.OP.CHECK_EQUAL])),
            new sdk.Unlock(""),
            new sdk.Transaction(0, [], [], new sdk.DataPayload(Buffer.alloc(0))),
            new sdk.TxInput(new sdk.Hash(Buffer.alloc(sdk.Hash.Width))));
        assert.strictEqual(res, "");
    });

    it ('OP.CHECK_EQUAL', () =>
    {
        const engine = new sdk.Engine(TestStackMaxTotalSize, TestStackMaxItemSize);
        const tx = new sdk.Transaction(0, [], [], new sdk.DataPayload(Buffer.alloc(0)));

        let res = engine.execute(
            new sdk.Lock(sdk.LockType.Script, Buffer.from([sdk.OP.CHECK_EQUAL])),
            new sdk.Unlock(""),
            tx,
            new sdk.TxInput(new sdk.Hash(Buffer.alloc(sdk.Hash.Width))));
        assert.strictEqual(res, "CHECK_EQUAL opcode requires two items on the stack");

        res = engine.execute(
            new sdk.Lock(sdk.LockType.Script, Buffer.from([1, 1, sdk.OP.CHECK_EQUAL])),
            new sdk.Unlock(""),
            tx,
            new sdk.TxInput(new sdk.Hash(Buffer.alloc(sdk.Hash.Width))));
        assert.strictEqual(res, "CHECK_EQUAL opcode requires two items on the stack");

        res = engine.execute(
            new sdk.Lock(sdk.LockType.Script, Buffer.from([1, 1, 1, 1, sdk.OP.CHECK_EQUAL])),
            new sdk.Unlock(""),
            tx,
            new sdk.TxInput(new sdk.Hash(Buffer.alloc(sdk.Hash.Width))));
        assert.strictEqual(res, "");

        res = engine.execute(
            new sdk.Lock(sdk.LockType.Script, Buffer.from([1, 2, 1, 1, sdk.OP.CHECK_EQUAL])),
            new sdk.Unlock(""),
            tx,
            new sdk.TxInput(new sdk.Hash(Buffer.alloc(sdk.Hash.Width))));
        assert.strictEqual(res, "Script failed");
    });
});
