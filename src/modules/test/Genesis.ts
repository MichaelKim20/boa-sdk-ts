import {hashFull, Transaction, TxOutput, TxType, WK} from '../..';

import * as assert from 'assert';

export function GenesisTx ()
{
        let address = WK.Genesis().address;
        let tx = new Transaction(
            TxType.Payment,
            [],
            [
                    new TxOutput(BigInt("610000000000000"), address),
                    new TxOutput(BigInt("610000000000000"), address),
                    new TxOutput(BigInt("610000000000000"), address),
                    new TxOutput(BigInt("610000000000000"), address),
                    new TxOutput(BigInt("610000000000000"), address),
                    new TxOutput(BigInt("610000000000000"), address),
                    new TxOutput(BigInt("610000000000000"), address),
                    new TxOutput(BigInt("610000000000000"), address)
            ]
        );

        assert.strictEqual(hashFull(tx).toString(), "0x7a5bfeb96f9caefa377cb" +
            "9a7ffe3ea3dd59ea84d4a1c66304ab8c307a4f47706fe0aec2a73ce2b186a9f" +
            "45641620995f8c7e4c157cee7940872d96d9b2f0f95c", hashFull(tx).toString());


        return tx;
}
