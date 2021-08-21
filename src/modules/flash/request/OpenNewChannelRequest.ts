import { Amount } from "../../common/Amount";
import { Point } from "../../common/ECC";
import { Hash, hashPart } from "../../common/Hash";
import { PublicKey, SecretKey } from "../../common/KeyPair";
import { Signature } from "../../common/Signature";
import { JSONValidator } from "../../utils/JSONValidator";
import { UTXO } from "../data/UTXO";

import JSBI from "jsbi";
import { SmartBuffer } from "smart-buffer";

export class OpenNewChannelRequest {
    /**
     * The registered public key. If this key is not managed by
     * this Flash node then an error will be returned.
     */
    public reg_pk: PublicKey;

    /**
     * The UTXO that will be used to fund the setup tx
     */
    public funding_utxo: UTXO;

    /**
     * hash of `funding_utxo`
     */
    public funding_utxo_hash: Hash;

    /**
     * The amount that will be used to fund the setup tx
     */
    public capacity: Amount;

    /**
     * closing settle time in number of blocks since last
     * setup / update tx was published on the blockchain
     */
    public settle_time: number;

    /**
     * The public key of the counter-party flash node
     */
    public peer_pk: Point;

    /**
     * The signature
     */
    public signature: Signature;

    constructor(
        reg_pk: PublicKey,
        funding_utxo: UTXO,
        funding_utxo_hash: Hash,
        capacity: Amount,
        settle_time: number,
        peer_pk: Point,
        signature?: Signature
    ) {
        this.reg_pk = reg_pk;
        this.funding_utxo = funding_utxo;
        this.funding_utxo_hash = funding_utxo_hash;
        this.capacity = capacity;
        this.settle_time = settle_time;
        this.peer_pk = peer_pk;
        this.signature = signature ? signature : new Signature(Buffer.alloc(Signature.Width));
    }

    /**
     * Collects data to create a hash.
     * @param buffer The buffer where collected data is stored
     */
    public computeHash(buffer: SmartBuffer) {
        this.reg_pk.computeHash(buffer);
        this.funding_utxo.computeHash(buffer);
        this.funding_utxo_hash.computeHash(buffer);
        this.capacity.computeHash(buffer);
        hashPart(JSBI.BigInt(this.settle_time), buffer);
        this.peer_pk.computeHash(buffer);
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `OpenNewChannelRequest` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("OpenNewChannelRequest", value);

        return new OpenNewChannelRequest(
            new PublicKey(value.reg_pk),
            UTXO.reviver("", value.funding_utxo),
            new Hash(value.funding_utxo_hash),
            Amount.make(value.capacity),
            Number(value.settle_time),
            new Point(value.peer_pk),
            new Signature(value.signature)
        );
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            reg_pk: this.reg_pk,
            funding_utxo: this.funding_utxo,
            funding_utxo_hash: this.funding_utxo_hash,
            capacity: this.capacity,
            settle_time: this.settle_time,
            peer_pk: this.peer_pk,
            signature: this.signature,
        };
    }

    /**
     * Sign the data with a secret key, save the signature.
     * @param key The secret key
     */
    public sign(key: SecretKey): void {
        this.signature = key.sign<OpenNewChannelRequest>(this);
    }

    /**
     * Verify the signature.
     */
    public verify(): boolean {
        return this.reg_pk.verify<OpenNewChannelRequest>(this.signature, this);
    }
}
