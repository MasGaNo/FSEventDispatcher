import { FSEventMediator } from './type-helper';
/**

Test:

        console.log('------FSEventDispatcher------');

        var e = new CEvent.EventDispatcher();

        e.once('change', function () { console.log("first"); }); // should be triggered
        var callback = function () { e.off('change', callback) };
        e.once('change', callback); // should be triggered
        e.once('change', function() {console.log('boubou')}); // should be triggered

        e.trigger('change');

        console.log('------------');

        var e2 = new CEvent.EventDispatcher();

        e2.once('change', function () { e2.off('change') }); // should be triggered
        e2.once('change', function () { console.log('boubou') }); // should not be triggered
        e2.trigger('change');

        console.log('------jQuery------');

        var $e = $('<div>');
        $e.one('change', function () { console.log("first"); }); // should be triggered
        var callback = function () { $e.off('change', callback) };
        $e.one('change', callback); // should be triggered
        $e.one('change', function () { console.log('boubou') }); // should be triggered
        $e.trigger('change');

        console.log('------------');

        var $e2 = $('<div>');

        $e2.one('change', function () { $e2.off('change') }); // should be triggered
        $e2.one('change', function () { console.log('boubou') }); // should not be triggered
        $e2.trigger('change');
        
        console.log('------Backbone------');

        var bE = new Backbone.Model();

        bE.once('change', function () { console.log("first"); }); // should be triggered
        var callback = function () { bE.off('change', callback) };
        bE.once('change', callback); // should be triggered
        bE.once('change', function () { console.log('boubou') }); // should be triggered

        bE.trigger('change');

        console.log('------------');

        var bE2 = new Backbone.Model();

        bE2.once('change', function () { bE2.off('change') }); // should be triggered
        bE2.once('change', function () { console.log('boubou') }); // should not be triggered
        bE2.trigger('change');


        return;

        ///
------FSEventDispatcher------
first
boubou
------------
------jQuery------
first
boubou
------------
boubou
------Backbone------
first
boubou
------------
boubou
        
**/
declare type IsCallback<T> = T extends (...args: any[]) => any ? T : never;
declare type TEventCallbackMap<T extends object> = {
    [K in keyof T]: IsCallback<T[K]>;
};
type MediatorMap = keyof FSEventMediator extends never ? Record<string, (...args: Array<any>) => any> : FSEventMediator;
export declare class FSEventDispatcher<TEvent extends TEventCallbackMap<{}>> {
    /**
     * Internal Mediator.
     */
    static Mediator: FSEventDispatcher<Record<string, (...args: any[]) => any>>;
    private _events;
    constructor();
    /**
     * Bind an event to a callback function.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    on<E extends keyof TEvent>(eventName: E, callback: IsCallback<TEvent[E]>, context?: any): this;
    /**
     * Bind an event to be triggered only a single time. The callback will be remove after the first callback's invokation.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    once<E extends keyof TEvent>(eventName: E, callback: IsCallback<TEvent[E]>, context?: any): this;
    /**
     * Remove one or many callback for an event.
     * @param eventName Name of the event to unbind. If null remove all events.
     * @param callback Callback to remove for the event. If null remove all callback with this `context` for the event.
     * @param context Context of the callback to remove. If null remove all callback with this callback.
     **/
    off<E extends keyof TEvent>(eventName?: E, callback?: IsCallback<TEvent[E]>, context?: any): this;
    /**
     * Trigger the event, firing all bound callback. Callbacks are passed all arguments passed to trigger except the eventName.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    trigger<E extends keyof TEvent>(eventName: E, ...args: Parameters<IsCallback<TEvent[E]>>): this;
    /**
     * Same as trigger method, but also return all values returned by callbacks except undefined value.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    triggerResult<E extends keyof TEvent>(eventName: E, ...args: Parameters<IsCallback<TEvent[E]>>): ReturnType<IsCallback<TEvent[E]>>[];
}
export default FSEventDispatcher;
