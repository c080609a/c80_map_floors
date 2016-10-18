"use strict";

function Building() {

    var _map = null;
    var _this = this;
    var _options = null;
    var _polygon = null;


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

        _map.scale = scale;
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
        _map.x = _map.normalizeX(_map.CX - _map.scale * _cx - _map.container.offset().left);
        _map.y = _map.normalizeY(_map.CY - _map.scale * _cy - _map.container.offset().top);

        //console.log("<Building.enter> [qq] moveTo: " + _map.x + ", " + _map.y);
        _map.moveTo(_map.x, _map.y, _map.scale, 400, 'easeInOutCubic');
    };

    _this.init = function (options, link_to_map) {

        if (options['coords'] != undefined) {
            console.log("<Building.init>");

        //console.log(options);
        /*
                {
                    "object_type": "building",
                    "rent_building_hash": {
                    "id": 2,
                        "title": "Здание 2",
                        "props": {
                        "square": "1234 кв.м.",
                            "square_free": "124 кв. м",
                            "floor_height": "6 кв. м",
                            "column_step": "2 м",
                            "gate_type": "распашные",
                            "communications": "Интернет, электричество, водоснабжение",
                            "price": "от 155 руб/кв.м в месяц"
                    }
                },
                    "img": {
                    "bg": {"src": "/assets/sample_bg-e36f4b42acde72d4ff05376498e5834423165d43e73650dd24a342ecb20779b9.gif"},
                    "overlay": {
                        "type": "overlay",
                            "src": "/assets/sample_overlay-f99419a8904207a6ac74288bccac16c76b388b7162bf2629a2a8dd825746f49b.gif"
                    }
                },
                    "coords": [
                    986.2441809823903,1696.3649485107717,986.2441809823903,1696.3649485107717,1607.2441809823904,1459.3649485107717,1649.2441809823904,1510.3649485107717,1692.2441809823904,1597.3649485107717,1682.2441809823904,1602.3649485107717,1684.2441809823904,1617.3649485107717,1067.2441809823904,1863.3649485107717,1063.2441809823904,1844.3649485107717,1053.2441809823904,1852.3649485107717,1016.2441809823903,1755.3649485107717
                ],
                    "props": {},
                    "childs": [
                    {
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
                        "coords": [
                            998.8649298732183,1717.326608643258,998.8649298732183,1717.326608643258,1230.8649298732184,1631.326608643258,1254.8649298732184,1663.326608643258,1160.8649298732184,1695.326608643258,1214.8649298732184,1803.326608643258,1066.8649298732184,1862.326608643258
                        ]
                    },
                    {
                        "id": 2,
                        "object_type": "area",
                        "area_hash": {
                            "id": 2,
                            "title": "Площадь 2.13",
                            "is_free": true,
                            "props": {
                                "square": "102 кв.м.",
                                "floor_height": "6 кв. м",
                                "column_step": "2 м",
                                "gate_type": "распашные",
                                "communications": "Интернет, электричество, водоснабжение",
                                "price": "от 155 руб/кв.м в месяц"
                            }
                        },
                        "coords": [
                            1174.8649298732184,1726.326608643258,1160.8649298732184,1695.326608643258,1253.8649298732184,1664.326608643258,1290.8649298732184,1724.326608643258,1385.8649298732184,1683.326608643258,1408.8649298732184,1725.326608643258,1215.8649298732184,1804.326608643258
                        ]
                    },
                    {
                        "id": 3,
                        "object_type": "area",
                        "area_hash": {
                            "id": 2,
                            "title": "Площадь 2.15",
                            "is_free": true,
                            "props": {
                                "square": "150 кв.м.",
                                "floor_height": "6 кв. м",
                                "column_step": "2 м",
                                "gate_type": "распашные",
                                "communications": "Интернет, электричество, водоснабжение",
                                "price": "от 155 руб/кв.м в месяц"
                            }
                        },
                        "coords": [
                            1319.8649298732184,1597.326608643258,1230.8649298732184,1633.326608643258,1292.8649298732184,1723.326608643258,1384.8649298732184,1683.326608643258,1408.8649298732184,1726.326608643258,1510.8649298732184,1686.326608643258,1414.8649298732184,1561.326608643258
                        ]
                    },
                    {
                        "id": 4,
                        "object_type": "area",
                        "area_hash": {
                            "id": 2,
                            "title": "Площадь 2.12",
                            "is_free": true,
                            "props": {
                                "square": "124 кв.м.",
                                "floor_height": "6 кв. м",
                                "column_step": "2 м",
                                "gate_type": "распашные",
                                "communications": "Интернет, электричество, водоснабжение",
                                "price": "от 155 руб/кв.м в месяц"
                            }
                        },
                        "coords": [
                            1420.8649298732184,1558.326608643258,1415.8649298732184,1561.326608643258,1510.8649298732184,1686.326608643258,1570.8649298732184,1661.326608643258,1476.8649298732184,1537.326608643258
                        ]
                    },
                    {
                        "id": 4,
                        "object_type": "area",
                        "area_hash": {
                            "id": 2,
                            "title": "Площадь 2.12",
                            "is_free": true,
                            "props": {
                                "square": "124 кв.м.",
                                "floor_height": "6 кв. м",
                                "column_step": "2 м",
                                "gate_type": "распашные",
                                "communications": "Интернет, электричество, водоснабжение",
                                "price": "от 155 руб/кв.м в месяц"
                            }
                        },
                        "coords": [
                            1484.8649298732184,1533.326608643258,1476.8649298732184,1536.326608643258,1570.8649298732184,1661.326608643258,1681.8649298732184,1616.326608643258,1601.8649298732184,1486.326608643258
                        ]
                    }
                ],
                    "floors": []
                }*/

            _map = link_to_map;
            _options = options;
            _this.options = options;
            _this.id = options["id"];

            // [56dfaw1]
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

        _zoomToMe();


        setTimeout(function () {
            _image_overlay = _map.draw_child_bg_image(_options.img.overlay.src, 'building', true);
            _image_bg = _map.draw_child_bg_image(_options.img.bg.src, 'building');
            _map.setMode('view_building');
            _map.showBuildingInfo(_options["rent_building_hash"]);
            _map.draw_childs(_options.childs, _options["rent_building_hash"]);
        }, 400);

        _map.svgRemoveAllNodes();

        _map.current_building = _this;
        //console.log("<Building.enter> id: " + _this.id);
        _map.mark_virgin = false;

    };

    _this.exit = function () {
        _image_bg.remove();
        _image_overlay.remove();
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
    };

    // при редактировании здания (т.е. изменении полигонов и holer-ов площадей)
    // необходимо, чтобы оверлейный слой с колоннами не мешал кликам мышки
    // добраться до слоя с svg
    // эти методы для этого имплементированы
    _this.changeOverlayZindex = function () {
        _image_overlay.css('z-index','1');
    };
    _this.resetOverlayZindex = function () {
        _image_overlay.css('z-index','3');
    };

    _this.to_json = function () {
        return {
            id:     _this.options["id"],
            coords: _this.options["coords"]
        }
    }
}
