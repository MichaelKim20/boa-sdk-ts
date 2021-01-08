/*******************************************************************************

    Test for ScopeCondition

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as sdk from '../lib';

import * as assert from 'assert';

describe ('Test ScopeCondition', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        return sdk.SodiumHelper.init();
    });

    it ('ScopeCondition', () =>
    {
        let sc = new sdk.ScopeCondition();
        assert.ok(sc.empty());
        assert.ok(sc.isTrue());

        // IF
        //     DO <- pc
        sc.push(true);
        assert.ok(!sc.empty());
        assert.ok(sc.isTrue());

        // IF
        //     DO
        // ELSE
        //     DO <- pc
        sc.tryToggle();
        assert.ok(!sc.empty());
        assert.ok(!sc.isTrue());

        // IF
        //     IF
        //         DO <- pc
        //     ENDIF
        //     DO
        // ENDIF
        sc = new sdk.ScopeCondition();
        sc.push(true);
        sc.push(true);
        assert.ok(!sc.empty());
        assert.ok(sc.isTrue());

        // IF
        //     IF
        //         DO
        //     ENDIF
        //     DO  <- pc
        // ENDIF
        sc.pop();
        assert.ok(!sc.empty());
        assert.ok(sc.isTrue());

        // IF
        //     IF
        //         DO
        //     ENDIF
        //     DO
        // ENDIF  <- pc
        sc.pop();
        assert.ok(sc.empty());
        assert.ok(sc.isTrue());

        // OP_TRUE
        // IF -> true
        //     DO -> executed
        //     OP_0
        //     IF
        //         DO -> skipped
        //         OP_TRUE <- false as previous scope was false
        //         IF
        //             DO -> skipped
        //             OP_TRUE <- false, ditto
        //             IF
        //                 DO -> skipped
        //                 OP_TRUE <- false, ditto
        //                 IF
        //                      DO -> skipped
        //                 ENDIF
        //                 DO -> skipped
        //             ENDIF
        //             DO -> skipped
        //         ENDIF
        //         DO -> skipped
        //     ENDIF
        //     DO -> executed (no false scopes left)
        // ENDIF
        sc = new sdk.ScopeCondition();
        sc.push(true);
        sc.push(false);
        sc.push(true);
        sc.push(true);
        sc.push(false);
        assert.ok(!sc.empty());
        assert.ok(!sc.isTrue());
        sc.pop();
        assert.ok(!sc.empty());
        assert.ok(!sc.isTrue());
        sc.pop();
        assert.ok(!sc.empty());
        assert.ok(!sc.isTrue());
        sc.pop();
        assert.ok(!sc.empty());
        assert.ok(!sc.isTrue());
        sc.pop();
        assert.ok(sc.isTrue());
        sc.pop();
        assert.ok(sc.empty());
        assert.ok(sc.isTrue());
    });
});
