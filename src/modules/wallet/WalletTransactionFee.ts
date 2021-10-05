/*******************************************************************************

    Contains definition for the fee of the transaction

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";
import { WalletTransactionFeeOption } from "./Types";

/**
 * Define the interface of the fee of the transaction
 */
export class WalletTransactionFee {
    /**
     * The size of the transaction
     */
    public tx_size: number;

    /**
     * The transaction fee for a medium speed
     */
    public medium: Amount;

    /**
     * The transaction fee for a high speed
     */
    public high: Amount;

    /**
     * The transaction fee for a low speed
     */
    public low: Amount;

    /**
     * Constructor
     * @param tx_size The size of the transaction
     * @param medium The transaction fee for a medium speed
     * @param high The transaction fee for a high speed
     * @param low The transaction fee for a low speed
     */
    constructor(tx_size: number, medium: Amount, high: Amount, low: Amount) {
        this.tx_size = tx_size;
        this.medium = medium;
        this.high = high;
        this.low = low;
    }

    /**
     * Returns the value specified in option among TransactionFee fees
     * @param option The fee option of wallet
     */
    public getFee(option: WalletTransactionFeeOption): Amount {
        switch (option) {
            case WalletTransactionFeeOption.High:
                return Amount.make(this.high);
            case WalletTransactionFeeOption.Low:
                return Amount.make(this.low);
            default:
                return Amount.make(this.medium);
        }
    }
}
