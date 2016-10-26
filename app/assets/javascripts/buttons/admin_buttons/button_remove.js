"use strict";

function RemoveButton() {

    var _map = null;
    var _this = this;
    _this.el = null;

    _this.onClick = function (e) {
        if (_this.el.hasClass('disabled')) return;
        e.preventDefault();

        //console.log("<RemoveButton.onClick> Переходим в режим удаления полигона.");
        _map.setMode('removing');

    };

    _this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);
        _this.el.on('click', _this.onClick);
    };
}
