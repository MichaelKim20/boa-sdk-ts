import { Amount } from "../../common/Amount";
import { Hash } from "../../common/Hash";
import { PublicKey, SecretKey } from "../../common/KeyPair";
import { Signature } from "../../common/Signature";
import { JSONValidator } from "../../utils/JSONValidator";

import { SmartBuffer } from "smart-buffer";

export class ChangeFeeRequest {
    /**
     * The registered public key. If this key is not managed by
     * this Flash node then an error will be returned.
     */
    public reg_pk: PublicKey;

    /**
     * channel ID
     */
    public chan_id: Hash;

    /**
     * Fixed fee that should paid for each payment
     */
    public fixed_fee: Amount;

    /**
     * Proportional fee that should paid for each BOA
     */
    public proportional_fee: Amount;

    /**
     * The signature
     */
    public signature: Signature;

    constructor(reg_pk: PublicKey, chan_id: Hash, fixed_fee: Amount, proportional_fee: Amount, signature?: Signature) {
        this.reg_pk = reg_pk;
        this.chan_id = chan_id;
        this.fixed_fee = fixed_fee;
        this.proportional_fee = proportional_fee;
        this.signature = signature ? signature : new Signature(Buffer.alloc(Signature.Width));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.reg_pk.computeHash(buffer);
        this.chan_id.computeHash(buffer);
        this.fixed_fee.computeHash(buffer);
        this.proportional_fee.computeHash(buffer);
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `ChangeFeeRequest` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("ChangeFeeRequest", value);

        return new ChangeFeeRequest(
            new PublicKey(value.reg_pk),
            new Hash(value.chan_id),
            Amount.make(value.fixed_fee),
            Amount.make(value.proportional_fee),
            new Signature(value.signature)
        );
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            reg_pk: this.reg_pk,
            chan_id: this.chan_id,
            fixed_fee: this.fixed_fee,
            proportional_fee: this.proportional_fee,
            signature: this.signature,
        };
    }

    /**
     * Sign the data with a secret key, save the signature.
     * @param key The secret key
     */
    public sign(key: SecretKey): void {
        this.signature = key.sign<ChangeFeeRequest>(this);
    }

    /**
     * Verify the signature.
     */
    public verify(): boolean {
        return this.reg_pk.verify<ChangeFeeRequest>(this.signature, this);
    }
}
