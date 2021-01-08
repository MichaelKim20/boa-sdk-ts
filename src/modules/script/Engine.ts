/*******************************************************************************

    Contains the script execution engine.

    Note that Bitcoin-style P2SH scripts are not detected,
    instead one should use LockType.Redeem in the Lock script tag.

    Things not currently implemented:
    - opcode weight calculation
    - opcode total cost limit

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Hash, hashFull, makeUTXOKey } from '../common/Hash';
import { Point } from '../common/ECC';
import { Signature } from '../common/Signature';
import { Schnorr} from '../common/Schnorr';

import { Lock, LockType, Unlock } from './Lock';
import { OP, isConditional, isOpcode, isPayload } from './Opcodes';
import { Script, ScriptType } from './Script';
import { Stack } from './Stack';
import { ScopeCondition } from './ScopeCondition';

import { Transaction } from '../data/Transaction';
import { TxInput} from '../data/TxInput';

import { Utils } from "../utils/Utils";

import assert from 'assert';
import { SmartBuffer } from 'smart-buffer';

/**
 * Contains the script execution engine.
 */
export class Engine
{

    /**
     * Opcodes cannot be pushed on the stack. We use a byte array as a marker.
     * Conditional opcodes require the top item on the stack to be one of these
     */
    private static TrueValue = Buffer.from([OP.TRUE]);
    /**
     * Ditto
     */
    private static FalseValue = Buffer.from([OP.FALSE]);

    /**
     * Maximum total stack size
     */
    private readonly StackMaxTotalSize : number;

    /**
     * Maximum size of an item on the stack
     */
    private readonly StackMaxItemSize : number;

    /**
     * Initializes the script execution engine with the configured consensus
     * limits.
     * @param StackMaxTotalSize     the maximum allowed stack size before a
     *      stack overflow, which would cause the script execution to fail.
     *      the script execution fails.
     * @param StackMaxItemSize      maximum allowed size for a single item on
     *      the stack. If exceeded, script execution will fail during the
     *      syntactical validation of the script.
     */
    constructor (StackMaxTotalSize: number, StackMaxItemSize: number)
    {
        assert.ok(StackMaxItemSize > 0 && StackMaxTotalSize >= StackMaxItemSize);
        this.StackMaxTotalSize = StackMaxTotalSize;
        this.StackMaxItemSize = StackMaxItemSize;
    }

    /**
     * Main dispatch execution routine.
     * The lock type will be examined, and based on its type execution will
     * proceed to either simple script-less payments, or script-based payments.
     * @param lock      the lock
     * @param unlock    may contain a `signature`, `signature, key`,
     *      or `script` which only contains stack push opcodes
     * @param tx        the spending transaction
     * @param input     the input which contained the unlock
     * @returns empty string  if there were no errors,
     *      or a string explaining the reason execution failed
     */
    public execute (lock: Lock, unlock: Unlock, tx: Transaction, input: TxInput): string
    {
        if (lock.bytes.length == 0)
            return "Lock cannot be empty";

        let error: string;
        switch (lock.type)
        {
            case LockType.Key:
            case LockType.KeyHash:
                error = this.handleBasicPayment(lock, unlock, tx);
                if (error !== '')
                    return error;
                break;

            case LockType.Script:
                error = this.executeBasicScripts(lock, unlock, tx, input);
                if (error !== '')
                    return error;
                break;

            case LockType.Redeem:
                error = this.executeRedeemScripts(lock, unlock, tx, input);
                if (error !== '')
                    return error;
                break;
        }
        return '';
    }

