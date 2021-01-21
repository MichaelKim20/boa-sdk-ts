/*******************************************************************************

    Test for utility functions

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';

describe ('Test of isInteger, isPositiveInteger, isNegativeInteger', () =>
{
    it ('isInteger', () =>
    {
        assert.ok(!boasdk.Utils.isInteger("a12345678901234567890"));
        assert.ok(boasdk.Utils.isInteger("12345678901234567890"));
        assert.ok(boasdk.Utils.isInteger("+12345678901234567890"));
        assert.ok(boasdk.Utils.isInteger("-12345678901234567890"));
    });

    it ('isPositiveInteger', () =>
    {
        assert.ok(!boasdk.Utils.isPositiveInteger("a12345678901234567890"));
        assert.ok(boasdk.Utils.isPositiveInteger("12345678901234567890"));
        assert.ok(boasdk.Utils.isPositiveInteger("+12345678901234567890"));
        assert.ok(!boasdk.Utils.isPositiveInteger("-12345678901234567890"));
    });

    it ('isNegativeInteger', () =>
    {
        assert.ok(!boasdk.Utils.isNegativeInteger("a12345678901234567890"));
        assert.ok(!boasdk.Utils.isNegativeInteger("12345678901234567890"));
        assert.ok(!boasdk.Utils.isNegativeInteger("+12345678901234567890"));
        assert.ok(boasdk.Utils.isNegativeInteger("-12345678901234567890"));
    });
});

describe ('Test for JSON serialization', () =>
{
    it ('Test that `BigInt` serializes to JSON', () =>
    {
        let json1 = JSON.stringify(BigInt(42));
        assert.strictEqual(json1, '"42"');
        let json2 = JSON.stringify({ value: BigInt(42) });
        assert.strictEqual(json2, '{"value":"42"}');
    });

    it ('Test that `JSON.stringify` correctly picks up `Height.toJSON`', () =>
    {
        let height = new boasdk.Height(BigInt(45));
        let json = JSON.stringify(height);
        assert.strictEqual(json, '"45"');
    });

    it ('Test that `Height.toJSON` works within an object', () =>
    {
        let height = new boasdk.Height(BigInt(45));
        let json = JSON.stringify({ value: height });
        assert.strictEqual(json, '{"value":"45"}');
    });
});

describe ('Test of Utils', () =>
{
    it('Test of Utils.compareBuffer', () =>
    {
        let a = Buffer.from([6, 3, 2, 1]);
        let b = Buffer.from([5, 4, 2, 1]);
        let c = Buffer.from(b);

        assert.strictEqual(boasdk.Utils.writeToString(a), "0x01020306");
        assert.strictEqual(boasdk.Utils.writeToString(b), "0x01020405");
        assert.strictEqual(boasdk.Utils.writeToString(c), "0x01020405");

        assert.ok(Buffer.compare(a, b) > 0);
        assert.ok(boasdk.Utils.compareBuffer(a, b) < 0);
        assert.ok(boasdk.Utils.compareBuffer(b, a) > 0);
        assert.ok(boasdk.Utils.compareBuffer(b, c) == 0);
        assert.ok(boasdk.Utils.compareBuffer(c, b) == 0);

        let x = Buffer.from([   5, 4, 3, 4, 1]);
        let y = Buffer.from([6, 5, 4, 3, 4, 1]);
        assert.ok(boasdk.Utils.compareBuffer(x, y) < 0);
        assert.ok(boasdk.Utils.compareBuffer(y, x) > 0);
    });

    it ('Test of writeBigIntLE, readBigIntLE', () =>
    {
        let buffer = Buffer.alloc(8);
        let actual: bigint;
        let value: bigint;

        actual = BigInt("65536");
        boasdk.Utils.writeBigIntLE(buffer, actual);
        value = boasdk.Utils.readBigIntLE(buffer);
        assert.strictEqual(value.toString(), "65536");
        assert.strictEqual(actual, value);

        actual = BigInt("4294967296");
        boasdk.Utils.writeBigIntLE(buffer, actual);
        value = boasdk.Utils.readBigIntLE(buffer);
        assert.strictEqual(value.toString(), "4294967296");
        assert.strictEqual(actual, value);

        actual = BigInt("4503599627370496");
        boasdk.Utils.writeBigIntLE(buffer, actual);
        value = boasdk.Utils.readBigIntLE(buffer);
        assert.strictEqual(value.toString(), "4503599627370496");
        assert.strictEqual(actual, value);

        actual = BigInt("9007199254740993");
        boasdk.Utils.writeBigIntLE(buffer, actual);
        value = boasdk.Utils.readBigIntLE(buffer);
        assert.strictEqual(value.toString(), "9007199254740993");
        assert.strictEqual(actual, value);
    });
});
