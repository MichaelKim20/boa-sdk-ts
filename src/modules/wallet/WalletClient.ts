/*******************************************************************************

    A class responsible for data requests and responses used in Wallet.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { Hash } from "../common/Hash";
import { PublicKey } from "../common/KeyPair";
import { Transaction } from "../data/Transaction";
import { BOAClient } from "../net/BOAClient";
import { Balance } from "../net/response/Balance";
import { TransactionFee } from "../net/response/TransactionFee";
import { BalanceType, IPendingTxs, ISPVStatus, ITxHistoryElement, ITxOverview } from "../net/response/Types";
import { UnspentTxOutput } from "../net/response/UnspentTxOutput";
import { DefaultWalletOption, IWalletOption, IWalletResult, WalletMessage, WalletResultCode } from "./Types";
import { WalletBalance } from "./WalletBalance";
import { WalletTransactionFee } from "./WalletTransactionFee";

import JSBI from "jsbi";

/**
 * It is a class responsible for data requests and responses used in Wallet.
 */
export class WalletClient {
    /**
     * It is a client to access Agora and Stoa.
     * @private
     */
    private readonly client: BOAClient;

    /**
     * The option of wallet
     * @private
     */
    private option: IWalletOption;

    /**
     * The last time the server status was checked
     * @private
     */
    private checked_time: Date;

    /**
     * Minimum amount of time the server status should be checked
     * @private
     */
    private static CHECK_PERIOD = 5000;

    /**
     * Constructor
     * @param option    The option of wallet
     */
    constructor(option: IWalletOption = DefaultWalletOption()) {
        this.option = option;
        this.client = new BOAClient(this.option.stoaEndpoint, this.option.agoraEndpoint);
        this.checked_time = new Date(0);
    }

    /**
     * Perform access tests on servers
     * @private
     */
    public async checkServer(): Promise<IWalletResult<any>> {
        const now = new Date();
        const duration = now.valueOf() - this.checked_time.valueOf();
        this.checked_time = now;

        // If it has been more than 5 seconds since the previous server health check, re-check.
        if (duration > WalletClient.CHECK_PERIOD) {
            // Agora Access Test
            try {
                if (!(await this.client.getAgoraStatus()))
                    return { code: WalletResultCode.FailedAccessToAgora, message: "Failed access to Agora." };
            } catch (e) {
                return { code: WalletResultCode.FailedAccessToAgora, message: e.message };
            }

            // Stoa Access Test
            try {
                if (!(await this.client.getStoaStatus()))
                    return { code: WalletResultCode.FailedAccessToStoa, message: "Failed access to Stoa." };
            } catch (e) {
                return { code: WalletResultCode.FailedAccessToStoa, message: e.message };
            }
        }

        return {
            code: WalletResultCode.Success,
            message: "Success.",
        };
    }

