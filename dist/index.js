(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./library/event/eventdispatcher"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var eventdispatcher_1 = require("./library/event/eventdispatcher");
    exports.FSEventDispatcher = eventdispatcher_1.FSEventDispatcher;
});
//# sourceMappingURL=index.js.map