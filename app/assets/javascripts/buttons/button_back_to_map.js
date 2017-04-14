"use strict";

function BackToMapButton() {

    var _map = null;
    var _this = this;

    var _cnt = null;
    var _$btn = null;
    
    var __$building_info = null; // вспомогательно: относительно окна выравниваем кнопку
    var __$mcontainer = null;     // вспомогательно: для выравнивания кнопки

    var _onClick = function (e) {
        e.preventDefault();
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
        _map.draw_childs(_map.data["buildings"]);

        if (_map.initial_map_position != null) {
            /* TODO:: необходимо удостовериться, что параметр scale используется и используется правильно*/
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
        _$btn = $('<a href="#" id="BackToMapButton">Обратно на карту</a>');
        //noinspection JSUnresolvedFunction
        _$btn.on('click', _onClick);
        _cnt.append(_$btn);

        __$building_info = $('.building_info'); // фиксируем вспомогательные элементы
        __$mcontainer = $('.mcontainer'); // фиксируем вспомогательные элементы

    };

    _this.show = function () {

        // хардкод - подгоняем под длину анимации, прописанной в css (+200 ms на возможный лаг)
        setTimeout(__show, 1000);


    };
    var __show = function () {
        // фиксируем
        var building_info_top = __$building_info.offset().top - __$mcontainer.offset().top;
        var building_info_height = __$building_info.outerHeight(true);

        // считаем
        var btn_top = building_info_top + building_info_height;
        var btn_left = __$building_info.offset().left - __$mcontainer.offset().left;

        // позиционируем
        _$btn.css('top', btn_top + 'px');
        _$btn.css('left', btn_left + 'px');

        // показываем
        _$btn.css('opacity','1');
        _cnt.css('display', 'block');
    };

    _this.hide = function () {
        _cnt.css('display', 'none');
        _$btn.css('opacity', '0');
    }

}