    /**
     * Handle stack-less and script-less basic payments.
     * @param lock      must contain a `pubkey` or a `hash`
     * @param unlock    must contain a `signature` or `signature, key` tuple
     * @param tx        the spending transaction
     * @returns empty string if there were no errors,
     *      or a string explaining the reason execution failed
     */
    public handleBasicPayment (lock: Lock, unlock: Unlock, tx: Transaction): string
    {
        switch (lock.type)
        {
            case LockType.Key:
                if (lock.bytes.length !== Point.Width)
                    return "LockType.Key requires 32-byte key argument in the lock script";
                const key_lock = new Point(lock.bytes);
                if (!key_lock.isValid())
                    return "LockType.Key 32-byte public key in lock script is invalid";

                if (unlock.bytes.length != Signature.Width)
                    return "LockType.Key requires a 64-byte signature in the unlock script";
                const sig_lock = new Signature(unlock.bytes);
                if (!Schnorr.verify<Transaction>(key_lock, sig_lock, tx))
                    return "LockType.Key signature in unlock script failed validation";

                break;

            case LockType.KeyHash:
                if (lock.bytes.length != Hash.Width)
                    return "LockType.KeyHash requires a 64-byte key hash argument in the lock script";
                const key_hash = new Hash(lock.bytes);

                if (unlock.bytes.length != Signature.Width + Point.Width)
                    return "LockType.KeyHash requires a 64-byte signature " +
                    "and a 32-byte key in the unlock script";
                const sig_unlock = new Signature(unlock.bytes.slice(0, Signature.Width));

                const key_unlock = new Point(unlock.bytes.slice(Signature.Width));
                if (!key_unlock.isValid())
                    return "LockType.KeyHash public key in unlock script is invalid";

                if (hashFull(key_unlock) != key_hash)
                    return "LockType.KeyHash hash of key does not match key hash set in lock script";

                if (!Schnorr.verify<Transaction>(key_unlock, sig_unlock, tx))
                    return "LockType.KeyHash signature in unlock script failed validation";

                break;

            default:
                assert(false);
        }

        return '';
    }

    /**
     * Execute a `LockType.Script` type of lock script with the associated
     * unlock script.
     *
     * The unlock script may only contain stack pushes.
     * The unlock script is ran, producing a stack.
     * Thereafter, the lock script will run with the stack of the
     * unlock script.
     *
     * For security reasons, the two scripts are not concatenated together
     * before execution. You may read more about it here:
     * https://bitcoin.stackexchange.com/q/80258/93682
     * @param lock      the lock script
     * @param unlock    the unlock script
     * @param tx        the spending transaction
     * @param input     the input which contained the unlock
     * @returns empty string if there were no errors,
     *      or a string explaining the reason execution failed
     */
    public executeBasicScripts (lock: Lock, unlock: Unlock, tx: Transaction, input: TxInput): string
    {
        assert(lock.type === LockType.Script);

        let unlock_script = Script.validateScript(ScriptType.Unlock, unlock.bytes, this.StackMaxItemSize);
        if (unlock_script[0] !== '')
            return unlock_script[0];

        let lock_script = Script.validateScript(ScriptType.Lock, lock.bytes, this.StackMaxItemSize);
        if (lock_script[0] !== '')
            return lock_script[0];

        let stack = new Stack(this.StackMaxTotalSize, this.StackMaxItemSize);

        let unlock_res = this.executeScript(unlock_script[1], stack, tx, input)
        if (unlock_res !== '')
            return unlock_res;

        let lock_res = this.executeScript(lock_script[1], stack, tx, input)
        if (lock_res !== '')
            return lock_res;

        if (this.hasScriptFailed(stack))
            return "Script failed";

        return '';
    }

