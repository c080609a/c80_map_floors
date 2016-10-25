"use strict";

function CancelRemoveButton() {

    var _map = null;
    var _this = this;
    _this.el = null;

    _this.onClick = function (e) {
        if (_this.el.hasClass('disabled')) return;
        e.preventDefault();

        //console.log("<CancelRemoveButton.onClick> Выходим из режима удаления полигона.");
        _map.setMode('editing');

    };

    _this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);
        _this.el.on('click', _this.onClick);
    };
}
