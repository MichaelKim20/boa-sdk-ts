/*******************************************************************************



    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import { randomBytes } from 'crypto';

export function randombytes_buf (n: number): Uint8Array
{
    return Uint8Array.from(randomBytes(n));
}