    /**
     * Execute a `LockType.Redeem` type of lock script with the associated
     * lock script.
     *
     * The 64-byte hash of the redeem script is read from `lock_bytes`,
     * `unlock_bytes` is evaluated as a set of pushes to the stack where
     * the last push is the redeem script. The redeem script is popped from the
     * stack, hashed, and compared to the previously extracted hash from the
     * lock script. If the hashes match, the redeem script is evaluated with
     * any leftover stack items of the unlock script.
     *
     * @param lock      must contain a 64-byte hash of the redeem script
     * @param unlock    must contain only stack push opcodes, where the last
     *                  push is the redeem script itself
     * @param tx        the associated spending transaction
     * @param input     the input which contained the unlock
     * @returns         empty string if there were no errors,
     *  or a string explaining the reason execution failed
     */
    public executeRedeemScripts (lock: Lock, unlock: Unlock, tx: Transaction, input: TxInput): string
    {
        assert(lock.type === LockType.Redeem);

        if (lock.bytes.length !== Hash.Width)
            return "LockType.Redeem requires 64-byte script hash in the lock script";
        const script_hash = new Hash(lock.bytes);

        let unlock_script = Script.validateScript(ScriptType.Unlock, unlock.bytes, this.StackMaxItemSize);
        if (unlock_script[0] !== null)
            return unlock_script[0];

        let stack = new Stack(this.StackMaxTotalSize, this.StackMaxItemSize);
        let unlock_res = this.executeScript(unlock_script[1], stack, tx, input);
        if (unlock_res !== '')
            return unlock_res;

        if (stack.empty())
            return "LockType.Redeem requires unlock script to push a redeem script to the stack";

        const redeem_bytes = stack.pop();
        if (hashFull(redeem_bytes) != script_hash)
            return "LockType.Redeem unlock script pushed a redeem script "
                + "which does not match the redeem hash in the lock script";

        let redeem_script = Script.validateScript(ScriptType.Redeem, redeem_bytes, this.StackMaxItemSize);
        if (redeem_script[0] !== null)
            return redeem_script[0];

        let redeem_res = this.executeScript(redeem_script[1], stack, tx, input);
        if (redeem_res !== '')
            return redeem_res;

        if (this.hasScriptFailed(stack))
            return "Script failed";

        return '';
    }

