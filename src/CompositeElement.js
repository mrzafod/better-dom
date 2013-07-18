define(["Element"], function($Element, _forEach, _forIn, _map) {
    "use strict";

    // COMPOSITE ELEMENT
    // -----------------

    function $CompositeElement(elements) {
        Array.prototype.push.apply(this, _map(elements, $Element));
    }

    $CompositeElement.prototype = new $Element();
    $CompositeElement.prototype.constructor = $CompositeElement;

    _forIn($CompositeElement.prototype, function(value, key, proto) {
        if (typeof value === "function") {
            var isGetter = value.toString().indexOf("return this;") < 0,
                // this will be the arguments object
                functor = function(el) { value.apply(el, this); };

            proto[key] = isGetter ? function() {} : function() {
                return _forEach(this, functor, arguments);
            };
        }
    });
});
