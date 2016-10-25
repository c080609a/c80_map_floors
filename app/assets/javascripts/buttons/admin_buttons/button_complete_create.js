"use strict";

function CompleteCreatingButton() {

    var _map = null;
    var _this = this;
    _this.el = null;

    _this.onClick = function (e) {
        //console.log("<CompleteCreatingButton.onClick>");
        if (e != null) e.preventDefault();
        _map.onDrawStop();
    };

    _this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);
        _this.el.on('click', _this.onClick);
        _map.complete_creating_button_klass = _this;
    };

}