    /**
     * Execute the script with the given stack and the associated spending
     * transaction. This routine may be called for all types of scripts,
     * lock, unlock, and redeem scripts.
     *
     * An empty script will not fail execution. It's up to the calling code
     * to differentiate when this is an allowed condition.
     * @param script    the script to execute
     * @param stack     the stack to use for the script. May be non-empty.
     * @param tx        the associated spending transaction
     * @param input     the input which contained the unlock
     * @returns         empty string  if there were no errors,
     *      or a string explaining the reason execution failed
     */
    public executeScript (script: Script, stack: Stack, tx: Transaction, input: TxInput): string
    {
        let sc = new ScopeCondition();
        let bytes = SmartBuffer.fromBuffer(script.opcodes);
        while (bytes.remaining() > 0)
        {
            let opcode: OP = bytes.readUInt8();
            if (!isOpcode(opcode))
                assert(false, "Script should have been syntactically validated");

            if (isConditional(opcode))
            {
                let error = this.handleConditional(opcode, stack, sc);
                if (error !== '')
                    return error;
                continue;
            }

            let payload: Buffer = Buffer.alloc(0);
            switch (opcode)
            {
                case OP.PUSH_DATA_1:
                    payload = this.readPayload(OP.PUSH_DATA_1, bytes);
                    break;

                case OP.PUSH_DATA_2:
                    payload = this.readPayload(OP.PUSH_DATA_2, bytes);
                    break;
                default :
                    if ((opcode >= 1) && (opcode <= OP.PUSH_BYTES_75))
                    {
                        const payload_size = opcode;  // encoded in the opcode
                        if (bytes.readOffset + payload_size > bytes.length)
                            assert(0);  // should have been validated
                        payload = bytes.readBuffer(payload_size);
                    }
                    else
                    {
                        assert(!isPayload(opcode));  // missing cases
                    }

                    break;
            }
            if (!sc.isTrue())
                continue;

            let res: [string, boolean];
            let top, a, b : Buffer;
            switch (opcode)
            {
                case OP.TRUE:
                    if (!stack.canPush(Engine.TrueValue))
                        return "Stack overflow while pushing TRUE to the stack";
                    stack.push(Engine.TrueValue);
                    break;

                case OP.FALSE:
                    if (!stack.canPush(Engine.FalseValue))
                        return "Stack overflow while pushing FALSE to the stack";
                    stack.push(Engine.FalseValue);
                    break;

                case OP.PUSH_DATA_1:
                    if (!stack.canPush(payload))
                        return "Stack overflow while executing PUSH_DATA_1";
                    stack.push(payload);
                    break;

                case OP.PUSH_DATA_2:
                    if (!stack.canPush(payload))
                        return "Stack overflow while executing PUSH_DATA_2";
                    stack.push(payload);
                    break;

                case OP.DUP:
                    if (stack.empty())
                        return "DUP opcode requires an item on the stack";

                    top = stack.peek();
                    if (!stack.canPush(top))
                        return "Stack overflow while executing DUP";
                    stack.push(top);
                    break;

                case OP.HASH:
                    if (stack.empty())
                        return "HASH opcode requires an item on the stack";

                    top = stack.pop();
                    const hash = hashFull(top);
                    if (!stack.canPush(hash.data))  // e.g. hash(1 byte) => 64 bytes
                        return "Stack overflow while executing HASH";
                    stack.push(hash.data);
                    break;

                case OP.CHECK_EQUAL:
                    if (stack.count() < 2)
                        return "CHECK_EQUAL opcode requires two items on the stack";

                    a = stack.pop();
                    b = stack.pop();
                    stack.push(Buffer.compare(a, b) == 0 ? Engine.TrueValue : Engine.FalseValue);  // canPush() check unnecessary
                    break;

                case OP.VERIFY_EQUAL:
                    if (stack.count() < 2)
                        return "VERIFY_EQUAL opcode requires two items on the stack";

                    a = stack.pop();
                    b = stack.pop();
                    if (Buffer.compare(a, b) != 0)
                        return "VERIFY_EQUAL operation failed";
                    break;

                case OP.CHECK_SIG:
                    res = this.verifySignature(OP.CHECK_SIG, stack, tx);
                    if (res[0] !== '')
                        return res[0];

                    // canPush() check unnecessary
                    stack.push(res[1] ? Engine.TrueValue : Engine.FalseValue);
                    break;

                case OP.VERIFY_SIG:
                    res = this.verifySignature(OP.VERIFY_SIG, stack, tx);
                    if (res[0] !== '')
                        return res[0];

                    if (!res[1])
                        return "VERIFY_SIG signature failed validation";
                    break;

                case OP.CHECK_MULTI_SIG:
                    res = this.verifyMultiSig(OP.VERIFY_SIG, stack, tx);
                    if (res[0] !== '')
                        return res[0];

                    // canPush() check unnecessary
                    stack.push(res[0] ? Engine.TrueValue : Engine.FalseValue);
                    break;

                case OP.VERIFY_MULTI_SIG:
                    res = this.verifyMultiSig(OP.VERIFY_MULTI_SIG, stack, tx);
                    if (res[0] !== '')
                        return res[0];

                    if (!res[1])
                        return "VERIFY_MULTI_SIG signature failed validation";
                    break;

                case OP.CHECK_SEQ_SIG:
                    res = this.verifySequenceSignature(OP.CHECK_SEQ_SIG, stack, tx, input);
                    if (res[0] !== '')
                        return res[0];

                    // canPush() check unnecessary
                    stack.push(res[1] ? Engine.TrueValue : Engine.FalseValue);
                    break;

                case OP.VERIFY_SEQ_SIG:
                    res = this.verifySequenceSignature(OP.VERIFY_SEQ_SIG, stack, tx, input);
                    if (res[0] !== '')
                        return res[0];

                    if (!res[1])
                        return "VERIFY_SEQ_SIG signature failed validation";
                    break;

                case OP.VERIFY_LOCK_HEIGHT:
                    if (stack.empty())
                        return "VERIFY_LOCK_HEIGHT opcode requires a lock height on the stack";

                    const MIN_SEQ_BYTES = 8;
                    const height_bytes = stack.pop();
                    if (height_bytes.length !== MIN_SEQ_BYTES)
                        return "VERIFY_LOCK_HEIGHT height lock must be an 8-byte number";

                    const lock_height = Utils.readBigIntLE(height_bytes);
                    if (lock_height > tx.lock_height.value)
                        return "VERIFY_LOCK_HEIGHT height lock of transaction is too low";

                    break;

                case OP.VERIFY_UNLOCK_AGE:
                    if (stack.empty())
                        return "VERIFY_UNLOCK_AGE opcode requires an unlock age on the stack";

                    const age_bytes = stack.pop();
                    if (age_bytes.length !== 4)
                        return "VERIFY_UNLOCK_AGE unlock age must be a 4-byte number";

                    const unlock_age = age_bytes.readInt32LE();
                    if (unlock_age > input.unlock_age)
                        return "VERIFY_UNLOCK_AGE unlock age of input is too low";

                    break;

                default:
                    if ((opcode >= 1) && (opcode < OP.PUSH_BYTES_75))
                    {
                        if (!stack.canPush(payload))
                            return "Stack overflow while executing PUSH_BYTES_*";

                        stack.push(payload);
                    }
                    else if ((opcode >= OP.PUSH_NUM_1) && (opcode < OP.PUSH_NUM_5))
                    {
                        let OneByte = Buffer.from([0]);
                        if (!stack.canPush(OneByte))
                            return "Stack overflow while executing PUSH_NUM_*";

                        // note: must be GC-allocated!
                        // todo: replace with preallocated values just like
                        // `TrueValue` and `FalseValue`
                        const number = Buffer.from([((opcode + 1) - OP.PUSH_NUM_1)]);
                        stack.push(number);
                    }
                    else
                    {
                        assert(0);  // should have been handled
                    }

                    break;
            }
        }

        return '';
    }

