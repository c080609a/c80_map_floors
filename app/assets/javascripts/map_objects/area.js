"use strict";

function Area() {

    var _map = null;
    var _this = this;
    _this.id = null;

    //var _polygon = null;
    //var _polygon_overlay = null;


    // экранные координаты левой верхней точки, куда надо вписать полигон здания
    //var _left_page_x = 342;
    //var _left_page_y = 65;

    // bounding box полигона (в логических координатах)
    var _bbox = null;

    // центр полигона (в логических координатах)
    var _cx = null;
    var _cy = null;

    // если is_new, значит был полигон был
    // нарисован и ждёт сохранения на сервере
    //_this.is_new = false;

    _this.init = function (options, parent_floor_json, pself) {

        console.log("<Area.init> options: ");
        console.log(options);

        // нарисовали полигон площади, находясь на этаже:
        // => Object { coords: Array[8] }

        // полигон площади уже был нарисован, просто вошли на этаж:
        // => Object { id: 2, tag: "test_area", floor_id: 2, class_name: "C80MapFloors::Area", coords: "10,12,110,112", data: null }

        console.log("<Area.init> parent_floor_json: ");
        console.log(parent_floor_json);

        /*
         Object {
            ord: 1,
            id: 2,
            title: "Первый этаж",
            tag: "21.1",
            class_name: "C80MapFloors::Floor",
            map_building_id: 7,
            img_bg: Object,
            img_overlay: Object,
            img_bg_width: 387,
            img_bg_height: 225,
                3 more…
            }
         */

        /*{ // так было в c80_map
            "id": 1,
            "object_type": "area",
            "area_hash": {
                "id": 2,
                "title": "Площадь 2.12",
                "is_free": false,
                "props": {
                "square": "100 кв.м.",
                "floor_height": "6 кв. м",
                "column_step": "2 м",
                "gate_type": "распашные",
                "communications": "Интернет, электричество, водоснабжение",
                "price": "от 155 руб/кв.м в месяц"
            }
        },
            "coords": [998.8649298732183,1717.326608643258,998.8649298732183,1717.326608643258,1230.8649298732184,1631.326608643258,1254.8649298732184,1663.326608643258,1160.8649298732184,1695.326608643258,1214.8649298732184,1803.326608643258,1066.8649298732184,1862.326608643258
        ]
        }*/

        _map = pself;
        _this._options = options;
        if (typeof _this._options["coords"] == "string") { /* когда нажимаем ENTER в редакторе и завершаем рисование полигона - приходит массив */
            _this._options["coords"] = _this._options["coords"].split(',');
        }
        _this.id = options["id"];

        // [4ddl5df]
        if (_this._options["id"] == undefined) {
            _this._options["id"] = Math.ceil((Math.random()*100000));
        }

        // [NOTE::56dfaw1: парсим координаты объекта на карте, поданные в виде строки]
        for (var i=0; i<_this._options.coords.length; i++) {
            _this._options.coords[i] = Number(_this._options.coords[i]);
        }

        _this._options["parent_floor_json"] = parent_floor_json;

        _this._polygon = Polygon.createFromSaved(options, false, _map);
        _this._polygon.area = _this; // FIXME:: после исполнения строки (****) ссылка на area исчезает, разве нет?
        _this._polygon["parent_floor_json"] = parent_floor_json;
        _this._polygon = $(_this._polygon.polygon); // ****

        // подпись над полигоном показываем только админам
        if (IS_ADMIN) {
           _this._label = new AreaLabel(options, _map);
        }

        _this._polygon_overlay = Polygon.createFromSaved(options, true, _map);
        _this._polygon_overlay.area = _this;
        _this._polygon_overlay = $(_this._polygon_overlay.polygon);
        _this._polygon_overlay.hover(_this._mouse_in, _this._mouse_out);
        _this._calcBBox();

        // TODO:: старый код не работает: вместо area_hash должно быть data (и так далее)
        var k = 'unassigned';
        if (options.area_hash != undefined) {
            if (typeof options.area_hash.id !== 'undefined') {
                k = 'free';
                if (!options.area_hash.is_free) {
                    k = 'busy';
                }
            }
        }
        _this._polygon.parent().attr("class", k);

    };

    // optimisation
    var timeoutEnter = function () {
        _map.showAreaInfo(_this._options["data"], _this._options["parent_floor_json"]);
        _map.setMode('view_area');
    };

    _this.enter = function () {
        //console.log("<Area.enter>");
        //console.log(_this._options);

        /* рассчитаем масштаб, при котором можно вписать прямоугольник дома в прямоугольник рабочей области */

        var scaleX = _map.calcScale(_bbox.xmin, _bbox.xmax, _map.X1S, _map.X2S);
        var scaleY = _map.calcScale(_bbox.ymin, _bbox.ymax, _map.Y1S, _map.Y2S);
        var scale = (scaleX < scaleY) ? scaleX : scaleY;

        //_map.scale = scale;

        // совмещаем точку на экране, в которую надо центрировать дома, с центром дома с учётом рассчитанного масштаба
        //_map.x = _map.normalizeX(_map.CX - _map.scale * _cx - _map.container.offset().left);
        //_map.y = _map.normalizeY(_map.CY - _map.scale * _cy - _map.container.offset().top);

        var x = _map.normalizeX({
            x: _map.CX - scale * _cx - _map.container.offset().left,
            scale: scale
        });

        var y = _map.normalizeY({
            y: _map.CY - scale * _cy - _map.container.offset().top,
            scale: scale
        });

        //console.log("<Area.enter> [qq] moveTo: " + _map.x + ", " + _map.y);
        //console.log("<Area.enter> Call moveTo.");
        _map.moveTo(x, y, scale, 400, 'easeInOutCubic');

        setTimeout(timeoutEnter, 400);

        var k;
        if (_map.current_area != null) {
            k = _map.current_area._polygon.parent().attr('class');
            //console.log("k = " + k);
            k = k.split('viewing_area').join("");
            _map.current_area._polygon.parent().attr("class", k);
        }

        // <g class='busy viewing_area'>..<polygon >.</g>
        k = _this._polygon.parent().attr("class");
        k += " viewing_area";
        _this._polygon.parent().attr("class", k);

        _this.invalidateAnimationMask();

        _map.current_area = _this;
        _map.mark_virgin = false;

    };

    _this.exit = function () {
        //console.log('<Area.exit>');
    };

    this.invalidateAnimationMask = function () {
        $("#masked").attr('style', _this._calc_polygon_attr);
    };

    // выдать центр площади в логических координатах
    _this.cx = function () {
        return _cx;
    };
    _this.cy = function () {
        return _cy;
    };

    // рассчитаем bounding box полигона (в логических координатах)
    _this._calcBBox = function () {

        var coords = _this._options.coords;
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

        //console.log("<Area._calcBBox> " +
            //xmin + "," + ymin + "; " + xmax + "," + ymax +
        //"; center logical: " + _cx + "," + _cy + ", center screen: " + _map.rightX(_cx) + ", " + _map.rightY(_cy));
    };

    _this._mouse_in = function () {
        //console.log('<Area._mouse_in>');
        //console.log(_this._polygon);
        _this._polygon.attr('class', 'hover');
    };

    _this._mouse_out = function () {
        //console.log('<Area._mouse_out>');
        _this._polygon.attr('class', '');
    };

    _this._calc_polygon_attr = function () {
        var res = "";

        var coords = _this._options["coords"];
        var ix, iy;
        for (var i = 0, c = coords.length; i < c; i += 2) {
            ix = _map.scale * coords[i];
            iy = _map.scale * coords[i + 1];
            res += ix + "px " + iy + "px,"
        }

        //console.log("<Area._calc_polygon_attr> res = " + res);
        res = res.slice(0, res.length - 1);
        res = "-webkit-clip-path:polygon(" + res + ")";
        return res;

    }

    _this.to_json = function () {
        return {
            id:                 _this._options["id"],
            coords:             _this._options["coords"],
            parent_floor_id:    _this._options["parent_floor_json"]["id"]
        }
    }
}
