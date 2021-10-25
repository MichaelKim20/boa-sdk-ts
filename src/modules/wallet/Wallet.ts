/*******************************************************************************

    It is a class that provides balance check, transfer functions for one key pair.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { Hash } from "../common/Hash";
import { KeyPair, PublicKey } from "../common/KeyPair";
import { Transaction } from "../data/Transaction";
import { TxInput } from "../data/TxInput";
import { OutputType } from "../data/TxOutput";
import { BalanceType } from "../net/response/Types";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { LockType } from "../script/Lock";
import { TxBuilder } from "../utils/TxBuilder";
import { TxCanceller, TxCancelResultCode } from "../utils/TxCanceller";
import { TxPayloadFee } from "../utils/TxPayloadFee";
import { Utils } from "../utils/Utils";

import {
    DefaultWalletOption,
    IWalletOption,
    IWalletReceiver,
    IWalletResult,
    WalletMessage,
    WalletResultCode,
} from "./Types";
import { WalletBalance } from "./WalletBalance";
import { WalletClient } from "./WalletClient";
import { WalletTransactionFee } from "./WalletTransactionFee";
import { WalletUTXOProvider } from "./WalletUTXOProvider";

/**
 * It is a class that provides balance check, transfer functions for one key pair.
 */
export class Wallet {
    /**
     * A key pair used to perform the functions provided by this class.
     * @private
     */
    private readonly owner: KeyPair;

    /**
     * It is a client to access Agora and Stoa.
     * @private
     */
    private readonly client: WalletClient;

    /**
     * The instance of UTXOProvider
     * @private
     */
    private spendableUtxoProvider: WalletUTXOProvider;

    /**
     * The instance of UTXOProvider
     * @private
     */
    private frozenUtxoProvider: WalletUTXOProvider;

    /**
     * The instance of TxBuilder
     * @private
     */
    private txBuilder: TxBuilder;

    /**
     * The option of wallet
     * @private
     */
    private option: IWalletOption;

    /**
     * Constructor
     * @param owner     The key pair
     * @param option    The option of wallet
     */
    constructor(owner: KeyPair, option: IWalletOption = DefaultWalletOption()) {
        this.owner = owner;
        this.option = option;
        this.client = new WalletClient(this.option.endpoint);
        this.txBuilder = new TxBuilder(this.owner);
        this.spendableUtxoProvider = new WalletUTXOProvider(this.owner.address, this.client, BalanceType.spendable);
        this.frozenUtxoProvider = new WalletUTXOProvider(this.owner.address, this.client, BalanceType.frozen);
    }

    /**
     * Check the balance
     */
    public getBalance(): Promise<IWalletResult<WalletBalance>> {
        return this.client.getBalance(this.owner.address);
    }

