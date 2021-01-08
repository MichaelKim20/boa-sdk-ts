/*******************************************************************************

    Contains a stack implementation for use with the script execution engine.

    The stack must be initialized with a set of size constraints,
    the maximum size of the stack, and the maximum size of any one item
    on the stack.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as assert from 'assert';

/**
 * This is used with the script execution engine.
 */
export class Stack
{
    /**
     * Maximum total stack size
     */
    private readonly StackMaxTotalSize: number;

    /**
     * Maximum size of an item on the stack
     */
    private readonly StackMaxItemSize: number;

    /**
     *The actual stack
     */
    public stack : Array<Buffer>;

    /**
     * Total used bytes for this stack. Used to track stack overflows.
     */
    private used_bytes: number;

    /**
     *Initializes the Stack with the configured consensus limits.
     *
     * @param StackMaxTotalSize the maximum allowed stack size before a
     * stack overflow. It affects routines such as `canPush()`,
     * and `push()` in non-release mode. Must be at least
     * big enough to fit `StackMaxItemSize`.
     * @param StackMaxItemSize maximum allowed size for a single item on
     * the stack. Must be greater than 0.
     */
    constructor (StackMaxTotalSize: number, StackMaxItemSize: number)
    {
        assert.ok(StackMaxItemSize > 0 && StackMaxTotalSize >= StackMaxItemSize);
        this.StackMaxTotalSize = StackMaxTotalSize;
        this.StackMaxItemSize = StackMaxItemSize;
        this.stack = [];
        this.used_bytes = 0;
    }

    /**
     * Checks if the provided data can be pushed to the stack.
     */
    public canPush (data: Buffer): boolean
    {
        return data.length <= this.StackMaxItemSize &&
            this.used_bytes + data.length <= this.StackMaxTotalSize;
    }

    /**
     * Pushes the value to the stack.
     */
    public push (data: Buffer): void
    {
        assert.ok(this.canPush(data));
        this.stack.push(data);
        this.used_bytes += data.length;
    }

    /**
     * Returns the top item from the stack without popping it.
     * Client code must check `empty()` first.
     */
    public peek (): Buffer
    {
        assert.ok(this.stack.length > 0);
        return this.stack[this.stack.length-1];
    }

    /**
     * Pops an item from the stack and returns it.
     * Client code must check `empty()` first.
     */
    public pop (): Buffer
    {
        assert.ok(this.stack.length > 0);
        let value = this.stack[this.stack.length-1];
        this.stack.pop();
        this.used_bytes -= value.length;
        return value;
    }

    /**
     * Get the number of items on the stack
     */
    public count (): number
    {
        return this.stack.length;
    }

    /**
     * @returns true if the stack is empty
     */
    public empty (): boolean
    {
        return this.stack.length == 0;
    }

    /**
     * @returns a copy of the stack. The two stacks may then be modified
     * independently of each other.
     */
    public copy (): Stack
    {
        let dup: Stack = new Stack(this.StackMaxTotalSize, this.StackMaxItemSize);
        for (let key in this)
            if (this.hasOwnProperty(key) && (key !== "stack"))
                // @ts-ignore
                dup[key] = this[key];
        dup.stack = this.stack.map(n => Buffer.from(n));
        return dup;
    }
}
