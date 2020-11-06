import {Hash, hashFull, Transaction, TxType, TxInput, TxOutput, KeyPair, PublicKey, Seed} from '../..';
import { WK } from './WK';

export class TransactionBuilder
{
    public inputs: Array<RefInput>;
    public outputs: Array<TxOutput>;
    public tx: Transaction | null;
    public value: bigint;

    constructor (tx: Transaction, index?: number)
    {
        this.inputs = [];
        this.outputs = [];
        this.tx = null;
        this.value = BigInt(0);
        this.attach(tx, index);
    }

    public static create (tx: Transaction, index?: number)
    {
        return new TransactionBuilder(tx, index);
    }

    public attach (tx: Transaction, index?: number): TransactionBuilder
    {
        if (index !== undefined)
        {
            if (index < tx.outputs.length) {
                this.inputs.push(
                    new RefInput(hashFull(tx), index, tx.outputs[index].address)
                );
                this.value += tx.outputs[index].value;
            }
        }
        else
        {
            let tx_hash = hashFull(tx);
            for (let idx = 0; idx < tx.outputs.length; idx++)
            {
                this.inputs.push(
                    new RefInput(tx_hash, idx, tx.outputs[idx].address)
                );
                this.value += tx.outputs[idx].value;
            }
        }

        return this;
    }

    public separate (addresses: Array<PublicKey>): TransactionBuilder
    {
        let amt = this.value / BigInt(addresses.length);
        let sum = BigInt(0);
        for (let idx = 0; idx < addresses.length; idx++)
        {
            if (idx == addresses.length-1)
            {
                this.outputs.push(
                    new TxOutput(this.value - sum, addresses[idx])
                );
            }
            else
            {
                this.outputs.push(
                    new TxOutput(amt, addresses[idx])
                );
            }
            sum += amt;
        }
        this.value = BigInt(0);

        return this;
    }

    public refund (address: PublicKey) : TransactionBuilder
    {
        this.outputs.push(
            new TxOutput(this.value, address)
        );

        this.value = BigInt(0);

        return this;
    }

    public sign (type?: TxType) : Transaction
    {
        if (type === undefined)
            type = TxType.Payment;

        this.tx = new Transaction();
        this.tx.type = type;
        for (let elem of this.inputs)
            this.tx.inputs.push(new TxInput(elem.previous, elem.index));

        for (let elem of this.outputs)
            this.tx.outputs.push(new TxOutput(elem.value, elem.address));

        let tx_hash = hashFull(this.tx);
        for (let idx = 0; idx < this.inputs.length; idx++)
        {
            let keypair = WK.keys(this.inputs[idx].address.toString());
            this.tx.inputs[idx].signature = keypair.secret.sign(tx_hash.data);
        }

        let res = this.tx;
        this.tx = null;
        return res;
    }
}

class RefInput {
    public previous: Hash;
    public index: number;
    public address: PublicKey;

    /**
     * Constructor
     * @param previous The hash of the previous transaction containing the output to spend
     * @param index The index of the output in the previous transaction
     * @param address The public key
     */
    constructor(previous: Hash, index: number, address: PublicKey)
    {
        this.previous = new Hash(previous.data);
        this.index = index;
        this.address = address;
    }
}
