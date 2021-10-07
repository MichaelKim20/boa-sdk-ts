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
    public enable: boolean;

    constructor(
        address: string = "",
        balance: Amount = Amount.make(0),
        spendable: Amount = Amount.make(0),
        frozen: Amount = Amount.make(0),
        locked: Amount = Amount.make(0),
        enable: boolean = false
    ) {
        this.address = address;
        this.balance = balance;
        this.spendable = spendable;
        this.frozen = frozen;
        this.locked = locked;
        this.enable = enable;
    }
}
