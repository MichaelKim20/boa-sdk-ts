/*******************************************************************************

    Contains a class that is delivered as a parameter to the event recipient
    when the event occurs and a class that manages the listener.

    Copyright:
        Copyright (c) 2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

/**
 * The Event class is passed as parameters to event listeners when an event occurs.
 */
export class Event {
    public static ADDED: string = "added";
    public static REMOVED: string = "removed";
    public static CANCEL: string = "cancel";
    public static CHANGE: string = "change";
    public static CHANGE_SELECTED: string = "change_selected";
    public static SEND_TX: string = "send_tx";
    public static ACCEPT_TX: string = "accept_tx";
    public static CHANGE_BALANCE: string = "change_balance";
}

/**
 * The listener function that processes the event.
 * This function must accept an event object as its only parameter and must return nothing
 */
export type TListener = (type: string, ...args: any[]) => void;

/**
 * The EventDispatcher class is the base class for all classes that dispatch events.
 */
export class EventDispatcher {
    /**
     * The storage of listeners
     * @private
     */
    private listeners: Map<string, TListener[]> = new Map();

    /**
     * Dispatches an event into the event flow.
     * @param type The type of event.
     * @param args The arguments.
     */
    public dispatchEvent(type: string, ...args: any[]): void {
        const listeners = this.listeners.get(type);
        if (listeners !== undefined) listeners.forEach((m) => m(type, args));
    }

    /**
     * Registers an event listener object with an EventDispatcher object so that the listener receives notification of an event.
     * @param type The type of event.
     * @param listener The listener function that processes the event.
     * @param thisArg An object to which the this keyword can refer in the listener function. If thisArg is omitted, undefined is used as the this value.
     */
    public addEventListener(type: string, listener: TListener, thisArg?: any): void {
        const listeners = this.listeners.get(type);
        if (thisArg) listener = listener.bind(thisArg);
        if (listeners === undefined) {
            this.listeners.set(type, [listener]);
            return;
        }
        if (listeners.find((m) => m === listener) === undefined) {
            listeners.push(listener);
        }
    }

    /**
     * Removes a listener from the EventDispatcher object.
     * @param type The type of event.
     * @param listener The listener function that processes the event.
     * @param thisArg An object to which the this keyword can refer in the listener function. If thisArg is omitted, undefined is used as the this value.
     */
    public removeEventListener(type: string, listener: TListener, thisArg?: any): void {
        const listeners = this.listeners.get(type);
        if (listeners !== undefined) {
            if (thisArg) listener = listener.bind(thisArg);
            const findIdx = listeners.findIndex((m) => m === listener);
            if (findIdx !== -1) {
                listeners.splice(findIdx, 1);
            }
            if (listeners.length === 0) this.listeners.delete(type);
        }
    }

    /**
     * Checks whether the EventDispatcher object has any listeners registered for a specific type of event.
     * @param type The type of event.
     */
    public hasEventListener(type: string): boolean {
        const listeners = this.listeners.get(type);
        if (listeners === undefined) return false;
        return listeners.length > 0;
    }
}
