/*******************************************************************************

    Contains a required class for channel configuration.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../../common/Amount";
import { Hash } from "../../common/Hash";
import { PublicKey } from "../../common/KeyPair";
import { Transaction } from "../../data/Transaction";
import { JSONValidator } from "../../utils/JSONValidator";

/**
 * The class of channel configuration. These fields remain static throughout the
 * lifetime of the channel. All of these fields are public and known
 * by all participants in the channel.
 */
export class ChannelConfig {
    /**
     * Hash of the genesis block, used to determine which blockchain this
     * channel belongs to.
     */
    public gen_hash: Hash;

    /**
     * Public key of the funder of the channel.
     */
    public funder_pk: PublicKey;

    /**
     * Public key of the counter-party to the channel.
     */
    public peer_pk: PublicKey;

    /**
     * Sum of `funder_pk + peer_pk`.
     */
    public pair_pk: PublicKey;

    /**
     * Total number of co-signers needed to make update/settlement transactions
     * in this channel.
     */
    public num_peers: number;

    /**
     * The public key sum used for validating Update transactions.
     * This key is derived and remains static throughout the
     * lifetime of the channel.
     */
    public update_pair_pk: PublicKey;

    /**
     * The funding transaction from which the trigger transaction may spend.
     * This transaction is unsigned - only the funder may sign & send it
     * to the agora network for externalization. The peer can retrieve
     * the signature when it detects this transaction is in the blockchain.
     */
    public funding_tx: Transaction;

    /**
     * Hash of the funding transaction above.
     */
    public funding_tx_hash: Hash;

    /**
     * The utxo that will actually be spent from the funding tx (just index 0)
     */
    public funding_utxo_idx: number;

    /**
     * The total amount funded in this channel. This information is
     * derived from the Outputs of the funding transaction.
     */
    public capacity: Amount;

    /**
     * The settle time to use for the settlement transactions. This time is
     * verified by the `OP.VERIFY_UNLOCK_AGE` opcode in the lock script
     * of the trigger / update transactions.
     */
    public settle_time: number;

    /**
     * How long a node will wait for a response after some calls to
     * `closeChannel` before the node decides to unilaterally close the channel.
     * This is only an informative value and cannot be guaranteed by the
     * protocol, but it gives well-behaved nodes an ability to mutually agree
     * on a sufficiently long delay before a unilateral close is attempted.
     * note: using `ulong` due to Serializer errors with Duration
     */
    public cooperative_close_timeout: number;

    /**
     * The channel's ID is derived from the hash of the funding transaction.
     */
    public chan_id: Hash;

    /**
     * Constructor
     * @param gen_hash          Hash of the genesis block, used to determine which blockchain this channel belongs to
     * @param funder_pk         Public key of the funder of the channel
     * @param peer_pk           Public key of the counter-party to the channel.
     * @param pair_pk           Sum of `funder_pk + peer_pk`.
     * @param num_peers         Total number of co-signers needed to make update/settlement transactions in this channel.
     * @param update_pair_pk    The public key sum used for validating Update transactions.
     * @param funding_tx        The funding transaction from which the trigger transaction may spend.
     * @param funding_tx_hash   Hash of the funding transaction above.
     * @param funding_utxo_idx  The utxo that will actually be spent from the funding tx (just index 0)
     * @param capacity          The total amount funded in this channel.
     * @param settle_time       The settle time to use for the settlement transactions.
     * @param cooperative_close_timeout How long a node will wait for a response after some calls to
     * `closeChannel` before the node decides to unilaterally close the channel.
     */
    constructor(
        gen_hash: Hash,
        funder_pk: PublicKey,
        peer_pk: PublicKey,
        pair_pk: PublicKey,
        num_peers: number,
        update_pair_pk: PublicKey,
        funding_tx: Transaction,
        funding_tx_hash: Hash,
        funding_utxo_idx: number,
        capacity: Amount,
        settle_time: number,
        cooperative_close_timeout: number
    ) {
        this.gen_hash = gen_hash;
        this.funder_pk = funder_pk;
        this.peer_pk = peer_pk;
        this.pair_pk = pair_pk;
        this.num_peers = num_peers;
        this.update_pair_pk = update_pair_pk;
        this.funding_tx = funding_tx;
        this.funding_tx_hash = funding_tx_hash;
        this.funding_utxo_idx = funding_utxo_idx;
        this.capacity = capacity;
        this.settle_time = settle_time;
        this.cooperative_close_timeout = cooperative_close_timeout;
        this.chan_id = funding_tx_hash;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `ChannelConfig` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("ChannelConfig", value);

        return new ChannelConfig(
            new Hash(value.gen_hash),
            new PublicKey(value.funder_pk),
            new PublicKey(value.peer_pk),
            new PublicKey(value.pair_pk),
            value.num_peers,
            new PublicKey(value.update_pair_pk),
            Transaction.reviver("", value.funding_tx),
            new Hash(value.funding_tx_hash),
            value.funding_utxo_idx,
            Amount.make(value.capacity),
            value.settle_time,
            value.cooperative_close_timeout
        );
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            gen_hash: this.gen_hash,
            funder_pk: this.funder_pk,
            peer_pk: this.peer_pk,
            pair_pk: this.pair_pk,
            num_peers: this.num_peers,
            update_pair_pk: this.update_pair_pk,
            funding_tx: this.funding_tx,
            funding_tx_hash: this.funding_tx_hash,
            funding_utxo_idx: this.funding_utxo_idx,
            capacity: this.capacity,
            settle_time: this.settle_time,
            cooperative_close_timeout: this.cooperative_close_timeout,
        };
    }
}
