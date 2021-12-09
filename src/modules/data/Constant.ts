/*******************************************************************************

    Contains a constant of BOSAGORA blockchain

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { Amount, BOA } from "../common/Amount";

export class Constant {

    /**
     * The amount of a penalty for slashed validators
     */
    public static SlashPenaltyAmount: Amount = BOA(10_000);
}
