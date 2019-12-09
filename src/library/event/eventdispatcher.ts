import { Delegate } from './delegate';
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

type IsCallback<T> = T extends (...args: any[]) => any ? T : never;


type TEventCallbackMap<T extends object> = {
    [K in keyof T]: IsCallback<T[K]>;
};

type MediatorMap = keyof FSEventMediator extends never ? Record<string, (...args: Array<any>) => any> : FSEventMediator;

export class FSEventDispatcher<TEvent extends TEventCallbackMap<{}>> {
	/**
	 * Internal Mediator.
	 */
    public static Mediator = new FSEventDispatcher<MediatorMap>();
    // public static Mediator = new FSEventDispatcher<Record<string, (...args: Array<any>) => any>>();

    // replace by delegate to avoid some case like: 
    // model.once('change', function() {model.off('change')}); // should be triggered
    // model.once('change', function() {console.log('boubou')}); // should not be triggered
    // or 
    // model.once('change', function() {console.log('foo')});
    // model.once('change', function() {console.log('bar')}); // crash.
    private _events: Partial<{
        [P in keyof TEvent]: Delegate;
        // [eventType: string]: Delegate;
    }>;

    constructor() {
        this._events = {};
    }

    /**
     * Bind an event to a callback function.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    public on<E extends keyof TEvent>(eventName: E, callback: IsCallback<TEvent[E]>, context?: any) {
        const events: Delegate = this._events[eventName] || (this._events[eventName] = new Delegate());
        events.add({ callback: callback, context: context || this });
        return this;
    }

    /**
     * Bind an event to be triggered only a single time. The callback will be remove after the first callback's invokation.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    public once<E extends keyof TEvent>(eventName: E, callback: IsCallback<TEvent[E]>, context?: any) {
        const self = this;//not bind because we need to keep the trigger context
        const onceCallback = function (_: any) {
            self.off(eventName, onceCallback, context);
            return callback.apply(this, arguments);
        } as IsCallback<TEvent[E]>;
        // @ts-ignore
        onceCallback._originalCallback = callback;
        return this.on(eventName, onceCallback, context);
    }

    /**
     * Remove one or many callback for an event.
     * @param eventName Name of the event to unbind. If null remove all events.
     * @param callback Callback to remove for the event. If null remove all callback with this `context` for the event.
     * @param context Context of the callback to remove. If null remove all callback with this callback.
     **/
    public off<E extends keyof TEvent>(eventName?: E, callback?: IsCallback<TEvent[E]>, context?: any) {
        if (!eventName && !callback && !context) {
            this._events = {};// recursive clean?
            return this;
        }

        const eventNames = eventName ? [eventName] : Object.keys(this._events) as Array<keyof TEvent>;
        for (let i = 0, l = eventNames.length; i < l; ++i) {
            const name = eventNames[i];

            const events: Delegate = this._events[name];
            if (events) {
                events.remove({ callback: callback, context: context });
                /*if (!callback && !context) {
                    events.splice(0, events.length);
                    continue;
                }
                for (var j = events.length - 1; j >= 0; --j) {
                    var eventCallback = events[j];
                    var remove = false;
                    if ((!context && (eventCallback.callback === callback || eventCallback.callback._originalCallback === callback)) ||
                        (!callback && eventCallback.context === context) ||
                        (eventCallback.context === context && (eventCallback.callback === callback || eventCallback.callback._originalCallback === callback))
                        ) {
                        events.splice(j, 1);
                    }
                }*/
            }
        }
        return this;
    }

    /**
     * Trigger the event, firing all bound callback. Callbacks are passed all arguments passed to trigger except the eventName.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    public trigger<E extends keyof TEvent>(eventName: E, ...args: Parameters<IsCallback<TEvent[E]>>) {
        const events = this._events[eventName];
        if (!events) {
            return this;
        }

        events.execute.apply(events, args);

        /*for (var i = 0; i < events.length; ++i) {
            var event: EventCallback = events[i];
            event.callback.apply(event.context, args);
        }*/

        return this;
    }

	/**
     * Same as trigger method, but also return all values returned by callbacks except undefined value.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    public triggerResult<E extends keyof TEvent>(eventName: E, ...args: Parameters<IsCallback<TEvent[E]>>): ReturnType<IsCallback<TEvent[E]>>[] {
        const events = this._events[eventName];
        if (!events) {
            return [];
        }

        return events.execute.apply(events, args);

    }
}

// export function eventdispatchable(target: Function) {
//     Object.assign(target.prototype, FSEventDispatcher.prototype);
// }

export default FSEventDispatcher;

// interface Event {
//     request: (id: string, type: 'album'|'track') => void;
//     click: (e: FSEventDispatcher<any>) => number;
// };

// const e = new FSEventDispatcher<Event>();

// e.on('click', (e: FSEventDispatcher<any>) => {
//     return 42;
// });

// const onClick: Event['click'] = function (e: FSEventDispatcher<any>) {
//     return 42;
// }

// e.on('request', (id:string, type: 'album'|'track') => {

// });

// e.trigger('request', 'le', 'album');

// FSEventDispatcher.Mediator.on('test', () => {

// });