    /**
     * Check the balance
     */
    public async getBalance(address: PublicKey): Promise<IWalletResult<WalletBalance>> {
        const check_res: IWalletResult<WalletBalance> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let balance: Balance;
        try {
            balance = await this.client.getBalance(address);
        } catch (e) {
            return { code: WalletResultCode.FailedRequestBalance, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: new WalletBalance(
                balance.address,
                Amount.make(balance.balance),
                Amount.make(balance.spendable),
                Amount.make(balance.frozen),
                Amount.make(balance.locked),
                true
            ),
        };
    }

    /**
     * Request an appropriate fee based on the size of the transaction to Stoa.
     * @param tx_size The size of the transaction
     */
    public async getTransactionFee(tx_size: number): Promise<IWalletResult<WalletTransactionFee>> {
        const check_res: IWalletResult<WalletTransactionFee> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: TransactionFee;
        try {
            value = await this.client.getTransactionFee(tx_size);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: new WalletTransactionFee(
                value.tx_size,
                Amount.make(value.medium),
                Amount.make(value.high),
                Amount.make(value.low)
            ),
        };
    }

    /**
     * Request a history of transactions.
     * @param address   An address that want to be inquired.
     * @param page_size Maximum record count that can be obtained from one query
     * @param page      The number on the page, this value begins with 1
     * @param type      The parameter `type` is the type of transaction to query. ("payment", "freeze")
     * @param begin     The start date of the range of dates to look up.
     * @param end       The end date of the range of dates to look up.
     * @param peer      This is used when users want to look up only specific
     * Peer is the withdrawal address in the inbound transaction and a deposit address
     * in the outbound transaction address of their counterparts.
     */
    public async getTransactionsHistory(
        address: PublicKey,
        page_size: number,
        page: number,
        type: string[],
        begin?: number,
        end?: number,
        peer?: string
    ): Promise<IWalletResult<ITxHistoryElement[]>> {
        const check_res: IWalletResult<ITxHistoryElement[]> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: ITxHistoryElement[];
        try {
            value = await this.client.getWalletTransactionsHistory(address, page_size, page, type, begin, end, peer);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Request a overview of a transaction.
     * @param tx_hash The hash of the transaction
     */
    public async getTransactionOverview(tx_hash: Hash): Promise<IWalletResult<ITxOverview>> {
        const check_res: IWalletResult<ITxOverview> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: ITxOverview;
        try {
            value = await this.client.getWalletTransactionOverview(tx_hash);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Request pending transactions.
     * @param address The input address of the pending transaction
     */
    public async getTransactionsPending(address: PublicKey): Promise<IWalletResult<IPendingTxs[]>> {
        const check_res: IWalletResult<IPendingTxs[]> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: IPendingTxs[];
        try {
            value = await this.client.getWalletTransactionsPending(address);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Request a pending transaction based on the hash of the transaction.
     * @param tx_hash The hash of the transaction
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public async getPendingTransaction(tx_hash: Hash): Promise<IWalletResult<Transaction>> {
        const check_res: IWalletResult<Transaction> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: Transaction;
        try {
            value = await this.client.getPendingTransaction(tx_hash);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Request a transaction based on the hash of the transaction.
     * @param tx_hash The hash of the transaction
     */
    public async getTransaction(tx_hash: Hash): Promise<IWalletResult<Transaction>> {
        const check_res: IWalletResult<Transaction> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: Transaction;
        try {
            value = await this.client.getTransaction(tx_hash);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Saves the data to the blockchain
     * @param tx The instance of the Transaction
     */
    public async sendTransaction(tx: Transaction): Promise<IWalletResult<boolean>> {
        const check_res: IWalletResult<boolean> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: boolean;
        try {
            value = await this.client.sendTransaction(tx);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Request an Stoa's current block height.
     */
    public async getBlockHeight(): Promise<IWalletResult<JSBI>> {
        const check_res: IWalletResult<JSBI> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: JSBI;
        try {
            value = await this.client.getBlockHeight();
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Request a fee for a voting transaction
     */
    public async getVotingFee(payload_size: number): Promise<IWalletResult<JSBI>> {
        const check_res: IWalletResult<JSBI> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: JSBI;
        try {
            value = await this.client.getVotingFee(payload_size);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Request UTXOs of public key
     * @param address The address of UTXOs
     * @param amount  The amount required
     * @param type    The type of balance (0: spendable, 1: frozen, 2: locked)
     * @param last    The last UTXO hash of previous inquiries.
     * The first time request, this value is undefined.
     * @returns Promise that resolves or
     * rejects with response from the Stoa
     */
    public async getUTXOs(
        address: PublicKey,
        amount: JSBI | Amount,
        type: BalanceType,
        last?: Hash
    ): Promise<IWalletResult<UnspentTxOutput[]>> {
        const check_res: IWalletResult<UnspentTxOutput[]> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: UnspentTxOutput[];
        try {
            value = await this.client.getWalletUTXOs(address, amount, type, last);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Request UTXO's information about the UTXO hash array.
     * @param hashes The hash of UTXOs
     */
    public async getUTXOInfo(hashes: Hash[]): Promise<IWalletResult<UnspentTxOutput[]>> {
        const check_res: IWalletResult<UnspentTxOutput[]> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: UnspentTxOutput[];
        try {
            value = await this.client.getUTXOInfo(hashes);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }

    /**
     * Simple verify payment
     * Check if the transaction is stored in a block.
     * And check if Merkle's proof is valid.
     * @param tx_hash The hash of the transaction
     */
    public async verifyPayment(tx_hash: Hash): Promise<IWalletResult<ISPVStatus>> {
        const check_res: IWalletResult<ISPVStatus> = await this.checkServer();
        if (check_res.code !== WalletResultCode.Success) return check_res;

        let value: ISPVStatus;
        try {
            value = await this.client.verifyPayment(tx_hash);
        } catch (e) {
            return { code: WalletResultCode.FailedRequest, message: e.message };
        }

        return {
            code: WalletResultCode.Success,
            message: WalletMessage.Success,
            data: value,
        };
    }
}