    /**
     * Handle a conditional opcode like `OP.IF` / `OP.ELSE` / etc.
     *
     * The initial scope is implied to be true. When a new scope is entered
     * via `OP.IF` / `OP.NOT_IF`, the condition is checked. If the condition
     * is false, then all the code inside the `OP.IF` / `OP.NOT_IF`` block
     * will be skipped until we exit into the first scope where the condition
     * is true.
     *
     * Execution will fail if there is an `OP.ELSE` or `OP.END_IF` opcode
     * without an associated `OP.IF` / `OP.NOT_IF` opcode.
     *
     * Currently trailing `OP.ELSE` opcodes are not rejected.
     * This is also a quirk in the Bitcoin language, and should
     * be fixed here later.
     * (e.g. `IF { } ELSE {} ELSE {} ELSE {}` is allowed).
     *
     * @param opcode    the current conditional
     * @param stack     the stack to evaluate for the conditional
     * @param sc        the scope condition which may be toggled by a condition change
     * @returns empty string if there were no errors,
     *      or a string explaining the reason execution failed
     */
    private handleConditional (opcode: OP, stack: Stack, sc: ScopeCondition): string
    {
        switch (opcode)
        {
            case OP.IF:
            case OP.NOT_IF:
                if (!sc.isTrue())
                {
                    sc.push(false);  // enter new scope, remain false
                    break;
                }

                if (stack.empty())
                    return "IF/NOT_IF opcode requires an item on the stack";

                const top = stack.pop();
                if ((Buffer.compare(top, Engine.TrueValue) !== 0) && (Buffer.compare(top, Engine.FalseValue) !== 0))
                    return "IF/NOT_IF may only be used with OP.TRUE / OP.FALSE values";

                let v1 = (opcode === OP.IF) ? 1 : 0;
                let v2 = (Buffer.compare(top, Engine.FalseValue) === 0) ? 1 : 0;
                sc.push(((v1 ^ v2) !== 0));
                break;

            case OP.ELSE:
                if (sc.empty())
                    return "Cannot have an ELSE without an associated IF / NOT_IF";
                sc.tryToggle();
                break;

            case OP.END_IF:
                if (sc.empty())
                    return "Cannot have an END_IF without an associated IF / NOT_IF";
                sc.pop();
                break;

            default:
                assert(false);
        }

        return '';
    }

