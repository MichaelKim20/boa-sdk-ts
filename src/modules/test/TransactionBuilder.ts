import {Hash, hashFull, makeUTXOKey, Transaction, TxType, TxInput, TxOutput, KeyPair, PublicKey, Seed} from '../..';
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
                    new RefInput(makeUTXOKey(hashFull(tx), index), tx.outputs[index].address)
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
                    new RefInput(makeUTXOKey(tx_hash, idx), tx.outputs[idx].address)
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
            this.tx.inputs.push(new TxInput(elem.utxo));

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
    public utxo: Hash;
    public address: PublicKey;

    /**
     * Constructor
     * @param utxo The hash of the UTXO to be spent
     * @param address The public key
     */
    constructor(utxo: Hash, address: PublicKey)
    {
        this.utxo = new Hash(utxo.data);
        this.address = address;
    }
}
