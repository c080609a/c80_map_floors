"use strict";

function SaveChangesButton() {

    var _map = null;
    var _this = this;
    _this.el = null;

    var sendDataToServer = function () {

        // новые полигоны площадей и зданий
        var areas;
        var buildings;

        // удаляемые полигоны площадей
        var deleted_areas = [];

        var i, len, iarea;

        // собираем новые полигоны площадей
        len = _map.drawn_areas.length;
        if (len > 0) {
            areas = [];
            for (i = 0; i < len; i++) {
                areas.push(_map.drawn_areas[i].to_json());
            }
        }

        // собираем новые полигоны зданий
        len = _map.drawn_buildings.length;
        if (len > 0) {
            buildings = [];
            for (i = 0; i < len; i++) {
                buildings.push(_map.drawn_buildings[i].to_json());
            }
        }

        // собираем удаляемые площади
        len = _map.areas_for_delete.length;
        if (len > 0) {
            for (i = 0; i < len; i ++) {
                iarea = _map.areas_for_delete[i];
                if (iarea == null) continue;
                deleted_areas.push(iarea.id);
            }
        }
        console.log('<ButtonSave.sendDataToServer> deleted_areas: ' + deleted_areas.join(', '));

        $.ajax({
            url: '/save_map_data',
            type: 'POST',
            data: {
                areas: areas,
                buildings: buildings,
                deleted_areas: deleted_areas
            },
            dataType: 'script'
        }).done(sendDataToServerDone);
    };

    var sendDataToServerDone = function (data, result) {
        // ничего не делаем, т.к. ответ от скрипта сделает всё сам
    };

    _this.onClick = function (e) {
        if (_this.el.hasClass('mapplic-disabled')) return;
        e.preventDefault();
        _map.save_preloader_klass.show();
        sendDataToServer();
    };

    _this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);
        _this.el.on('click', _this.onClick);
    };

    _this.check_and_enable = function () {

        //check
        var mark_dirty = _map.drawn_areas.length || _map.drawn_buildings.length || _map.areas_for_delete;

        // enable
        if (mark_dirty) {
            _this.el.removeClass('mapplic-disabled');
        } else {
            _this.el.addClass('mapplic-disabled');
        }

    };

    _this.hide = function () {
        _this.el.css('display','none');
    };

    _this.show = function () {
        _this.el.css('display','block');
    };
}
