"use strict";

/**
 *
 * @param options       - Это C80MapFloors::MapBuilding.my_as_json
 * @param link_to_map   - ссылка на класс карты
 * @param params        - вспомогательные параметры для отрисовки (например, координаты центра)
 * @constructor
 */
var AdminBuildingLabel = function (options, link_to_map, params) {

    var _this = this;

    this._x = null;
    this._y = null;
    this._map = null;
    this._g = null;
    this._text_element_ns = null;

    console.log('<AdminBuildingLabel> Пытаемся создать админский лейбл для Здания, options["data"] = ' + options["data"]);
    // options["data"] - это C80MapFloors::BuildingRepresentator::InstanceMethods.my_as_json
    if (options["data"] != null && typeof options["data"]["id"] != 'undefined') {
        console.log('<Building.init> Для полигона id=' + options["id"] + ' создаём админский лейбл title=' + options["data"]["title"]);

        //this._x = options["coords"][0];
        //this._y = options["coords"][1];

        this._x = params['cx'];
        this._y = params['cy'];

        this._map = link_to_map;

        // создадим узел, который будет помещён в дерево и будет виден пользователю
        this._g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this._text_element_ns = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this._text_element_ns.setAttribute('x', this._x);
        this._text_element_ns.setAttribute('y', this._y);
        this._text_element_ns.setAttribute('fill', '#000000');
        this._text_element_ns.setAttribute('style', 'font-size:12px;font-weight:bold;');

        // помещаем текст: id=<id_привязанного_Здания>; title=<Заголовок_привязанного_здания>
        this._text_element_ns.textContent = "id="+options["data"]["id"] + "; название='" + options["data"]["title"] + "'";

        // "антагонист" метода destroy()
        this._map.addNodeToSvg(this._g, false);
        this._g.appendChild(this._text_element_ns);

    }

    // самоуничтожение
    this.destroy = function () {
        if (this._map != null) {
            console.log('<AdminBuildingLabel.destroy> Уничтожаем админскую метку.');
            _this._map.removeNodeFromSvg(_this._g, false);
            _this._g.removeChild(_this._text_element_ns);
            delete _this._text_element_ns;
            delete _this._g;
        }
    };

};