    /**
     * Checks if the script has failed execution by examining its stack.
     * The script is considered sucessfully executed only if its stack
     * contains exactly one item, and that item being `TrueValue`.
     * @param stack the stack to check
     * @returns true if the script is considered to have failed execution
     */
    private hasScriptFailed (stack: Stack): boolean
    {
        return stack.empty() || Buffer.compare(stack.peek(), Engine.TrueValue) !== 0;
    }

    /**
     * Reads the length and payload of the associated `PUSH_DATA_*` opcode,
     * and advances the `opcodes` array to the next opcode.
     *
     * The length is read in little endian format.
     * @param op        the associated `PUSH_DATA_*` opcode
     * @param opcodes   the opcode / data byte array
     * @returns will contain the payload
     */
    private readPayload (op: OP, opcodes: SmartBuffer): Buffer
    {
        assert((op === OP.PUSH_DATA_1) || (op === OP.PUSH_DATA_2));

        let bytesForSize = (op === OP.PUSH_DATA_1) ? 1 : 2;
        if (opcodes.remaining() < bytesForSize)
            assert(false);  // script should have been validated

        let size = (op === OP.PUSH_DATA_1) ? opcodes.readUInt8() : opcodes.readUInt16LE();
        if (size == 0 || size > this.StackMaxItemSize)
            assert(false);  // script should have been validated

        if (opcodes.readOffset + size > opcodes.length)
            assert(false);  // script should have been validated

        return opcodes.readBuffer(size);
    }

    /**
     * Reads the Signature and Public key from the stack,
     * and validates the signature against the provided
     * spending transaction.
     *
     * If the Signature and Public key are missing or in an invalid format,
     * an error string is returned.
     *
     * Otherwise the signature is validated and the `sig_valid` parameter
     * is set to the validation result.
     * @param op    the opcode
     * @param stack should contain the Signature and Public Key
     * @param tx    the transaction that should have been signed
     * @returns an error string if the Signature and Public key are missing or
     invalid, otherwise returns null.
     */
    private verifySignature (op: OP, stack: Stack, tx: Transaction): [string, boolean]
    {
        assert(op == OP.CHECK_SIG || op == OP.VERIFY_SIG);

        if (stack.count() < 2)
        {
            let err1 = `${OP[op]} opcode requires two items on the stack`;
            return [err1, false];
        }

        const key_bytes = stack.pop();
        if (key_bytes.length != Point.Width)
        {
            let err2 = `${OP[op]} opcode requires 32-byte public key on the stack`;
            return [err2, false];
        }

        const point = new Point(key_bytes);
        if (!point.isValid())
        {
            let err3 = `${OP[op]} 32-byte public key on the stack is invalid`;
            return [err3, false];
        }

        const sig_bytes = stack.pop();
        if (sig_bytes.length != Signature.Width)
        {
            let err4 = `${OP[op]} opcode requires 64-byte signature on the stack`;
            return [err4, false];
        }

        const sig = new Signature(sig_bytes);
        let sig_valid = Schnorr.verify<Transaction>(point, sig, tx);
        return ['', sig_valid];
    }

