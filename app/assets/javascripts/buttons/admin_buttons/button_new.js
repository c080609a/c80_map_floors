"use strict";

function NewButton() {

    var _map = null;
    var _this = this;
    _this.state = 'init'; // creating / editing
    _this.el = null;

    _this.setState = function (state) {

        _this.state = state;
        _this.el.removeClass('creating');
        _this.el.removeClass('editing');
        _this.el.addClass(state);

        _map.setMode(state);

    };

    _this.resetState = function () {
        _this.state = 'editing';
        _this.el.removeClass('creating');
        _this.el.removeClass('editing');
        _this.el.addClass('editing');
    };

    _this.onClick = function (e) {
        if (_this.el.hasClass('disabled')) return;
        e.preventDefault();

        if (_this.state == 'creating') {
            _this.setState('editing');
        } else {
            //console.log("<NewButton.onClick> Переходим в режим создания полигона.");
            _this.setState('creating');
        }
    };

    _this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);
        _this.setState(_map.mode);
        _this.el.on('click', _this.onClick);
    };
}
