/*******************************************************************************

    Contains definition for the balance for one address

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../common/Amount";

/**
 * Class that defines the balance for one address
 */
export class WalletBalance {
    public address: string;
    public balance: Amount;
    public spendable: Amount;
    public frozen: Amount;
    public locked: Amount;

    constructor(address: string, balance: Amount, spendable: Amount, frozen: Amount, locked: Amount) {
        this.address = address;
        this.balance = balance;
        this.spendable = spendable;
        this.frozen = frozen;
        this.locked = locked;
    }
}