    /**
     * Transfer the BOA corresponding to the amount to the receiver.
     * The payload is the data to be stored in the block. A separate cost is incurred.
     * @param output_type The type of transaction output (0: OutputType.Payment, 1: OutputType.Freeze)
     * @param receiver  The array of recipient information
     * @param payload   The data to be stored, not used if not entered.
     * @private
     */
    private async _transfer(
        output_type: OutputType,
        receiver: IWalletReceiver[],
        payload?: Buffer
    ): Promise<IWalletResult<Transaction>> {
        if (receiver.length === 0)
            return { code: WalletResultCode.NotExistReceiver, message: WalletMessage.NotExistReceiver };

        const payloadLength = payload === undefined ? 0 : payload.length;
        const payloadFee = TxPayloadFee.getFeeAmount(payloadLength);
        const sendBOA = receiver.reduce<Amount>((sum, value) => Amount.add(sum, value.amount), Amount.make(0));
        const outputCount = receiver.length + 1;
        let estimatedTxFee = Amount.make(
            Utils.FEE_RATE * Transaction.getEstimatedNumberOfBytes(0, outputCount, payloadLength)
        );
        let totalFee = Amount.add(payloadFee, estimatedTxFee);
        let totalSpendAmount = Amount.add(totalFee, sendBOA);

        // Extract the UTXO to be spent.
        let utxosToSpend: UnspentTxOutput[];
        try {
            const utxo_res = await this.spendableUtxoProvider.getUTXO(
                totalSpendAmount,
                Amount.make(Utils.FEE_RATE * TxInput.getEstimatedNumberOfBytes())
            );
            if (utxo_res.code !== WalletResultCode.Success || utxo_res.data === undefined) {
                return { code: utxo_res.code, message: utxo_res.message };
            }
            utxosToSpend = utxo_res.data;
        } catch (e) {
            return { code: WalletResultCode.FailedRequestUTXO, message: WalletMessage.FailedRequestUTXO };
        }

        if (utxosToSpend.length === 0) {
            return { code: WalletResultCode.NotEnoughAmount, message: WalletMessage.NotEnoughAmount };
        }

        let tx: Transaction;
        try {
            utxosToSpend.forEach((u: UnspentTxOutput) => this.txBuilder.addInput(u.utxo, u.amount));

            estimatedTxFee = Amount.make(
                Utils.FEE_RATE * Transaction.getEstimatedNumberOfBytes(utxosToSpend.length, outputCount, payloadLength)
            );

            // Assign Payload
            if (payload !== undefined) this.txBuilder.assignPayload(payload);

            // Build a transaction
            receiver.forEach((m) => this.txBuilder.addOutput(m.address, m.amount));
            tx = this.txBuilder.sign(output_type, estimatedTxFee, payloadFee);
        } catch (e) {
            return { code: WalletResultCode.FailedBuildTransaction, message: WalletMessage.FailedBuildTransaction };
        }

        // Get the size of the transaction
        let txSize = tx.getNumberOfBytes();
        let fees: WalletTransactionFee;

        // Fees based on the transaction size is obtained from Stoa.
        try {
            const fee_res = await this.client.getTransactionFee(txSize);
            if (fee_res.code !== WalletResultCode.Success || fee_res.data === undefined) {
                return { code: fee_res.code, message: fee_res.message };
            }
            fees = fee_res.data;
        } catch (e) {
            return { code: WalletResultCode.FailedRequestTxFee, message: WalletMessage.FailedRequestTxFee };
        }

        // Set the fee according to the option of the entered fee.
        let txFee = fees.getFee(this.option.fee);
        let sumAmountUtxo = utxosToSpend.reduce<Amount>((sum, n) => Amount.add(sum, n.amount), Amount.make(0));
        totalFee = Amount.add(payloadFee, txFee);
        totalSpendAmount = Amount.add(totalFee, sendBOA);

        // If the sum of the already extracted UTXO is less than the transfer amount including the fee, a new UTXO is added
        while (Amount.lessThan(sumAmountUtxo, totalSpendAmount)) {
            // Add additional UTXO for the required amount.
            let moreUtxosToSpend: UnspentTxOutput[];
            try {
                const utxo_res = await this.spendableUtxoProvider.getUTXO(
                    Amount.subtract(totalSpendAmount, sumAmountUtxo),
                    Amount.make(Utils.FEE_RATE * TxInput.getEstimatedNumberOfBytes())
                );
                if (utxo_res.code !== WalletResultCode.Success || utxo_res.data === undefined) {
                    return { code: utxo_res.code, message: utxo_res.message };
                }
                moreUtxosToSpend = utxo_res.data;
            } catch (e) {
                return { code: WalletResultCode.FailedRequestUTXO, message: WalletMessage.FailedRequestUTXO };
            }

            if (moreUtxosToSpend.length === 0) {
                return { code: WalletResultCode.NotEnoughAmount, message: WalletMessage.NotEnoughAmount };
            }

            // region Get the fee of new transaction

            // Add new UTXOs
            utxosToSpend.push(...moreUtxosToSpend);
            try {
                utxosToSpend.forEach((u: UnspentTxOutput) => this.txBuilder.addInput(u.utxo, u.amount));

                // Assign Payload
                if (payload !== undefined) this.txBuilder.assignPayload(payload);

                // Build a transaction
                receiver.forEach((m) => this.txBuilder.addOutput(m.address, m.amount));
                tx = this.txBuilder.sign(output_type, txFee, payloadFee);
            } catch (e) {
                return { code: WalletResultCode.FailedBuildTransaction, message: WalletMessage.FailedBuildTransaction };
            }

            // Get the size of the transaction
            txSize = tx.getNumberOfBytes();

            // Fees based on the transaction size is obtained from Stoa.
            try {
                const fee_res = await this.client.getTransactionFee(txSize);
                if (fee_res.code !== WalletResultCode.Success || fee_res.data === undefined) {
                    return { code: fee_res.code, message: fee_res.message };
                }
                fees = fee_res.data;
            } catch (e) {
                return { code: WalletResultCode.FailedRequestTxFee, message: WalletMessage.FailedRequestTxFee };
            }

            // Select medium
            txFee = fees.getFee(this.option.fee);

            // endregion

            sumAmountUtxo = utxosToSpend.reduce<Amount>((sum, n) => Amount.add(sum, n.amount), Amount.make(0));
            totalSpendAmount = Amount.add(Amount.add(payloadFee, txFee), sendBOA);
        }

        try {
            utxosToSpend.forEach((u: UnspentTxOutput) => this.txBuilder.addInput(u.utxo, u.amount));

            // Assign Payload
            if (payload !== undefined) this.txBuilder.assignPayload(payload);

            // Build a transaction
            receiver.forEach((m) => this.txBuilder.addOutput(m.address, m.amount));
            tx = this.txBuilder.sign(output_type, txFee, payloadFee);
        } catch (e) {
            return { code: WalletResultCode.FailedBuildTransaction, message: WalletMessage.FailedBuildTransaction };
        }

        try {
            await this.client.sendTransaction(tx);
        } catch (e) {
            return {
                code: WalletResultCode.FailedSendTx,
                message: WalletMessage.FailedSendTx,
            };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: tx,
        };
    }

