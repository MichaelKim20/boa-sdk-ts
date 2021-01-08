/*******************************************************************************

    Test for Stack

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as sdk from '../lib';

import * as assert from 'assert';

describe ('Test Stack', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        return sdk.SodiumHelper.init();
    });

    it('Stack', () => {
        const StackMaxTotalSize = 16_384;
        const StackMaxItemSize = 512;
        let stack = new sdk.Stack(StackMaxTotalSize, StackMaxItemSize);
        assert.ok(stack.empty());
        assert.strictEqual(stack.count(), 0);
        assert.strictEqual(stack["used_bytes"], 0);
        stack.push(Buffer.from([1, 2, 3]));
        assert.strictEqual(stack.count(), 1);
        assert.strictEqual(stack["used_bytes"], 3);
        stack.push(Buffer.from([255]));
        assert.strictEqual(stack.count(), 2);
        assert.strictEqual(stack["used_bytes"], 4);
        assert.deepStrictEqual(stack.peek(), Buffer.from([255]));
        assert.strictEqual(stack.count(), 2);     // did not consume
        assert.deepStrictEqual(stack.peek(), Buffer.from([255]));
        assert.deepStrictEqual(stack.stack, [Buffer.from([1, 2, 3]), Buffer.from([255])]);
        assert.ok(!stack.empty());

        let copy = stack.copy();
        assert.strictEqual(copy["StackMaxTotalSize"], stack["StackMaxTotalSize"]);
        assert.strictEqual(copy["StackMaxItemSize"], stack["StackMaxItemSize"]);
        assert.strictEqual(copy.count(), stack.count());
        assert.strictEqual(copy["used_bytes"], stack["used_bytes"]);
        assert.deepStrictEqual(copy.stack, stack.stack);
        assert.deepStrictEqual(stack.pop(), Buffer.from([255]));
        assert.strictEqual(stack.count(), 1);
        assert.strictEqual(stack["used_bytes"], 3);
        assert.ok(!stack.empty());
        assert.deepStrictEqual(stack.pop(), Buffer.from([1, 2, 3]));
        assert.strictEqual(stack.count(), 0);
        assert.strictEqual(stack["used_bytes"], 0);
        assert.ok(stack.empty());
        assert.ok(copy.count() == 2);     // did not consume copy
        assert.strictEqual(copy["used_bytes"], 4);// ditto
        assert.ok(!copy.empty());         // ditto
        assert.ok(stack.canPush(Buffer.from(new Array(100).map(n => 42))));
        assert.ok(!stack.canPush(Buffer.from(new Array(StackMaxItemSize + 1).map(n => 42))));

        // overflow checks
        let over = new sdk.Stack(4, 2);
        assert.ok(!over.canPush(Buffer.from([1, 2, 3])));  // item overflow
        over.push(Buffer.from([1, 2]));
        over.push(Buffer.from([1, 2]));
        assert.ok(!over.canPush(Buffer.from([1, 2])));  // stack overflow    */
    });
});
