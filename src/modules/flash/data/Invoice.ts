/*******************************************************************************

    Contains the invoice definition.

    A randomly-generated secret is generated, and the hash of it is stored
    in the invoice together with the invoice's amount, expiry,
    and any description.

    The secret should be shared with the party which will pay the invoice.
    The hash of the secret is used in the contract which is shared across
    zero or more channel hops. The payment is realized once the payer reveals
    the secret, and all the channel pairs in the multi-hop channel layout
    have their settle/update transactions signed.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../../common/Amount";
import { Point } from "../../common/ECC";
import { Hash, hashPart } from "../../common/Hash";
import { JSONValidator } from "../../utils/JSONValidator";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

/**
 *  The class of invoice.
 *  A randomly-generated secret is generated, and the hash of it is stored
 *  in the invoice together with the invoice's amount, expiry,
 *  and any description.
 *
 *  The secret should be shared with the party which will pay the invoice.
 *  The hash of the secret is used in the contract which is shared across
 *  zero or more channel hops. The payment is realized once the payer reveals
 *  the secret, and all the channel pairs in the multi-hop channel layout
 *  have their settle/update transactions signed.
 */
export class Invoice {
    /**
     * Hash of the secret. Also known as the payment hash.
     */
    public payment_hash: Hash;

    /**
     * Payment destination
     */
    public destination: Point;

    /**
     * The amount to pay for this invoice.
     */
    public amount: Amount;

    /**
     * The expiry time of this invoice. A node will (?) reject payments to an
     * invoice if the payment is received after the expiry time.
     */
    public expiry: number;

    /**
     * Invoice description. Useful for user-facing UIs (kiosks), may be empty.
     */
    public description: string;

    /**
     * constructor
     * @param payment_hash  Hash of the secret. Also known as the payment hash
     * @param destination   Payment destination
     * @param amount        The amount to pay for this invoice
     * @param expiry        The expiry time of this invoice
     * @param description   The invoice description
     */
    constructor(payment_hash: Hash, destination: Point, amount: Amount, expiry: number, description: string) {
        this.payment_hash = payment_hash;
        this.destination = destination;
        this.amount = amount;
        this.expiry = expiry;
        this.description = description;
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.payment_hash.computeHash(buffer);
        this.destination.computeHash(buffer);
        this.amount.computeHash(buffer);
        hashPart(JSBI.BigInt(this.expiry), buffer);
        hashPart(this.description, buffer);
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `Invoice` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("Invoice", value);

        return new Invoice(
            new Hash(value.payment_hash),
            new Point(value.destination),
            Amount.make(value.amount),
            Number(value.expiry),
            value.description
        );
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            payment_hash: this.payment_hash,
            destination: this.destination,
            amount: this.amount,
            expiry: this.expiry,
            description: this.description,
        };
    }
}
