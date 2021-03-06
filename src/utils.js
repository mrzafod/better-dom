var doc = document,
    win = window,
    push = Array.prototype.push,
    $Element = require("./element"),
    makeLoopMethod = (function(){
        var rcallback = /cb\.call\(([^)]+)\)/g,
            defaults = {
                BEFORE: "",
                COUNT:  "a ? a.length : 0",
                BODY:   "",
                AFTER:  ""
            };

        return function(options) {
            var code = "%BEFORE%\nfor(var i=0,n=%COUNT%;i<n;++i){%BODY%}%AFTER%", key;

            for (key in defaults) {
                code = code.replace("%" + key + "%", options[key] || defaults[key]);
            }

            // improve callback invokation by using call on demand
            code = code.replace(rcallback, function(expr, args) {
                return "(that?" + expr + ":cb(" + args.split(",").slice(1).join() + "))";
            });

            return Function("a", "cb", "that", "undefined", code);
        };
    })();

module.exports = {
    makeRandomProp: function() {
        return "_" + Math.random().toString().split(".")[1];
    },
    makeError: function(method, DOM) {
        var type = DOM ? "DOM" : "$Element";

        return TypeError(type + "." + method + " was called with illegal arguments. Check <%= pkg.docs %> to verify the function call");
    },
    makeCollection: function(nodes) {
        var result = new $Element();

        push.apply(result, this.map(nodes, $Element));

        return result;
    },
    getComputedStyle: function(node) {
        return window.getComputedStyle ? window.getComputedStyle(node) : node.currentStyle;
    },
    template: function() {
        var DOM = window.DOM;
        // override method with particular implementation
        this.template = DOM.template || function(str) { return str };

        return this.template.apply(DOM, arguments);
    },

    // constants
    docEl: doc.documentElement,
    CSS3_ANIMATIONS: win.CSSKeyframesRule || !doc.attachEvent,
    DOM2_EVENTS: !!doc.addEventListener,
    WEBKIT_PREFIX: win.WebKitAnimationEvent ? "-webkit-" : "",

    // utilites
    forOwn: makeLoopMethod({
        BEFORE: "var keys = Object.keys(a), k",
        COUNT:  "keys.length",
        BODY:   "k = keys[i]; cb.call(that, a[k], k, a)"
    }),
    extend: function(obj, mixins) {
        this.forOwn(mixins || {}, function(value, key) { obj[key] = value });

        return obj;
    },
    forEach: makeLoopMethod({
        BODY:   "cb.call(that, a[i], i, a)",
        AFTER:  "return a"
    }),
    map: makeLoopMethod({
        BEFORE: "var out = Array(a && a.length || 0)",
        BODY:   "out[i] = cb.call(that, a[i], i, a)",
        AFTER:  "return out"
    }),
    some: makeLoopMethod({
        BODY:   "if (cb.call(that, a[i], i, a) === true) return true",
        AFTER:  "return false"
    }),
    filter: makeLoopMethod({
        BEFORE: "var out = []",
        BODY:   "if (cb.call(that, a[i], i, a)) out.push(a[i])",
        AFTER:  "return out"
    }),
    foldl: makeLoopMethod({
        BEFORE: "if (a && arguments.length < 2) that = a[0]",
        BODY:   "that = cb(that, a[arguments.length < 2 ? i + 1 : i], i, a)",
        AFTER:  "return that"
    }),
    foldr: makeLoopMethod({
        BEFORE: "var j; if (a && arguments.length < 2) that = a[a.length - 1]",
        BODY:   "j = n - i - 1; that = cb(that, a[arguments.length < 2 ? j - 1 : j], j, a)",
        AFTER:  "return that"
    }),
    every: makeLoopMethod({
        BEFORE: "var out = true",
        BODY:   "out = cb.call(that, a[i], i, a) && out",
        AFTER:  "return out"
    }),
    legacy: makeLoopMethod({
        BEFORE: "that = a",
        BODY:   "cb.call(that, a[i]._node, a[i], i)",
        AFTER:  "return a"
    }),
    slice: function(list, index) {
        return Array.prototype.slice.call(list, index | 0);
    }
};
