'use strict';
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    var Delegate = (function () {
        function Delegate() {
            this.internalList = [];
            this.list = [];
        }
        Delegate.prototype.add = function (callback) {
            this.list.push(callback);
        };
        Delegate.prototype.remove = function (callbackParam) {
            var callback = callbackParam.callback;
            var context = callbackParam.context;
            if (!callback && !context) {
                this.list.splice(0, this.list.length);
                for (var i = 0; i < this.internalList.length; ++i) {
                    this.internalList[i](-1);
                }
                return;
            }
            for (var j = this.list.length - 1; j >= 0; --j) {
                var eventCallback = this.list[j];
                if ((!context && (eventCallback.callback === callback || eventCallback.callback._originalCallback === callback)) ||
                    (!callback && eventCallback.context === context) ||
                    (eventCallback.context === context && (eventCallback.callback === callback || eventCallback.callback._originalCallback === callback))) {
                    this.list.splice(j, 1);
                    for (var i = 0; i < this.internalList.length; ++i) {
                        this.internalList[i](j);
                    }
                }
            }
            /*var indexOf = -1;
            while ((indexOf = this.list.indexOf(callback) !== -1) {
                this.list.splice(indexOf, 1);
                for (var i = 0; i < Delegate.internalList.length; ++i) {
                    Delegate.internalList[i](indexOf);
                }
            }*/
        };
        Delegate.prototype.execute = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var currentIndex = 0;
            var callbackRemove = function (position) {
                if (position === -1) {
                    currentIndex = 0;
                    return;
                }
                if (currentIndex && currentIndex >= position) {
                    --currentIndex;
                }
            };
            this.internalList.push(callbackRemove);
            var returnValue = [];
            for (; currentIndex < this.list.length; ++currentIndex) {
                var event_1 = this.list[currentIndex];
                var returnVal = event_1.callback.apply(event_1.context, args);
                if (returnVal !== undefined) {
                    returnValue.push(returnVal);
                }
            }
            this.internalList.splice(this.internalList.indexOf(callbackRemove), 1);
            return returnValue;
        };
        return Delegate;
    })();
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this._events = {};
        }
        /**
         * Bind an event to a callback function.
         * @param eventName Name of the event to bind
         * @param callback Callback to call when the event fires
         * @param context Context of the callback to call
         **/
        EventDispatcher.prototype.on = function (eventName, callback, context) {
            var events = this._events[eventName] || (this._events[eventName] = new Delegate());
            events.add({ callback: callback, context: context || this });
            return this;
        };
        /**
         * Bind an event to be triggered only a single time. The callback will be remove after the first callback's invokation.
         * @param eventName Name of the event to bind
         * @param callback Callback to call when the event fires
         * @param context Context of the callback to call
         **/
        EventDispatcher.prototype.once = function (eventName, callback, context) {
            var self = this; //not bind because we need to keep the trigger context
            var onceCallback = function () {
                self.off(eventName, onceCallback, context);
                callback.apply(this, arguments);
            };
            onceCallback._originalCallback = callback;
            return this.on(eventName, callback, context);
        };
        /**
         * Remove one or many callback for an event.
         * @param eventName Name of the event to unbind. If null remove all events.
         * @param callback Callback to remove for the event. If null remove all callback with this `context` for the event.
         * @param context Context of the callback to remove. If null remove all callback with this callback.
         **/
        EventDispatcher.prototype.off = function (eventName, callback, context) {
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
                }
            }
            return this;
        };
        /**
         * Trigger the event, firing all bound callback. Callbacks are passed all arguments passed to trigger except the eventName.
         * @param eventName Name of the event to triggered
         * @param args All arguments to pass to the callbacks.
         **/
        EventDispatcher.prototype.trigger = function (eventName) {
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
        EventDispatcher.prototype.triggerResult = function (eventName) {
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
        EventDispatcher.Mediator = new EventDispatcher();
        return EventDispatcher;
    })();
    return EventDispatcher;
});
//# sourceMappingURL=eventdispatcher.js.map