/*******************************************************************************

 Test for libsodium ported to TypeScript

 Copyright:
 Copyright (c) 2020 BOS Platform Foundation Korea
 All rights reserved.

 License:
 MIT License. See LICENSE for details.

 *******************************************************************************/

import {
    crypto_core_ed25519_BYTES,
    crypto_core_ed25519_UNIFORMBYTES,
    crypto_core_ed25519_HASHBYTES,
    crypto_core_ed25519_SCALARBYTES,
    crypto_core_ed25519_NONREDUCEDSCALARBYTES,

    crypto_scalarmult_ed25519,
    crypto_scalarmult_ed25519_noclamp,
    crypto_scalarmult_ed25519_base,
    crypto_scalarmult_ed25519_base_noclamp,
    JSBIUtils,
    crypto_core_ed25519_scalar_add,
    crypto_core_ed25519_scalar_sub,
    crypto_core_ed25519_scalar_mul,
    crypto_core_ed25519_scalar_negate, crypto_core_ed25519_scalar_invert, crypto_core_ed25519_scalar_complement
} from '../../src/modules/crypto/'

import * as assert from 'assert';
import JSBI from 'jsbi';

describe ('Test crypto_scalarmult', () =>
{
    let sample_for_scalarmult_ed25519_xxxxx = [
        {
            s: '03e7cc35b79a98ac37c6a4e8d2798e47727b27d9b409980a4787bb8120e7de03',
            p: 'd29a3c7c39473383668d2a40ade37535fd92a0756b341e9c7d799789051d32ae',
            mult: 'f86edf4819d812f56861a9cfe273945eb4343e9d2e4d7d3efe2f26dbfd65e356'
        },
        {
            s: '5b61176ac17498832b9adcc84bbe21596e7d9c9d085b92768e005dff9ea35a0d',
            p: 'f4ee09ccd3038196f2fb5bd4f365e9ce029463e36219b359379ea7b11edc132b',
            mult: '781304cdcadb83580f2a3a5d86144d7f4b31ff655bf0eea5305d832f6bd18186'
        },
        {
            s: 'a63130c517f1aa007e5bcc2990d74d3b18c3f5105f86ce43806c3bdd05022303',
            p: '7a7fff74da73c18242aa67bc73feac601442b1f9328a1954b3532826e4c7cb47',
            mult: '76f7f3a56165676cfa867c8a20c7410d3584b8fe03f8b60d7d5432c9dfdb8fe2'
        },
        {
            s: 'dbb1dec6bd9f77c5c07246d6e6aec0d6398e3edd1802cf5975acea7a4ffc1608',
            p: '8dbba7b99db548ee100357ecc3c60f57de013e7c2955cd1e908ed7fca74a8a92',
            mult: '195b14b6cdc92a8a393b194bf3671237ba3d06c42c6e58cd7cc2ba9c0c30e81d'
        },
        {
            s: '9e6439e2d14992bfe8389ff1c020acc2da5461371162d017f26ee5b17346400c',
            p: '4d73973abea145f4d9a275fd532a95f63e6814e8bb83911ce69fc1349e30a6a5',
            mult: 'b2cfa1da4bd07c2e7a715c3f8dfe59c10de1ad2c8d8f1aec27b4187061611e90'
        },
        {
            s: 'b05078f989dc12ddba1054b56ed3710cd6379d8a209598b250487dc964969c09',
            p: '1ac4faa468cfa6dbed1f7aa7805c79d249af899a646ab5ab415044fa5e022eb0',
            mult: 'f33bf9bb8b053460c6e00c48c09d4bcc806827507b92f0c283155b5d581c466e'
        },
        {
            s: '680c6ee2646989d7efbd157ee4acb297d4e372f452779f8bc0b7833e748ae502',
            p: '6e343bdfaa03f99a40bb7acceb73ee310eae6db80659d8048ad06463323859c1',
            mult: 'f38067f43a7a16465771939b3efd3b1c654ee80a577950a071d5fb1b9680a77e'
        },
        {
            s: 'dcfdbd873158bd74ee409cfcfe0729fdb59e2a5fe6f41658ec9409eb56afeb07',
            p: '28fa0d7951919f628ca8e5b6498b4167b1f60f09be6b019e8840dd4eb8fbe1bf',
            mult: 'fc7d697bc9991302523594210ade218277d97ab1e2b38cb31ca2abcb5119e1f6'
        },
        {
            s: '909a0fa6c8b2be8cebfe9f441b840fb2b69fafdbc4109b04c199deb837c52a04',
            p: 'a5ece23d296adc56930c6a9e30de5f820df2f9338b220a4761ca0240f142d646',
            mult: '16ecab74771c10eed6363382bf369e8e55c16bbbf1dc8717d1e53e1eb4311cd1'
        },
        {
            s: 'a107fea7a6451e36b0131ec112a51ce15bf11f0a1755bfb5fb807dca64f81603',
            p: '9956d87bff47dfc2674647d3baa5ce6701366f0c97e8fce460dc4f4a483f82e7',
            mult: '8072b5bed44b79b07dc43015db6eba8a74aa7ecddd48efad6d7a143bacbee503'
        }
    ];

    it ('Test crypto_scalarmult_ed25519_xxxxx', () =>
    {
        sample_for_scalarmult_ed25519_xxxxx.forEach((elem) =>
        {
            let s = Buffer.from(elem.s, "hex");
            let p = Buffer.from(elem.p, "hex");
            assert.deepStrictEqual(Buffer.from(crypto_scalarmult_ed25519_base_noclamp(s)).toString("hex"), elem.p);
            assert.deepStrictEqual(Buffer.from(crypto_scalarmult_ed25519_noclamp(s, p)).toString("hex"), elem.mult);
        });
    });
});
