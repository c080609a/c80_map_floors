"use strict";

function BackToMapButton() {

    var _map = null;
    var _this = this;

    var _cnt = null;
    var _btn = null;

    var _$building_info = null;

    var _onClick = function () {
        _map.setMode('viewing');

        if (_map.current_building) {
            _map.current_building.exit();
            _map.current_building = null;
        }

        if (_map.current_area) {
            _map.current_area.exit();
            _map.current_area = null;
        }

        _map.svgRemoveAllNodes();
        _map.draw_childs(_map.data["childs"]);

        if (_map.initial_map_position != null) {
            _map.moveTo(
                _map.initial_map_position.x,
                _map.initial_map_position.y,
                _map.initial_map_position.scale,
                400,
                'easeInOutCubic'
            );
        }

    };

    _this.init = function (parent_div_selector, link_to_map) {
        _map = link_to_map;
        _cnt = $('<div></div>').addClass('back_to_map_button');
        _cnt.appendTo($(parent_div_selector));
        _btn = $('<a href="#" id="BackToMapButton">Обратно на карту</a>');
        _btn.on('click', _onClick);
        _cnt.append(_btn);

        _$building_info = $('.building_info');

    };

    _this.show = function () {

        // хардкод - подгоняем под длину анимации, прописанной в css
        setTimeout(__show, 800);


    };
    var __show = function () {
        // фиксируем
        var building_info_top = _$building_info.offset().top;
        var building_info_height = _$building_info.height();

        // считаем
        var btn_top = building_info_top + building_info_height;
        var btn_left = _$building_info.offset().left;

        // позиционируем
        _btn.css('top', btn_top + 'px');
        _btn.css('left', btn_left + 'px');

        // показываем
        _btn.css('opacity','1');
        _cnt.css('display', 'block');
    };

    _this.hide = function () {
        _cnt.css('display', 'none');
        _btn.css('opacity', '0');
    }

}
