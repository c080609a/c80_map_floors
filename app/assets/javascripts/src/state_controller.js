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

        console.log('<StateController.setMode> Переводим карту в режим: mode = ' + mode);

        _map.prev_mode = _map.mode;
        _map.mode = mode;

        //<editor-fold desc="Впишем режим в cssClass контейнера карты">
        // NOTE: этот код коррелирует с [x9cs7]. Возможно, нужен рефакторинг
        _map.container.removeClass("viewing");
        _map.container.removeClass("editing");
        _map.container.removeClass("creating");
        _map.container.removeClass("removing");
        _map.container.removeClass("view_building");
        _map.container.removeClass("edit_building");
        _map.container.removeClass("view_area");
        _map.container.removeClass("edit_area");
        _map.container.removeClass("view_floor");
        _map.container.removeClass("edit_floor");
        _map.container.addClass(mode);
        //</editor-fold>

        _this.checkMode();
    };

    _this.checkMode = function () {

        //<editor-fold desc="Предварительно проверим, все ли участники доступны">
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
        if (_this.area_order_button.length == 0) _this.area_order_button = $('.area_order_button');
        if (_this.masked.length == 0) _this.masked = $("#masked");
        //</editor-fold>

        switch (_map.mode) {

            // перешли в состояние редактирования карты
            case "editing":
                //<editor-fold desc="...">

                console.log("<StateController.setMode> <ожидается рисование полигонов Зданий или их привязка>.");

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

                // покажем кнопку "связать здание с полигоном"
                _map.building_link_button_klass.show();

                // покажем кнопки, присущие этому режиму
                _this.mzoom_buttons.css('opacity', '1');

                _this.main_map.css('opacity', '1');

                _map.save_button_klass.show();
                _map.save_button_klass.check_and_enable();

                // скроем подсказки - сколько свободных площадей где есть
                _map.hide_free_areas_hint();

                //Показать все админские лейблы.
                _map.admin_label_show_all();

                // скроем форму поиска
                _map.search_gui_klass.position_hide();

                //</editor-fold>
            break;

            // перешли в состояние просмотра карты, видны все здания с крышами
            case "viewing":
                //<editor-fold desc="...">
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

                // скроем кнопку "связать здание с полигоном"
                if (_map.building_link_button_klass != null) {
                    _map.building_link_button_klass.hide();
                }

                // покажем кнопки zoom
                _this.mzoom_buttons.css('opacity', '1');

                // покажем главную карту(?)
                _this.main_map.css('opacity', '1');

                // скроем svg_overlay слой, который нужен только когда внутри здания
                _this.svg_overlay.css('display', 'none');

                // скроем слой, в котором рисуем анимацию по маске, который нужен только когда внутри здания\площади
                _this.masked.addClass('hiddn');

                // спрячем инфу о здании
                _map.building_info_klass.hide();

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

                //Скрыть все админские лейблы.
                _map.admin_label_hide_all();

                // форму поиска покажем в исходном (нормальном) состоянии
                if (_map.search_gui_klass != null) {
                    _map.search_gui_klass.position_init();
                }

                //</editor-fold>
            break;

            // перешли в состояние рисования полигона
            case "creating":
                //<editor-fold desc="...">
                //_this.mzoom_buttons.css('opacity', '0');
                _this.map_creating.css('display', 'block');
                _this.map_editing.css('display', 'none');
                _this.map_removing.css('display', 'none');

                _this.main_map.css('opacity', '1');
                //</editor-fold>
            break;

            // перешли в состояние удаления полигона
            case "removing":
                //<editor-fold desc="...">
                //_this.mzoom_buttons.css('opacity', '0');
                _this.map_creating.css('display', 'none');
                _this.map_editing.css('display', 'none');
                _this.map_removing.css('display', 'block');

                _this.main_map.css('opacity', '1');

                _map.save_button_klass.hide();
                _map.floor_link_button_klass.hide();
                _map.update_json_klass.hide();

                // прячем кнопку "создать полигон"
                OpacityButtonsUtils.hide(_this.new_button);
                OpacityButtonsUtils.hide(_this.remove_button);
                OpacityButtonsUtils.hide(_this.edit_button);
                //</editor-fold>
            break;

            // вошли в здание
            case "view_building":
                //<editor-fold desc="...">
                // покажем кнопку "обратно на карту"
                _map.back_to_map_button_klass.show();

                // скроем кнопку "связать здание с полигоном"
                _map.building_link_button_klass.hide();

                // спрячем надписи "цена за метр" и адрес с телефоном
                _this.left_side.css("top", -300);
                _this.right_side.css("top", -300);

                //_this.main_map.css('opacity','0.7');
                _this.svg_overlay.css('display', 'block');

                // покажем инфо-панель
                _map.building_info_klass.show();

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

                // сдвинем форму поиска так, чтобы её не загораживала инфо-панель
                _map.search_gui_klass.position_inside();

                //</editor-fold>
            break;

            // редактируем, находясь в здании
            case "edit_building":
                //<editor-fold desc="...">
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
                _map.building_info_klass.hide();

                // спрячем статус строку "вы создаёте полигон"
                _this.map_creating.css('display', 'none');
                _this.map_removing.css('display', 'none');

                // покажем, возможно спрятанные, zoom кнопки
                _this.mzoom_buttons.css('opacity', '1');

                _map.save_button_klass.show();
                _map.save_button_klass.check_and_enable();

                // скроем форму поиска
                _map.search_gui_klass.position_hide();

                //</editor-fold>
            break;

            // вошли в площадь
            case "view_area":
                //<editor-fold desc="...">

                // покажем кнопку "обратно на карту"
                _map.back_to_map_button_klass.show();

                //
                _this.masked.removeClass('hiddn');

                // выдвигаем инфо-панель
                _map.building_info_klass.show();

                // TODO:: реализовать показ кнопки 'оставить заявку'
                //<editor-fold desc="// спозиционируем и покажем кнопку 'оставить заявку'">
                //var t = _this.building_info.height() + _this.building_info.offset().top;
                //var tt = _this.building_info.css("left");
                //var tq = (_this.building_info.width() + 40) + "px";
                //_this.area_order_button.css("top", t + "px");
                _this.area_order_button.css("bottom","400px");
                //_this.area_order_button.css("left", tt);
                //_this.area_order_button.css("width", tq);
                //_this.area_order_button.css('display', 'block');
                //</editor-fold>

                _map.edit_button_klass.setState('view_area', true); // [a1x7]

                // скроем кнопку "связать площадь с полигоном"
                _map.area_link_button_klass.hide();

                OpacityButtonsUtils.hide(_this.new_button);
                OpacityButtonsUtils.hide(_this.remove_button);

                _this.mzoom_buttons.css('opacity', '1');
                //</editor-fold>
            break;

            // начали редактировать площадь
            case 'edit_area':
                //<editor-fold desc="...">
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

                // спрячем инфу о здании
                _map.building_info_klass.hide();

                // скроем форму поиска
                _map.search_gui_klass.position_hide();

                //</editor-fold>
            break;

            // вошли на этаж
            case "view_floor":
                //<editor-fold desc="...">

                // спрячем надписи "цена за метр" и адрес с телефоном
                _this.left_side.css("top", -300);
                _this.right_side.css("top", -300);

                //_this.main_map.css('opacity','0.7');

                // т.к. этот слой используется испключительно в помощь при рисовании обводки площадей и перехватывает клики при dnd, то тут он нам не нужен
                _this.svg_overlay.css('display', 'block');

                // выдвигаем инфо-панель
                _map.building_info_klass.show();

                // покажем кнопку "обратно на карту"
                _map.back_to_map_button_klass.show();

                // прячем masked слой - а там что (запомятовал)?
                _this.masked.addClass('hiddn');

                // скроем кнопку "связать этаж с полигоном" (которая видна при выходе из режима редактирования этажа)
                _map.floor_link_button_klass.hide();

                // прячем кнопку "отправить заявку на аренду площади"
                _this.area_order_button.css('display', 'none');

                // кнопку "редактировать" переводим в СООТВЕТСТВУЮЩЕЕ состояние
                _map.edit_button_klass.setState('eb_view_floor', true); // [a1x7]

                // сбросим z-index (пояснение "что это" см. в комментах к resetOverlayZindex)
                //if (_map.current_building != undefined) _map.current_building.resetOverlayZindex();

                // спрячем кнопку "сохранить"
                _map.save_button_klass.hide();

                // спрячем кнопки "добавить полигон" и "удалить полигон"
                OpacityButtonsUtils.hide(_this.new_button);
                OpacityButtonsUtils.hide(_this.remove_button);

                // покажем zoom кнопки
                _this.mzoom_buttons.css('opacity', '1');

                // скроем подсказки - сколько свободных площадей где есть
                _map.hide_free_areas_hint();

                // сдвинем форму поиска так, чтобы её не загораживала инфо-панель
                _map.search_gui_klass.position_inside();

                //</editor-fold>
            break;

            // начали редактировать этаж
            case 'edit_floor':
                //<editor-fold desc="...">

                console.log("<StateController.setMode> <Ожидается рисование полигонов Площадей>.");

                // спрячем кнопку "обратно на карту"
                _map.back_to_map_button_klass.hide();

                // покажем кнопку "связать Этаж с полигоном"
                _map.floor_link_button_klass.show();

                // т.к. этот слой используется испключительно в помощь при рисовании обводки площадей и перехватывает клики при dnd, то тут он нам не нужен
                _this.svg_overlay.css('display', 'none');

                // заодно поменяем z-index слоёв с колоннами и слоя с svg полигонами площадей, чтобы можно было добраться мышкой до этих полигонов и редактировать их
                if (_map.current_building != undefined) _map.current_building.changeOverlayZindex();

                // покажем кнопку "добавить фигуру"
                OpacityButtonsUtils.show(_this.new_button);
                _map.new_button_klass.resetState();

                // покажем кнопку "удалить фигуру"
                OpacityButtonsUtils.show(_this.remove_button);

                // покажем кнопку "ред"
                OpacityButtonsUtils.show(_this.edit_button);

                // спрячем инфу о здании
                _map.building_info_klass.hide();

                // спрячем статус строки "вы создаёте полигон" и ...
                _this.map_creating.css('display', 'none');
                _this.map_removing.css('display', 'none');

                // покажем, возможно спрятанные, zoom кнопки
                _this.mzoom_buttons.css('opacity', '1');

                // покажем кнопку "сохранить"
                _map.save_button_klass.show();
                _map.save_button_klass.check_and_enable();

                // скроем форму поиска
                _map.search_gui_klass.position_hide();

                _map.update_json_klass.show();

                //</editor-fold>
            break;

        }
    };

    _this.init = function (link_to_map) {
        _map = link_to_map;
    }
    
}
