(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Delegate = /** @class */ (function () {
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
                args[_i] = arguments[_i];
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
                var event = this.list[currentIndex];
                var returnVal = event.callback.apply(event.context, args);
                if (returnVal !== undefined) {
                    returnValue.push(returnVal);
                }
            }
            this.internalList.splice(this.internalList.indexOf(callbackRemove), 1);
            return returnValue;
        };
        return Delegate;
    }());
    exports.Delegate = Delegate;
    exports.default = Delegate;
});
//# sourceMappingURL=delegate.js.map