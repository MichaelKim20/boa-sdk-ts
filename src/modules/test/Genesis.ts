import { Transaction, TxType, TxOutput, PublicKey, WK } from '../..';

export
function GenesisTx() {
        let gen_keypair = WK.Genesis();
    return new Transaction(
    TxType.Payment,
    [],
    [
            new TxOutput(BigInt("610000000000000"), PublicKey.fromString(gen_keypair.address.toString())),
            new TxOutput(BigInt("610000000000000"), PublicKey.fromString(gen_keypair.address.toString())),
            new TxOutput(BigInt("610000000000000"), PublicKey.fromString(gen_keypair.address.toString())),
            new TxOutput(BigInt("610000000000000"), PublicKey.fromString(gen_keypair.address.toString())),
            new TxOutput(BigInt("610000000000000"), PublicKey.fromString(gen_keypair.address.toString())),
            new TxOutput(BigInt("610000000000000"), PublicKey.fromString(gen_keypair.address.toString())),
            new TxOutput(BigInt("610000000000000"), PublicKey.fromString(gen_keypair.address.toString())),
            new TxOutput(BigInt("610000000000000"), PublicKey.fromString(gen_keypair.address.toString()))
    ]);
}