    /**
     * Transfer the BOA corresponding to the amount to the receiver.
     * The payload is the data to be stored in the block. A separate cost is incurred.
     * @param receiver  The array of recipient information
     * @param payload   The data to be stored, not used if not entered.
     */
    public async transfer(receiver: IWalletReceiver[], payload?: Buffer): Promise<IWalletResult<Transaction>> {
        return this._transfer(OutputType.Payment, receiver, payload);
    }

    /**
     * Among the transactions sent to Agora, it is a function to cancel
     * a transaction that is not yet included in the block.
     * This does not remove the previous transaction itself.
     * This creates a new transaction that transfers all UTXOs used
     * in the transaction to be canceled to the same address,
     * and sends it to Agora.
     * However, while it is being sent and processed, a previous transaction
     * that wants to be canceled may be included in the block first.
     * @param tx Previously sent the transaction to be canceled
     * @param key_finder A function that finds KeyPairs that can consume UTXOs and returns them to an array.
     */
    public async cancel(
        tx: Transaction,
        key_finder?: (addresses: PublicKey[]) => KeyPair[]
    ): Promise<IWalletResult<Transaction>> {
        if (tx.isCoinbase()) {
            return {
                code: WalletResultCode.Cancel_NotAllowCoinbase,
                message: WalletMessage.Cancel_NotAllowCoinbase,
            };
        }

        let utxos: UnspentTxOutput[];
        // Requests the information of the UTXO used in the transaction.
        try {
            const utxo_res = await this.client.getUTXOInfo(tx.inputs.map((m) => m.utxo));
            if (utxo_res.code !== WalletResultCode.Success || utxo_res.data === undefined) {
                return { code: utxo_res.code, message: utxo_res.message };
            }
            utxos = utxo_res.data;
        } catch (e) {
            return { code: WalletResultCode.FailedRequestUTXO, message: e.message };
        }

        let key_pairs: KeyPair[];
        if (key_finder !== undefined) {
            key_pairs = key_finder(
                utxos
                    .filter((m) => m.lock_type === LockType.Key)
                    .map((u) => new PublicKey(Buffer.from(u.lock_bytes, "base64")))
            );
        } else {
            key_pairs = [this.owner];
        }

        // Create a cancellation transaction.
        const canceller = new TxCanceller(tx, utxos, key_pairs);
        const res = canceller.build();

        // Check for errors that occurred during the cancellation transaction creation process.
        switch (res.code) {
            case TxCancelResultCode.Cancel_NotAllowUnfreezing:
                return {
                    code: WalletResultCode.Cancel_NotAllowUnfreezing,
                    message: WalletMessage.Cancel_NotAllowUnfreezing,
                    data: res.tx,
                };
            case TxCancelResultCode.Cancel_InvalidTransaction:
                return {
                    code: WalletResultCode.Cancel_InvalidTransaction,
                    message: WalletMessage.Cancel_InvalidTransaction,
                    data: res.tx,
                };
            case TxCancelResultCode.Cancel_NotFoundUTXO:
                return {
                    code: WalletResultCode.Cancel_NotFoundUTXO,
                    message: WalletMessage.Cancel_NotFoundUTXO,
                    data: res.tx,
                };
            case TxCancelResultCode.Cancel_UnsupportedLockType:
                return {
                    code: WalletResultCode.Cancel_UnsupportedLockType,
                    message: WalletMessage.Cancel_UnsupportedLockType,
                    data: res.tx,
                };
            case TxCancelResultCode.Cancel_NotFoundKey:
                return {
                    code: WalletResultCode.Cancel_NotFoundKey,
                    message: WalletMessage.Cancel_NotFoundKey,
                    data: res.tx,
                };
            case TxCancelResultCode.Cancel_NotEnoughFee:
                return {
                    code: WalletResultCode.Cancel_NotEnoughFee,
                    message: WalletMessage.Cancel_NotEnoughFee,
                    data: res.tx,
                };
            case TxCancelResultCode.FailedBuildTransaction:
                return {
                    code: WalletResultCode.FailedBuildTransaction,
                    message: WalletMessage.FailedBuildTransaction,
                    data: res.tx,
                };
        }

        // If there are no errors, send
        if (res.code === TxCancelResultCode.Success && res.tx !== undefined) {
            try {
                await this.client.sendTransaction(res.tx);
            } catch (e) {
                return {
                    code: WalletResultCode.FailedSendTx,
                    message: WalletMessage.FailedSendTx,
                };
            }
            return {
                code: WalletResultCode.Success,
                message: WalletMessage.Success,
                data: res.tx,
            };
        } else {
            return {
                code: WalletResultCode.UnknownError,
                message: WalletMessage.UnknownError,
            };
        }
    }

