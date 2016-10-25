"use strict";

function CancelCreatingButton() {

    var _map = null;
    var _this = this;
    _this.el = null;

    this.onClick = function (e) {
        //console.log("<CancelCreatingButton.onClick>");
        e.preventDefault();
        _map.setMode("editing");
    };

    this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);
        _this.el.on('click', this.onClick);
    };

}