    /**
     * Verifies a threshold multi-signature. Any `N of M` configuration up to
     * 5 keys and 5 signatures is allowed.
     *
     * Reads a `count` from the stack, then reads `count` number of Public
     * keys from the stack, then reads `req_count` from the stack, then reads
     * `req_count` number of signatures from the stack.
     *
     * There need to be exactly `req_count` valid signatures on the stack.
     *
     * For each key it will try to validate against the first signature.
     * When validation fails, it tries the next key with the same signature.
     * When validation succeeds, it moves on to the next signature.
     *
     * The keys and signatures must be placed in the same order on the stack.
     *
     * If any of the Signatures or Public keys are missing or in an
     * invalid format, an error string is returned.
     *
     * Otherwise the mult-sig is checked and the `sig_valid` parameter
     * is set to the validation result.
     * @param op    the opcode
     * @param stack should contain the count, the public keys,
     *  the count of required signatures
     * @param tx    the transaction that should have been signed
     * @returns     an error string if the Signature and Public key are missing or
     *  invalid, otherwise returns null.
     */
    private verifyMultiSig (op: OP, stack: Stack, tx: Transaction): [string, boolean]
    {
        assert(op == OP.CHECK_MULTI_SIG || op == OP.VERIFY_MULTI_SIG);

        let MAX_PUB_KEYS = 5;
        let MAX_SIGNATURES = MAX_PUB_KEYS;

        // two counts plus the pubkeys and the signatures
        let MAX_STACK_ITEMS = 2 + MAX_PUB_KEYS + MAX_SIGNATURES;

        // smallest possible stack is: <sig> <1> <pubkey> <1>
        if (stack.count() < 4)
        {
            let err1 = `${OP[op]} opcode requires at minimum four items on the stack`;
            return [err1, false];
        }

        if (stack.count() > MAX_STACK_ITEMS)
        {
            let err2 = `${OP[op]} opcode cannot accept more than ${MAX_PUB_KEYS}` +
            ` keys and ${MAX_PUB_KEYS} signatures on the stack`;
            return [err2, false];
        }

        const pubkey_count_arr = stack.pop();
        if (pubkey_count_arr.length != 1)
        {
            let err3 = `${OP[op]} opcode requires 1-byte public key count on the stack`;
            return [err3, false];
        }

        const key_count = pubkey_count_arr.readUInt8(0);
        if (key_count < 1 || key_count > MAX_PUB_KEYS)
        {
            let err4 = `${OP[op]} opcode can accept between 1 to ${MAX_PUB_KEYS} keys on the stack`;
            return [err4, false];
        }

        if (key_count > stack.count())
        {
            let err5 = `${OP[op]} not enough keys on the stack`;
            return [err5, false];
        }

        // buffer
        let pub_keys_buffer = new Array<Point> ();
        for (let idx = 0; idx < MAX_PUB_KEYS; idx++)
        {
            const key_bytes = stack.pop();
            if (key_bytes.length != Point.Width)
            {
                let err6 = `${OP[op]} opcode requires 32-byte public key on the stack`;
                return [err6, false];
            }

            let key = new Point(key_bytes);
            if (!key.isValid())
            {
                let err7 = `${OP[op]} 32-byte public key on the stack is invalid`;
                return [err7, false];
            }

            pub_keys_buffer.push(key);
        }

        // slice
        let keys = pub_keys_buffer.slice(0, key_count);

        const sig_count_arr = stack.pop();
        if (sig_count_arr.length != 1)
        {
            let err8 = `${OP[op]} opcode requires 1-byte signature count on the stack`;
            return [err8, false];
        }

        const sig_count = sig_count_arr.readUInt8(0);
        if (sig_count < 1 || sig_count > MAX_SIGNATURES)
        {
            let err9 = `${OP[op]} opcode can accept between 1 to ${MAX_SIGNATURES} signatures on the stack`;
            return [err9, false];
        }

        if (sig_count > stack.count())
        {
            let err10 = `${OP[op]} not enough signatures on the stack`;
            return [err10, false];
        }

        if (sig_count > key_count)
        {
            let err11 = `${OP[op]} opcode cannot accept more signatures than there are keys`;
            return [err11, false];
        }

        // buffer
        let sigs_buffer = new Array<Signature>() ;
        for (let idx = 0; idx < MAX_SIGNATURES; idx++)
        {
            const sig_bytes = stack.pop();
            if (sig_bytes.length != Signature.Width)
            {
                let err12 = `${OP[op]} opcode requires 64-byte signature on the stack`;
                return [err12, false];
            }

            let sig = new Signature(sig_bytes);
            sigs_buffer.push(sig);
        }

        // slice
        let sigs = sigs_buffer.slice(0, sig_count);

        // if there are no sigs left, validation succeeded.
        // if there are more sigs left than keys left it means we cannot reach
        // the minimum required signatures as there's not enough keys to
        // compare with.
        while (sigs.length > 0 && sigs.length <= keys.length)
        {
            if (Schnorr.verify<Transaction>(keys[0], sigs[0], tx))
                sigs.shift();

            keys.shift();
        }

        let sig_valid = sigs.length == 0;
        return ['', sig_valid];
    }