    /**
     * Among the transactions sent to Agora, it is a function to cancel
     * a transaction that is not yet included in the block.
     * This does not remove the previous transaction itself.
     * This creates a new transaction that transfers all UTXOs used
     * in the transaction to be canceled to the same address,
     * and sends it to Agora.
     * However, while it is being sent and processed, a previous transaction
     * that wants to be canceled may be included in the block first.
     * @param tx_hash Previously sent the transaction hash to be canceled
     * @param key_finder A function that finds KeyPairs that can consume UTXOs and returns them to an array.
     */
    public async cancelWithHash(
        tx_hash: Hash,
        key_finder?: (addresses: PublicKey[]) => KeyPair[]
    ): Promise<IWalletResult<Transaction>> {
        let tx: Transaction;
        try {
            const res = await this.client.getPendingTransaction(tx_hash);
            if (res.code !== WalletResultCode.Success || res.data === undefined) {
                return { code: res.code, message: res.message };
            }
            tx = res.data;
        } catch (e) {
            return {
                code: WalletResultCode.FailedRequestPendingTransaction,
                message: WalletMessage.FailedRequestPendingTransaction,
            };
        }
        return this.cancel(tx, key_finder);
    }

    /**
     * Freeze the funds specified at the specified address.
     * @param receiver It is an object that has a receiving address and amount.
     */
    public async freeze(receiver: IWalletReceiver): Promise<IWalletResult<Transaction>> {
        return this._transfer(OutputType.Freeze, [receiver]);
    }

