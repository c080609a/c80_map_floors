"use strict";

function StateController() {

    var _map = null;
    var _this = this;

    _this.left_side = $("#left_side");
    _this.right_side = $("#right_side");
    _this.remove_button = $('.mapplic-remove-button');
    _this.new_button = $('.mapplic-new-button');
    _this.mzoom_buttons = $('.mzoom_buttons');
    _this.map_creating = $('#map_creating');
    _this.map_editing = $('#map_editing');
    _this.map_removing = $('#map_removing');
    _this.main_map = $('.main_map'); /*qwwqq*/
    _this.svg_overlay = $('#svg_overlay');
    _this.building_info = $('.building_info');
    _this.area_order_button = $('.area_order_button');
    _this.edit_button = $('.mapplic-edit-button');
    _this.masked = $('#masked');

    _this.setMode = function (mode) {

        // Должен быть учёт, из какого состояния пришли в состояние рисования, и возвращаться в него
        //      * При рисовании, находясь внутри здания, возвращаться в 'edit_building'
        //      * При рисовании, находясь внутри площади, возвращаться в 'edit_area'
        // За исключением ситуации, когда начали редактировать, находясь на карте
        if (mode == 'editing' && _map.prev_mode != 'viewing') {
            mode = _map.prev_mode;
        }

        clog('<StateController.setMode> mode = ' + mode);

        _map.prev_mode = _map.mode;
        _map.mode = mode;

        // этот код коррелирует с [x9cs7]. Возможно, нужен рефакторинг.
        _map.container.removeClass("viewing");
        _map.container.removeClass("editing");
        _map.container.removeClass("creating");
        _map.container.removeClass("removing");
        _map.container.removeClass("view_building");
        _map.container.removeClass("edit_building");
        _map.container.removeClass("view_area");
        _map.container.removeClass("edit_area");
        _map.container.addClass(mode);

        _this.checkMode();
    };

    _this.checkMode = function () {

        if (_this.new_button.length == 0) _this.new_button = $('.mapplic-new-button');
        if (_this.remove_button.length == 0) _this.remove_button = $('.mapplic-remove-button');
        if (_this.edit_button.length == 0) _this.edit_button = $('.mapplic-edit-button');
        if (_this.right_side.length == 0) _this.right_side = $('#right_side');
        if (_this.left_side.length == 0) _this.left_side = $('#left_side');
        if (_this.mzoom_buttons.length == 0) _this.mzoom_buttons = $('.mzoom_buttons');
        if (_this.map_creating.length == 0) _this.map_creating = $('#map_creating');
        if (_this.map_editing.length == 0) _this.map_editing = $('#map_editing');
        if (_this.map_removing.length == 0) _this.map_removing = $('#map_removing');
        if (_this.main_map.length == 0) _this.main_map = $('.main_map'); /*qwwqq*/
        if (_this.svg_overlay.length == 0) _this.svg_overlay = $('#svg_overlay');
        if (_this.building_info.length == 0) _this.building_info = $('.building_info');
        if (_this.area_order_button.length == 0) _this.area_order_button = $('.area_order_button');
        if (_this.masked.length == 0) _this.masked = $("#masked");

        switch (_map.mode) {

            // перешли в состояние
            // редактирования карты
            case "editing":

                // спрячем надписи "цена за метр" и адрес с телефоном
                _this.left_side.css("top", -300);
                _this.right_side.css("top", -300);

                // покажем кнопку "добавить фигуру"
                OpacityButtonsUtils.show(_this.new_button);
                _map.new_button_klass.resetState();

                // покажем кнопку "удалить фигуру"
                OpacityButtonsUtils.show(_this.remove_button);

                // спрячем статусную область
                _this.map_creating.css('display', 'none');
                _this.map_editing.css('display', 'block');
                _this.map_removing.css('display', 'none');

                // покажем кнопки, присущие этому режиму
                _this.mzoom_buttons.css('opacity', '1');

                _this.main_map.css('opacity', '1');

                _map.save_button_klass.show();
                _map.save_button_klass.check_and_enable();

                // скроем подсказки - сколько свободных площадей где есть
                _map.hide_free_areas_hint();

                break;

            // перешли в состояние
            // просмотра карты, все здания с крышами
            case "viewing":
                //clog("_this.left_side.data('init') = " + _this.left_side.data('init'));

                // покажем надписи "цена за метр" и адрес с телефоном
                if (_this.left_side.data('init') == undefined) {
                    _this.left_side.data('init', _this.left_side.css("top"));
                }
                if (_this.right_side.data('init') == undefined) {
                    _this.right_side.data('init', _this.right_side.css("top"));
                }
                _this.left_side.css("top", _this.left_side.data('init'));
                _this.right_side.css("top", _this.right_side.data('init'));

                // спрячем кнопки редактора
                OpacityButtonsUtils.hide(_this.new_button);
                OpacityButtonsUtils.hide(_this.remove_button);
                _this.map_creating.css('display', 'none');
                _this.map_editing.css('display', 'none');
                _this.map_removing.css('display', 'none');

                // покажем кнопки zoom
                _this.mzoom_buttons.css('opacity', '1');

                // покажем главную карту(?)
                _this.main_map.css('opacity', '1');

                // скроем svg_overlay слой, который нужен только когда внутри здания
                _this.svg_overlay.css('display', 'none');

                // скроем слой, в котором рисуем анимацию по маске, который нужен только когда внутри здания\площади
                _this.masked.addClass('hiddn');

                // скроем табличку с данными о здании
                if (_this.building_info.data("init") == undefined) {
                    _this.building_info.data('init', _this.building_info.css("top"));
                }
                _this.building_info.css("top", -400);
                _this.building_info.css("display", "block");

                // скроем кнопку "забронировать площадь"
                _this.area_order_button.css('display', 'none');

                // скроем кнопку "обратно на карту"
                _map.back_to_map_button_klass.hide();

                // актуально, когда входим в это состояние
                // из здания\площади, нажав кнопку "обратно на карту"
                _map.edit_button_klass.setState('viewing', true); // [a1x7]

                if (_map.save_button_klass) {
                    _map.save_button_klass.hide();
                }

                // покажем подсказки - сколько свободных площадей где есть
                _map.show_free_areas_hint();

                break;

            // перешли в состояние рисования полигона
            case "creating":
                //_this.mzoom_buttons.css('opacity', '0');
                _this.map_creating.css('display', 'block');
                _this.map_editing.css('display', 'none');
                _this.map_removing.css('display', 'none');

                _this.main_map.css('opacity', '1');

            break;

            // перешли в состояние удаления полигона
            case "removing":
                //_this.mzoom_buttons.css('opacity', '0');
                _this.map_creating.css('display', 'none');
                _this.map_editing.css('display', 'none');
                _this.map_removing.css('display', 'block');

                _this.main_map.css('opacity', '1');

                _map.save_button_klass.hide();

                // прячем кнопку "создать полигон"
                OpacityButtonsUtils.hide(_this.new_button);
                OpacityButtonsUtils.hide(_this.remove_button);
                OpacityButtonsUtils.hide(_this.edit_button);

            break;

            // вошли в здание
            case "view_building":

                // покажем кнопку "обратно на карту"
                _map.back_to_map_button_klass.show();

                // скроем кнопку "связать здание с полигоном"
                _map.building_link_button_klass.hide();

                // спрячем надписи "цена за метр" и адрес с телефоном
                _this.left_side.css("top", -300);
                _this.right_side.css("top", -300);

                //_this.main_map.css('opacity','0.7');
                _this.svg_overlay.css('display', 'block');

                _this.building_info.css("top", _this.building_info.data("init"));
                _this.masked.addClass('hiddn');

                _this.area_order_button.css('display', 'none');
                _map.edit_button_klass.setState('view_building', true); // [a1x7]
                if (_map.current_building != undefined) _map.current_building.resetOverlayZindex();
                _map.save_button_klass.hide();

                OpacityButtonsUtils.hide(_this.new_button);
                OpacityButtonsUtils.hide(_this.remove_button);

                _this.mzoom_buttons.css('opacity', '1');

                // скроем подсказки - сколько свободных площадей где есть
                _map.hide_free_areas_hint();

            break;

            // редактируем, находясь в здании
            case "edit_building":

                // спрячем кнопку "обратно на карту"
                _map.back_to_map_button_klass.hide();

                // покажем кнопку "связать здание с полигоном"
                _map.building_link_button_klass.show();

                // т.к. этот слой используется испключительно в помощь при рисовании обводки площадей
                // и перехватывает клики при dnd, то тут он нам не нужен
                _this.svg_overlay.css('display', 'none');

                // заодно поменяем z-index слоёв с колоннами и слоя с svg
                // полигонами площадей, чтобы можно было добраться мышкой
                // до этих полигонов и редактировать их
                if (_map.current_building != undefined) _map.current_building.changeOverlayZindex();

                // покажем кнопку "добавить фигуру"
                OpacityButtonsUtils.show(_this.new_button);
                _map.new_button_klass.resetState();

                // покажем кнопку "удалить фигуру"
                OpacityButtonsUtils.show(_this.remove_button);

                // покажем кнопку "ред"
                OpacityButtonsUtils.show(_this.edit_button);

                // спрячем инфу о здании
                _this.building_info.css("top", -300);

                // спрячем статус строку "вы создаёте полигон"
                _this.map_creating.css('display', 'none');
                _this.map_removing.css('display', 'none');

                // покажем, возможно спрятанные, zoom кнопки
                _this.mzoom_buttons.css('opacity', '1');

                _map.save_button_klass.show();
                _map.save_button_klass.check_and_enable();

            break;

            // вошли в площадь
            case "view_area":
                _map.back_to_map_button_klass.show();
                _this.masked.removeClass('hiddn');
                var t = _this.building_info.height() + _this.building_info.offset().top;
                var tt = _this.building_info.css("left");
                var tq = (_this.building_info.width() + 40) + "px";
                _this.area_order_button.css("top", t + "px");
                // _this.area_order_button.css("bottom","400px");
                _this.area_order_button.css("left", tt);
                _this.area_order_button.css("width", tq);
                _this.area_order_button.css('display', 'block');
                _map.edit_button_klass.setState('view_area', true); // [a1x7]

                // скроем кнопку "связать площадь с полигоном"
                _map.area_link_button_klass.hide();

                OpacityButtonsUtils.hide(_this.new_button);
                OpacityButtonsUtils.hide(_this.remove_button);

                _this.mzoom_buttons.css('opacity', '1');

            break;

            // начали редактировать площадь
            case 'edit_area':

                // спрячем кнопку "обратно на карту"
                _map.back_to_map_button_klass.hide();

                // покажем кнопку "связать площадь с полигоном"
                _map.area_link_button_klass.show();

                // покажем кнопку "сохранить изменения"
                _map.save_button_klass.show();

                // спрячем кнопку "создать полигон"
                OpacityButtonsUtils.hide(_this.new_button);

                // покажем кнопку "ред"
                OpacityButtonsUtils.show(_this.edit_button);

                _map.edit_button_klass.setState('edit_area', true); // [a1x7]

                break;
        }
    };

    _this.init = function (link_to_map) {
        _map = link_to_map;
    }
    
}