    /**
     * Checks floating-transaction signatures for use with the Flash layer.
     *
     * Verifies the sequence signature by blanking the input, reading the
     * minimum sequence, the key, the new sequence, and the signature off
     * the stack and validates the signature.
     *
     * If any of the arguments expected on the stack are missing,
     * an error string is returned.
     *
     * The `sig_valid` parameter will be set to the validation result
     * of the signature.
     *
     * @param op        the opcode
     * @param stack     should contain the Signature and Public Key
     * @param tx        the transaction that should have been signed
     * @param input     the associated Input to blank when signing
     * @returns         an error string if the needed arguments on the stack are missing,
     *      otherwise returns null
     */
    private verifySequenceSignature (op: OP, stack: Stack, tx: Transaction, input: TxInput): [string, boolean]
    {
        assert(op == OP.CHECK_SEQ_SIG || op == OP.VERIFY_SEQ_SIG);

        // top to bottom: <min_seq> <key> <new_seq> <sig>
        // lock script typically pushes <min_seq> <key>
        // while the unlock script pushes <new_seq> <sig>
        if (stack.count() < 4)
        {
            const err1 = `${OP[op]} opcode requires 4 items on the stack`;
            return [err1, false];
        }

        const MIN_SEQ_BYTES = 8;

        const min_seq_bytes = stack.pop();
        if (min_seq_bytes.length != MIN_SEQ_BYTES)
        {
            const err2 = `${OP[op]} opcode requires 8-byte minimum sequence on the stack`;
            return [err2, false];
        }

        const min_sequence = Utils.readBigIntLE(min_seq_bytes);
        const key_bytes = stack.pop();
        if (key_bytes.length != Point.Width)
        {
            const err3 = `${OP[op]} opcode requires 32-byte public key on the stack`;
            return [err3, false];
        }

        const point = new Point(key_bytes);
        if (!point.isValid())
        {
            const err4 = `${OP[op]} 32-byte public key on the stack is invalid`;
            return [err4, false];
        }

        const seq_bytes = stack.pop();
        if (seq_bytes.length != MIN_SEQ_BYTES)
        {
            const err5 = `${OP[op]} opcode requires 8-byte minimum sequence on the stack`;
            return [err5, false];
        }

        const sequence = Utils.readBigIntLE(seq_bytes);
        if (sequence < min_sequence)
        {
            const err6 = `${OP[op]} sequence is not equal to or greater than min_sequence`;
            return [err6, false];
        }

        const sig_bytes = stack.pop();
        if (sig_bytes.length != Signature.Width)
        {
            const err7 = `${OP[op]} opcode requires 64-byte signature on the stack`;
            return [err7, false];
        }

        const sig = new Signature(sig_bytes);

        let h = hashFull(input);
        // workaround: input index not explicitly passed in
        const input_idx = tx.inputs.findIndex((value:TxInput, index: number) =>
        {
            return Buffer.compare(hashFull(value).data, h.data) == 0
        });
        assert(input_idx != -1, "Input does not belong to this transaction");

        const challenge = this.getSequenceChallenge(tx, sequence, input_idx);
        let sig_valid = Schnorr.verify(point, sig, challenge);
        return ['', sig_valid];
    }

    /**
     * Gets the challenge hash for the provided transaction, sequence ID.
     * @param tx        the transaction to sign
     * @param sequence  the sequence ID to hash
     * @param input_idx the associated input index we're signing for
     * @returns         the challenge as a hash
     */
    public getSequenceChallenge (tx: Transaction, sequence: bigint, input_idx: number): Hash
    {
        assert(input_idx < tx.inputs.length, "Input index is out of range");

        let cloned: Transaction;
        // it's ok, we'll dupe the array before modification
        cloned = Transaction.reviver("", JSON.stringify(tx));
        cloned.inputs[input_idx] = new TxInput(new Hash(Buffer.alloc(Hash.Width)));  // blank out matching input
        return makeUTXOKey(hashFull(cloned), sequence);
    }
}
