import { Hash } from "../../common/Hash";
import { PublicKey, SecretKey } from "../../common/KeyPair";
import { Signature } from "../../common/Signature";
import { JSONValidator } from "../../utils/JSONValidator";

import { SmartBuffer } from "smart-buffer";

export class BeginCloseRequest {
    /**
     * The registered public key. If this key is not managed by
     * this Flash node then an error will be returned.
     */
    public reg_pk: PublicKey;

    /**
     * The ID of the channel to close
     */
    public chan_id: Hash;

    /**
     * The signature
     */
    public signature: Signature;

    constructor(reg_pk: PublicKey, chan_id: Hash, signature?: Signature) {
        this.reg_pk = reg_pk;
        this.chan_id = chan_id;
        this.signature = signature ? signature : new Signature(Buffer.alloc(Signature.Width));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.reg_pk.computeHash(buffer);
        this.chan_id.computeHash(buffer);
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

        JSONValidator.isValidOtherwiseThrow("BeginCloseRequest", value);

        return new BeginCloseRequest(
            new PublicKey(value.reg_pk),
            new Hash(value.chan_id),
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
            signature: this.signature,
        };
    }

    /**
     * Sign the data with a secret key, save the signature.
     * @param key The secret key
     */
    public sign(key: SecretKey): void {
        this.signature = key.sign<BeginCloseRequest>(this);
    }

    /**
     * Verify the signature.
     */
    public verify(): boolean {
        return this.reg_pk.verify<BeginCloseRequest>(this.signature, this);
    }
}
