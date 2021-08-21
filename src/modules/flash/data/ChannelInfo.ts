/*******************************************************************************

    Contains a required class for channel information.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount } from "../../common/Amount";
import { Hash } from "../../common/Hash";
import { PublicKey } from "../../common/KeyPair";
import { JSONValidator } from "../../utils/JSONValidator";
import { ChannelState } from "../type/ChannelState";

/**
 * The class of channel information
 */
export class ChannelInfo {
    /**
     * The associated channel ID
     */
    public chan_id: Hash;

    /**
     * The original funder of this channel (managed by the Wallet)
     */
    public owner_key: PublicKey;

    /**
     * The counter-party of this channel
     */
    public peer_key: PublicKey;

    /**
     * The amount that's currently held by the owner
     */
    public owner_balance: Amount;

    /**
     * The amount that's currently held by the counter-party
     */
    public peer_balance: Amount;

    /**
     * The current channel state (e.g. open / closed / etc)
     */
    public state: ChannelState;

    /**
     * Constructor
     * @param chan_id       The associated channel ID
     * @param owner_key     The original funder of this channel (managed by the Wallet)
     * @param peer_key      The counter-party of this channel
     * @param owner_balance The amount that's currently held by the owner
     * @param peer_balance  The amount that's currently held by the counter-party
     * @param state         The current channel state (e.g. open / closed / etc)
     */
    constructor(
        chan_id: Hash,
        owner_key: PublicKey,
        peer_key: PublicKey,
        owner_balance: Amount,
        peer_balance: Amount,
        state: ChannelState
    ) {
        this.chan_id = chan_id;
        this.owner_key = owner_key;
        this.peer_key = peer_key;
        this.owner_balance = owner_balance;
        this.peer_balance = peer_balance;
        this.state = state;
    }

    /**
     * The reviver parameter to give to `JSON.parse`
     *
     * This function allows to perform any necessary conversion,
     * as well as validation of the final object.
     *
     * @param key   Name of the field being parsed
     * @param value The value associated with `key`
     * @returns A new instance of `ChannelInfo` if `key == ""`, `value` otherwise.
     */
    public static reviver(key: string, value: any): any {
        if (key !== "") return value;

        JSONValidator.isValidOtherwiseThrow("ChannelInfo", value);

        return new ChannelInfo(
            new Hash(value.chan_id),
            new PublicKey(value.owner_key),
            new PublicKey(value.peer_key),
            Amount.make(value.owner_balance),
            Amount.make(value.peer_balance),
            value.state
        );
    }

    /**
     * Converts this object to its JSON representation
     */
    public toJSON(key?: string): any {
        return {
            chan_id: this.chan_id,
            owner_key: this.owner_key,
            peer_key: this.peer_key,
            owner_balance: this.owner_balance,
            peer_balance: this.peer_balance,
            state: this.state,
        };
    }
}
