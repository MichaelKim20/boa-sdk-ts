/*******************************************************************************

    Test of EventDispatcher

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

// tslint:disable-next-line:no-implicit-dependencies
import { BOASodium } from "boa-sodium-ts";
import * as sdk from "../../lib";

import * as assert from "assert";

describe("EventDispatcher", () => {
    before("Wait for the package libsodium to finish loading", async () => {
        if (!sdk.SodiumHelper.isAssigned()) sdk.SodiumHelper.assign(new BOASodium());
        await sdk.SodiumHelper.init();
    });

    it("Test EventDispatcher", async () => {
        const dispatcher = new sdk.EventDispatcher();
        let counter1: number = 0;
        const listener1 = (e: string) => {
            counter1++;
        };
        let counter2: number = 0;
        const listener2 = (e: string) => {
            counter2++;
        };
        let counter3: number = 0;
        const listener3 = (e: string) => {
            counter3++;
        };

        dispatcher.addEventListener(sdk.Event.CHANGE, listener1);
        assert.ok(dispatcher.hasEventListener(sdk.Event.CHANGE));
        dispatcher.dispatchEvent(sdk.Event.CHANGE);
        assert.deepStrictEqual(counter1, 1);
        assert.deepStrictEqual(counter2, 0);
        assert.deepStrictEqual(counter3, 0);

        dispatcher.addEventListener(sdk.Event.CHANGE, listener2);
        assert.ok(dispatcher.hasEventListener(sdk.Event.CHANGE));
        dispatcher.dispatchEvent(sdk.Event.CHANGE);
        assert.deepStrictEqual(counter1, 2);
        assert.deepStrictEqual(counter2, 1);
        assert.deepStrictEqual(counter3, 0);

        dispatcher.addEventListener(sdk.Event.ADDED, listener3);
        assert.ok(dispatcher.hasEventListener(sdk.Event.ADDED));
        dispatcher.dispatchEvent(sdk.Event.ADDED);
        assert.deepStrictEqual(counter1, 2);
        assert.deepStrictEqual(counter2, 1);
        assert.deepStrictEqual(counter3, 1);

        dispatcher.removeEventListener(sdk.Event.CHANGE, listener2);
        assert.ok(dispatcher.hasEventListener(sdk.Event.CHANGE));
        dispatcher.dispatchEvent(sdk.Event.CHANGE);
        assert.deepStrictEqual(counter1, 3);
        assert.deepStrictEqual(counter2, 1);
        assert.deepStrictEqual(counter3, 1);

        dispatcher.removeEventListener(sdk.Event.CHANGE, listener1);
        assert.ok(!dispatcher.hasEventListener(sdk.Event.CHANGE));
        dispatcher.dispatchEvent(sdk.Event.CHANGE);
        assert.deepStrictEqual(counter1, 3);
        assert.deepStrictEqual(counter2, 1);
        assert.deepStrictEqual(counter3, 1);
    });
});
