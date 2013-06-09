define(["Element"], function(DOMElement, _createElement) {
    "use strict";

    /**
     * Clone element
     * @memberOf DOMElement.prototype
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.clone = function() {
        var el;

        if (document.addEventListener) {
            el = this._node.cloneNode(true);
        } else {
            el = _createElement("div");
            el.innerHTML = this._node.outerHTML;
            el = el.firstChild;
        }
        
        return new DOMElement(el);
    };
});