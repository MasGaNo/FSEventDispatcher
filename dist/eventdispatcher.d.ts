declare class FSEventDispatcher {
    /**
     * Internal Mediator.
     */
    static Mediator: FSEventDispatcher;
    private _events;
    constructor();
    /**
     * Bind an event to a callback function.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    on(eventName: string, callback: Function, context?: any): this;
    /**
     * Bind an event to be triggered only a single time. The callback will be remove after the first callback's invokation.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    once(eventName: string, callback: Function, context?: any): this;
    /**
     * Remove one or many callback for an event.
     * @param eventName Name of the event to unbind. If null remove all events.
     * @param callback Callback to remove for the event. If null remove all callback with this `context` for the event.
     * @param context Context of the callback to remove. If null remove all callback with this callback.
     **/
    off(eventName?: string, callback?: Function, context?: any): this;
    /**
     * Trigger the event, firing all bound callback. Callbacks are passed all arguments passed to trigger except the eventName.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    trigger(eventName: string, ...args: any[]): this;
    /**
     * Same as trigger method, but also return all values returned by callbacks except undefined value.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    triggerResult(eventName: string, ...args: any[]): any[];
}
export declare function eventdispatchable(target: Function): void;
export default FSEventDispatcher;
