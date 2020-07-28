"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var delegate_1 = require("./delegate");
var FSEventDispatcher = /** @class */ (function () {
    function FSEventDispatcher() {
        this._events = {};
    }
    /**
     * Bind an event to a callback function.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    FSEventDispatcher.prototype.on = function (eventName, callback, context) {
        var events = this._events[eventName] || (this._events[eventName] = new delegate_1.Delegate());
        events.add({ callback: callback, context: context || this });
        return this;
    };
    /**
     * Bind an event to be triggered only a single time. The callback will be remove after the first callback's invokation.
     * @param eventName Name of the event to bind
     * @param callback Callback to call when the event fires
     * @param context Context of the callback to call
     **/
    FSEventDispatcher.prototype.once = function (eventName, callback, context) {
        var self = this; //not bind because we need to keep the trigger context
        var onceCallback = function (_) {
            self.off(eventName, onceCallback, context);
            return callback.apply(this, arguments);
        };
        // @ts-ignore
        onceCallback._originalCallback = callback;
        return this.on(eventName, onceCallback, context);
    };
    /**
     * Remove one or many callback for an event.
     * @param eventName Name of the event to unbind. If null remove all events.
     * @param callback Callback to remove for the event. If null remove all callback with this `context` for the event.
     * @param context Context of the callback to remove. If null remove all callback with this callback.
     **/
    FSEventDispatcher.prototype.off = function (eventName, callback, context) {
        if (!eventName && !callback && !context) {
            this._events = {}; // recursive clean?
            return this;
        }
        var eventNames = eventName ? [eventName] : Object.keys(this._events);
        for (var i = 0, l = eventNames.length; i < l; ++i) {
            var name = eventNames[i];
            var events = this._events[name];
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
    };
    /**
     * Trigger the event, firing all bound callback. Callbacks are passed all arguments passed to trigger except the eventName.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    FSEventDispatcher.prototype.trigger = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var events = this._events[eventName];
        if (!events) {
            return this;
        }
        events.execute.apply(events, args);
        /*for (var i = 0; i < events.length; ++i) {
            var event: EventCallback = events[i];
            event.callback.apply(event.context, args);
        }*/
        return this;
    };
    /**
     * Same as trigger method, but also return all values returned by callbacks except undefined value.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    FSEventDispatcher.prototype.triggerResult = function (eventName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var events = this._events[eventName];
        if (!events) {
            return [];
        }
        return events.execute.apply(events, args);
    };
    /**
     * Internal Mediator.
     */
    FSEventDispatcher.Mediator = new FSEventDispatcher();
    return FSEventDispatcher;
}());
exports.FSEventDispatcher = FSEventDispatcher;
// export function eventdispatchable(target: Function) {
//     Object.assign(target.prototype, FSEventDispatcher.prototype);
// }
exports.default = FSEventDispatcher;
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
//# sourceMappingURL=eventdispatcher.js.map