"use strict";

// содержит компонент Tabs, пользуется им для отображения информации об этажах здания

function BuildingInfo(options) {

    // текуще отображаемые данные
    var _cur_data = null;

    // настраиваемые параметры
    var _options = null;

    var _tabs = null;

    /** Получить данные для отображения.
     *
     * @param map_building_json Это данные от C80MapFloors::MapBuilding
     */
    this.setData = function (map_building_json) {
        console.log('<BuildingInfo.setData>');
        console.log(map_building_json);
        _cur_data = map_building_json;
    };

 //------------------------------------------------------------------------------------------------------------------------

    var _fInit = function (options) {
        // TODO:: _options extend options

        // создаём компонент "вкладки"
        _tabs = new Tabs();

    };

    _fInit(options);
}