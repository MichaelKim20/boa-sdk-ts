/*******************************************************************************

    Tracks the current state of the channel.
    States can only move forwards, and never back.
    Once a channel is closed, it may never be re-opened again.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

/**
 * Tracks the current state of the channel.
 * States can only move forwards, and never back.
 * Once a channel is closed, it may never be re-opened again.
 */
export enum ChannelState {
    /**
     * The channel is being negotiated for opening with the counter-party.
     * Later it may transition to either Rejected or SettingUp (if accepted).
     */
    Negotiating,

    /**
     * Channel open request has been rejected by the counter-party
     */
    Rejected,

    /**
     * Channel has been started (counter-party accepted open proposal).
     * Now cooperating on the initial trigger and settlement txs.
     */
    SettingUp,

    /**
     * Waiting for the funding tx to appear in the blockchain.
     */
    WaitingForFunding,

    /**
     * The channel is open and ready for new balance update requests.
     */
    Open,

    /**
     * A channel closure was requested either by the wallet or by the
     * counter-party. New balance update requests will be rejected.
     * For safety reasons the channel's metadata should be kept
     * around until the channel's state becomes `Closed`.
     */
    StartedCollaborativeClose,

    /**
     * The counter-party rejected collaboratively closing this channel.
     * The wallet has the option to either unilaterally close the channel,
     * or to attempt a collaborative close again at a later point.
     */
    RejectedCollaborativeClose,

    /**
     * The channel is being unilaterally closed by publishing an
     * update transaction to the blockchain.
     */
    StartedUnilateralClose,

    /**
     * Waiting for the settlement branch to be unlocked in the update tx's
     * Output. Once it's unlocked, the settlement will be published. Once
     * the settlement is externalized, the channel will be set to Closed.
     */
    WaitingOnSettlement,

    /**
     * The funding transaction has been spent and externalized.
     * This marks the channel as closed.
     * New channels cannot use the same funding UTXO since it was spent,
     * therefore it's safe to delete this channel's data when it reaches this
     * closed state.
     */
    Closed,
}
