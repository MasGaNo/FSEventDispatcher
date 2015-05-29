'use strict';


interface EventCallback {
    callback: Function|any;
    context: any;
}

export class EventDispatcher {

    // replace by delegate to avoid some case like: 
    // model.once('change', function() {model.off('change')}); // should be triggered
    // model.once('change', function() {console.log('boubou')}); // should not be triggered
    // or 
    // model.once('change', function() {console.log('foo')});
    // model.once('change', function() {console.log('bar')}); // crash.
    private _events: { [s: string]: EventCallback[] };

    constructor() {
        this._events = {};
    }

    /**
     * Bind an event to a callback function.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    public on(eventName: string, callback: Function, context?: any) {
        var events: EventCallback[] = this._events[eventName] || (this._events[eventName] = []);
        events.push({ callback: callback, context: context || this });
        return this;
    }

    /**
     * Bind an event to be triggered only a single time. The callback will be remove after the first callback's invokation.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    public once(eventName: string, callback: Function, context?: any) {
        var self = this;//not bind because we need to keep the trigger context
        var onceCallback: any = function () {
            self.off(eventName, onceCallback, context);
            callback.apply(this, arguments);
        };
        onceCallback._originalCallback = callback;
        return this.on(eventName, callback, context);
    }

    /**
     * Remove one or many callback for an event.
     * @param eventName Name of the event to unbind. If null remove all events.
     * @param callback Callback to remove for the event. If null remove all callback with this `context` for the event.
     * @param context Context of the callback to remove. If null remove all callback with this callback.
     **/
    public off(eventName?: string, callback?: Function, context?: any) {
        if (!eventName && !callback && !context) {
            this._events = {};// recursive clean?
            return this;
        }

        var eventNames = eventName ? [eventName] : Object.keys(this._events);
        for (var i = 0, l = eventNames.length; i < l; ++i) {
            var name = eventNames[i];

            var events: EventCallback[] = this._events[name];
            if (events) {
                if (!callback && !context) {
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
                }
            }
        }
        return this;
    }

    /**
     * Trigger the event, firing all bound callback. Callbacks are passed all arguments passed to trigger except the eventName.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    public trigger(eventName: string, ...args: any[]) {
        var events = this._events[eventName];
        if (!events) {
            return this;
        }

        for (var i = 0; i < events.length; ++i) {
            var event: EventCallback = events[i];
            event.callback.apply(event.context, args);
        }

        return this;
    }
}