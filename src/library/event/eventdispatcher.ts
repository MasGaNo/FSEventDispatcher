'use strict';

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

interface EventCallback {
    callback: Function|any;
    context: any;
}

class Delegate {

    private list: EventCallback[];
    private internalList: Function[] = [];

    public constructor() {
        this.list = [];
    }

    public add(callback: EventCallback): void {
        this.list.push(callback);
    }

    public remove(callbackParam: EventCallback): void {

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
                (eventCallback.context === context && (eventCallback.callback === callback || eventCallback.callback._originalCallback === callback))
                ) {
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
    }

    public execute(...args: any[]): any[] {

        let currentIndex = 0;

        let callbackRemove = function (position) {
            if (position === -1) {
                currentIndex = 0;
                return;
            }
            if (currentIndex && currentIndex >= position) {
                --currentIndex;
            }
        }

        this.internalList.push(callbackRemove);

		let returnValue: any[] = [];
		
        for (; currentIndex < this.list.length; ++currentIndex) {
            let event: EventCallback = this.list[currentIndex];
            let returnVal = event.callback.apply(event.context, args);
			if (returnVal !== undefined) {
				returnValue.push(returnVal);				
			}
        }

        this.internalList.splice(this.internalList.indexOf(callbackRemove), 1);
		
		return returnValue;

    }

}

class EventDispatcher {

	public static Mediator = new EventDispatcher();

    // replace by delegate to avoid some case like: 
    // model.once('change', function() {model.off('change')}); // should be triggered
    // model.once('change', function() {console.log('boubou')}); // should not be triggered
    // or 
    // model.once('change', function() {console.log('foo')});
    // model.once('change', function() {console.log('bar')}); // crash.
    private _events: { [s: string]: Delegate };

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
        var events: Delegate = this._events[eventName] || (this._events[eventName] = new Delegate());
        events.add({ callback: callback, context: context || this });
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

            var events: Delegate = this._events[name];
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
    public trigger(eventName: string, ...args: any[]) {
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
    }
	
	/**
     * Same as trigger method, but also return all values returned by callbacks except undefined value.
     * @param eventName Name of the event to triggered
     * @param args All arguments to pass to the callbacks.
     **/
    public triggerResult(eventName: string, ...args: any[]): any[] {
        var events = this._events[eventName];
        if (!events) {
            return [];
        }

        return events.execute.apply(events, args);
		
    }
}

export = EventDispatcher;