    /**
     * Unfreeze frozen UTXO.
     * @param utxos     Hashes of frozen UTXO
     * @param receiver  Public address to receive the unfreeze amount
     */
    public async unfreeze(utxos: Hash[], receiver: PublicKey): Promise<IWalletResult<Transaction>> {
        let unspentTxOutputs: UnspentTxOutput[];
        // Requests the information of the UTXO used in the transaction.
        try {
            const utxo_res = await this.client.getUTXOInfo(utxos.map((m) => m));
            if (utxo_res.code !== WalletResultCode.Success || utxo_res.data === undefined) {
                return { code: utxo_res.code, message: utxo_res.message };
            }
            unspentTxOutputs = utxo_res.data;
        } catch (e) {
            return { code: WalletResultCode.FailedRequestUTXO, message: WalletMessage.FailedRequestUTXO };
        }

        const not_freeze = unspentTxOutputs.some((m) => m.type !== OutputType.Freeze);
        if (not_freeze) {
            return { code: WalletResultCode.ExistNotFrozenUTXO, message: WalletMessage.ExistNotFrozenUTXO };
        }

        const payloadFee = Amount.make(0);
        const outputCount = 1;

        const sumOfUTXO: Amount = unspentTxOutputs.reduce<Amount>(
            (sum, u) => Amount.add(sum, u.amount),
            Amount.make(0)
        );
        const txSize = Transaction.getEstimatedNumberOfBytes(unspentTxOutputs.length, outputCount, 0);

        let fees: WalletTransactionFee;
        // Fees based on the transaction size is obtained from Stoa.
        try {
            const fee_res = await this.client.getTransactionFee(txSize);
            if (fee_res.code !== WalletResultCode.Success || fee_res.data === undefined) {
                return { code: fee_res.code, message: fee_res.message };
            }
            fees = fee_res.data;
        } catch (e) {
            return { code: WalletResultCode.FailedRequestTxFee, message: WalletMessage.FailedRequestTxFee };
        }

        // Set the fee according to the option of the entered fee.
        const txFee = fees.getFee(this.option.fee);
        const amount: Amount = Amount.subtract(sumOfUTXO, txFee);

        // Build a transaction
        let tx: Transaction;
        try {
            unspentTxOutputs.forEach((u: UnspentTxOutput) => this.txBuilder.addInput(u.utxo, u.amount));
            this.txBuilder.addOutput(receiver, amount);
            tx = this.txBuilder.sign(OutputType.Payment, txFee, payloadFee);
        } catch (e) {
            return { code: WalletResultCode.FailedBuildTransaction, message: WalletMessage.FailedBuildTransaction };
        }

        try {
            await this.client.sendTransaction(tx);
        } catch (e) {
            return {
                code: WalletResultCode.FailedSendTx,
                message: WalletMessage.FailedSendTx,
            };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: tx,
        };
    }

    /**
     * Returns an array of all frozen UTXOs for addresses already set
     */
    public async getFrozenUTXOs(amount: Amount): Promise<IWalletResult<UnspentTxOutput[]>> {
        let frozenUtxos: UnspentTxOutput[];
        try {
            const utxo_res = await this.frozenUtxoProvider.getUTXO(amount);
            if (utxo_res.code !== WalletResultCode.Success || utxo_res.data === undefined) {
                return { code: utxo_res.code, message: utxo_res.message };
            }
            frozenUtxos = utxo_res.data;
        } catch (e) {
            return { code: WalletResultCode.FailedRequestUTXO, message: WalletMessage.FailedRequestUTXO };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: frozenUtxos,
        };
    }
}
