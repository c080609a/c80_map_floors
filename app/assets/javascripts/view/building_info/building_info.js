"use strict";

// содержит компонент Tabs, пользуется им для отображения информации об этажах здания

function BuildingInfo(options) {

    // текуще отображаемое здание
    var _cur_map_building = null;

    // настраиваемые параметры
    var _options = null;

    // компонент "вкладки"
    var _tabs = null;

    // привязка данных об этажах здания ко вкладкам в этом удобном хэше
    var _tabs_floors_data = {};

    /** Получить данные для отображения.
     *
     * @param map_building_json Это данные от C80MapFloors::MapBuilding
     */
    this.setData = function (map_building_json) {
        //console.log('<BuildingInfo.setData>');
        //console.log(map_building_json);

        _cur_map_building = map_building_json;

        this._removeAll();
        this._parseData();
        this._updateView();

    };

 //------------------------------------------------------------------------------------------------------------------------

    // слушает клики по табам, отправляет команды на перерисовку картинки этажа
    this._onTabClick = function (clicked_tab_id) {
        console.log('<_onTabClick> clicked_tab_id = ' + clicked_tab_id);
    };

 //------------------------------------------------------------------------------------------------------------------------

    this._fInit = function (options) {
        // TODO:: _options extend options

        // создаём компонент "вкладки"
        _tabs = new Tabs();

    };

    this._parseData = function () {
        console.log('<BuildingInfo._parseData>');

        // обойдём этажи, построим вкладки
        for (var i = 0; i < _cur_map_building['floors'].length; i++) {

            var ifloor_data = _cur_map_building['floors'][i];
            var ifloor_id = ifloor_data["id"];
            //console.log(ifloor_data); // => see C80MapFloors::Floor.as_json

            // создадим вкладку
            _tabs.addTab(ifloor_data["title"], ifloor_id, this._onTabClick);

            // свяжем её по id с даными
            _tabs_floors_data[ifloor_id] = {
                tab_data: ifloor_data
            }
        }
    };

    this._updateView = function () {

    };

    // очистим данные и вью
    this._removeAll = function () {

        _tabs_floors_data = {};
        _tabs.removeAll();
    };


    this._fInit(options);
}