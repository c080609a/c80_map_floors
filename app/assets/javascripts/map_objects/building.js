"use strict";

function Building() {

    var _map = null;
    var _this = this;
    var _options = null;
    var _polygon = null;

    // хэш с данными об этажах
    var _data_floors = {};

    // экранные координаты левой верхней точки, куда надо вписать полигон здания
    //var _left_page_x = 342;
    //var _left_page_y = 65;

    // bounding box полигона (в логических координатах)
    var _bbox = null;

    // центр полигона (в логических координатах)
    var _cx = null;
    var _cy = null;

    var _image_bg = null;
    var _image_overlay = null;

    var _zoomToMe = function () {

        /* рассчитаем масштаб, при котором можно вписать прямоугольник дома в прямоугольник рабочей области */

        var scaleX = _map.calcScale(_bbox.xmin, _bbox.xmax, _map.X1, _map.X2);
        var scaleY = _map.calcScale(_bbox.ymin, _bbox.ymax, _map.Y1, _map.Y2);
        //console.log("<Building.enter> scaleX = " + scaleX + ", scaleY = " + scaleY);

        var scale = (scaleX < scaleY) ? scaleX : scaleY;
        //var selfX = _map.calcCoord(scale, _map.X1, _bbox.xmin);
        //var selfY = _map.calcCoord(scale, _map.Y1, _bbox.ymin);

        //_map.scale = scale;
        //_map.x = selfX;
        //_map.y = selfY;

        /* по-отдельности */

        //var scaleX = _map.calcScale(_bbox.xmin, _bbox.xmax, _map.X1, _map.X2);
        //console.log("<Building.enter> scaleX = " + scaleX);
        //var selfX = _map.calcCoord(scaleX, _map.X1, _bbox.xmin);
        //_map.scale = scaleX;
        //_map.x = selfX;

        //var scaleY = _map.calcScale(_bbox.ymin, _bbox.ymax, _map.Y1, _map.Y2);
        //console.log("<Building.enter> scaleY = " + scaleY);
        //var selfY = _map.calcCoord(scaleY, _map.Y1, _bbox.ymin);
        //_map.scale = scaleY;
        //_map.y = selfY;

        // совмещаем точку на экране, в которую надо центрировать дома, с центром дома с учётом рассчитанного масштаба
        // или, другими словами, перегоняем логические координаты в систему координат экрана
        //_map.x = _map.normalizeX(_map.CX - scale * _cx - _map.container.offset().left);
        //_map.y = _map.normalizeY(_map.CY - scale * _cy - _map.container.offset().top);

        var x = _map.normalizeX({
            x: _map.CX - scale * _cx - _map.container.offset().left,
            scale: scale
        });

        var y = _map.normalizeY({
            y: _map.CY - scale * _cy - _map.container.offset().top,
            scale: scale
        });

        //console.log("<Building.enter> [qq] moveTo: " + _map.x + ", " + _map.y);
        _map.moveTo(x, y, scale, 400, 'easeInOutCubic');
    };

    // the_floor - это as_json модели C80MapFloors::Floor
    /*{
        "map_building_id": 7,
        "img_bg": {
            "url": "/uploads/map/floors/floor_e7dc.gif",
            "thumb": {"url": "/uploads/map/floors/thumb_floor_e7dc.gif"}
        },
        "img_overlay": {
            "url": null,
            "thumb": {"url": null}
        },
        "id": 2,
        "title": "Первый этаж",
        "tag": "first_test_floor",
        "ord": 1,
        "coords": "",
        "class_name": "C80MapFloors::Floor",
        "areas": [
        {
            "floor_id": 2,
            "id": 2,
            "tag": "test_area",
            "coords": "10,12,110,112",
            "area_representator_id": null,
            "class_name": "C80MapFloors::Area"
        }
    ]
    }*/
    var _draw_floor = function (the_floor) {
        //console.log('<Building._draw_floor>');

        // это тот самый код, который остался без изменений с версии c80_map (прошлой версии)
        if (the_floor["img_overlay"]["url"] != "null") {
            //_image_overlay = _map.draw_child_bg_image(the_floor["img_overlay"]["url"], 'building', true);
        }
        if (the_floor["img_bg"]["url"] != "null") {

            // картинку этажа рисуем не по bounding box здания, а по значениям из базы
            var tmp = _options["coords_img"].split(",");
            var xx = tmp[0];
            var yy = tmp[1];

            // просим карту нарисовать картинку с данными характеристиками
            _image_bg = _map.draw_map_object_image_bg(the_floor["img_bg"]["url"], {
                //x: _bbox.xmin,
                //y: _bbox.ymin,
                x: xx,
                y: yy,
                width: the_floor["img_bg_width"],
                height: the_floor["img_bg_height"]
            }/*, 'building'*/);

        } else {
            alert('[ERROR] У этажа нет картинки.');
        }

        // просим карту нарисовать площади
        _map.draw_childs(the_floor["areas"]/*, _options["rent_building_hash"]*/);

    };

    // options_floors - as_json массива этажей модели C80MapFloors::Floor
    var _parse_floors = function (options_floors) {

        // соберём в удобный хэш
        var i, ifloor_json, ifloor_id;
        for (i = 0; i < options_floors.length; i++) {
            ifloor_json = options_floors[i];
            ifloor_id = ifloor_json["id"];
            _data_floors[ ifloor_id ] = ifloor_json;
        }

    };

    var _proccess_floors_data = function () {

        if (_options["floors"] != undefined && _options["floors"].length) {
            _parse_floors(_options["floors"]);
        } else {
            alert('У здания нет этажей, а должны быть.');
        }

    };

    _this.init = function (options, link_to_map) {

        if (options['coords'] != undefined && options['coords'].length) {
            console.log("<Building.init>");

            _map = link_to_map;
            _options = options;
            _this.options = options;
            if (typeof _this.options["coords"] == 'string') { /* когда нажимаем ENTER в редакторе и завершаем рисование полигона - приходит массив */
                _this.options["coords"] = _this.options["coords"].split(',');
            }
            _this.id = options["id"];

            // [NOTE::56dfaw1: парсим координаты объекта на карте, поданные в виде строки]
            for (var i=0; i<_this.options.coords.length; i++) {
                _this.options.coords[i] = Number(_this.options.coords[i]);
            }

            // [4ddl5df]: в случае, если это только что отрисованное Здание - генерим временный случайный id
            if (_this.options["id"] == undefined) {
                _this.options["id"] = Math.ceil((Math.random()*100000));
            }

            _polygon = Polygon.createFromSaved(options, false, _map);
            _polygon.building = _this;

            _this._calcBBox();

            // подпись над зданием - сколько свободных площадей
            _this._label = new BuildingLabel(options, _map);

        }
    };

    _this.enter = function () {
        //console.log("<Building.enter>");
        //console.log(_options);

        // отдадим информацию о C80MapFloors::MapBuilding в панель
        _map.building_info_klass.setData(_options);

        _zoomToMe();

        //setTimeout(function () {

            // попросим изменить состояние окружающей среды
            _map.setMode('view_building');

            // запустим внутренний механизм парсинга этажей и их отрисовки
            _proccess_floors_data();

        //}, 400);

        _map.svgRemoveAllNodes();

        //console.log("<Building.enter> id: " + _this.id);
        _map.mark_virgin = false;

        //
        _map.building_info_klass.setSelectedFloor(0);

    };

    /**
     * Войти на этаж здания.
     * @param floor_id
     */
    _this.enterFloor = function (floor_id) {
        console.log('<Building.enterFloor> floor_id: ' + floor_id);

        var flr = _data_floors[floor_id];
        if (flr != undefined) {
            _draw_floor(flr);
        } else {
            alert('[Buidling.EnterFloor] error: Нет данных об этаже floor_id='+floor_id+'.');
        }


    }

    _this.exit = function () {
        _image_bg.remove();
        if (_image_overlay != null) {
            _image_overlay.remove();
        }
        _image_bg = null;
        _image_overlay = null;
        //_zoomToMe();
    };

    // выдать центр дома в логических координатах
    _this.cx = function () {
        return _cx;
    };
    _this.cy = function () {
        return _cy;
    };

    // рассчитаем bounding box полигона (в логических координатах)
    _this._calcBBox = function () {

        var coords = _options.coords;
        var xmin = Number.MAX_VALUE;
        var ymin = Number.MAX_VALUE;
        var xmax = Number.MIN_VALUE;
        var ymax = Number.MIN_VALUE;

        var ix, iy;
        for (var i = 0, c = coords.length; i < c; i += 2) {
            ix = coords[i];
            iy = coords[i + 1];

            //console.log(xmin + " VS " + ix);
            xmin = (ix < xmin) ? ix : xmin;
            ymin = (iy < ymin) ? iy : ymin;

            xmax = (ix > xmax) ? ix : xmax;
            ymax = (iy > ymax) ? iy : ymax;
        }


        _bbox = {
            xmin: xmin,
            ymin: ymin,
            xmax: xmax,
            ymax: ymax
        };

        _cx = xmin + (xmax - xmin) / 2;
        _cy = ymin + (ymax - ymin) / 2;

        //console.log("<Building._calcBBox> " +
            //xmin + "," + ymin + "; " + xmax + "," + ymax +
        //"; center logical: " + _cx + "," + _cy + ", center screen: " + _map.rightX(_cx) + ", " + _map.rightY(_cy));

        //console.log('<Building._calcBBox> ' + xmin + ', ' + ymin);
    };

    // при редактировании здания (т.е. изменении полигонов и holer-ов площадей)
    // необходимо, чтобы оверлейный слой с колоннами не мешал кликам мышки
    // добраться до слоя с svg
    // эти методы для этого имплементированы
    _this.changeOverlayZindex = function () {
        if (_image_overlay != null) {
            _image_overlay.css('z-index', '1');
        }
    };
    _this.resetOverlayZindex = function () {
        if (_image_overlay != null) {
            _image_overlay.css('z-index', '3');
        }
    };

    _this.to_json = function () {
        return {
            id:     _this.options["id"],
            coords: _this.options["coords"]
        }
    }
}
