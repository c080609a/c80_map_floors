"use strict";

// с помощью это кнопки можно перегенерировать locations.json

function UpdateJsonButton() {

    var _this = this;
    _this.el = null;
    var _map = null;

    // слушаем клик по кнопке
    this.onClick = function (e) {
        e.preventDefault();

        _map.save_preloader_klass.show();

        $.ajax({
            url: '/ajax/update_map_json',
            type: 'POST',
            dataType: 'script'
        }).done(this._on_map_json_updated);

    };

    this._on_map_json_updated = function () {
        _map.save_preloader_klass.hide();
    };

    // спрятать кнопку
    this.hide = function () {
        _this.el.css('display','none');
    };

    // показать кнопку
    this.show = function () {
        //console.log("<FloorLinkButton.show>");
        _this.el.css('display','block');
    };

    // инициализация
    this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);

        if (_this.el.length > 0) {
            //mark_button_present = true;
            _this.el.on('click', this.onClick);
        }
    }

}