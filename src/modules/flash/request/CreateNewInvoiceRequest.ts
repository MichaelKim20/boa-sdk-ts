import { Amount } from "../../common/Amount";
import { hashPart } from "../../common/Hash";
import { PublicKey, SecretKey } from "../../common/KeyPair";
import { Signature } from "../../common/Signature";
import { JSONValidator } from "../../utils/JSONValidator";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

export class CreateNewInvoiceRequest {
    /**
     * The registered public key. If this key is not managed by
     * this Flash node then an error will be returned.
     */
    public reg_pk: PublicKey;

    /**
     * the amount to invoice
     */
    public amount: Amount;

    /**
     * expiry time of this invoice
     */
    public expiry: number;

    /**
     * optional description
     */
    public description: string;

    /**
     * The signature
     */
    public signature: Signature;

    constructor(reg_pk: PublicKey, amount: Amount, expiry: number, description: string, signature?: Signature) {
        this.reg_pk = reg_pk;
        this.amount = amount;
        this.expiry = expiry;
        this.description = description;
        this.signature = signature ? signature : new Signature(Buffer.alloc(Signature.Width));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.reg_pk.computeHash(buffer);
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
     * @returns A new instance of `CreateNewInvoiceRequest` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("CreateNewInvoiceRequest", value);

        return new CreateNewInvoiceRequest(
            new PublicKey(value.reg_pk),
            Amount.make(value.amount),
            Number(value.expiry),
            value.description,
            new Signature(value.signature)
        );
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            reg_pk: this.reg_pk,
            amount: this.amount,
            expiry: this.expiry,
            description: this.description,
            signature: this.signature,
        };
    }

    /**
     * Sign the data with a secret key, save the signature.
     * @param key The secret key
     */
    public sign(key: SecretKey): void {
        this.signature = key.sign<CreateNewInvoiceRequest>(this);
    }

    /**
     * Verify the signature.
     */
    public verify(): boolean {
        return this.reg_pk.verify<CreateNewInvoiceRequest>(this.signature, this);
    }
}
