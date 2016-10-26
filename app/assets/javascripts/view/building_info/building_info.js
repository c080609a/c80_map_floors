"use strict";

// содержит компонент Tabs, пользуется им для отображения информации об этажах здания

function BuildingInfo(options) {

    // текуще отображаемое здание
    var _cur_map_building_json;

    // настраиваемые параметры
    var _options = {
        onFloorTabChange: undefined
    };

    // компонент "вкладки"
    var _tabs = null;

    // привязка данных об этажах здания ко вкладкам в этом удобном хэше
    var _tabs_floors_data = {};

    //-[ public ]-----------------------------------------------------------------------------------------------------------------------

    /** Получить данные для отображения.
     *
     * @param map_building_json Это данные от C80MapFloors::MapBuilding
     */
    this.setData = function (map_building_json) {
        //console.log('<BuildingInfo.setData>');
        //console.log(map_building_json);

        _cur_map_building_json = map_building_json;

        this._removeAll();
        this._parseData();
        this._updateView();

    };

    /**
     * П
     * @param floor_index
     */
    this.setSelectedFloor = function (floor_index) {
        _tabs.setSelectedIndex(floor_index);
    };

 //------------------------------------------------------------------------------------------------------------------------

    /**
     * слушает клики по табам, отправляет команды выше.
     *
     * @param shown_tab_id - айди текуще отображённой вкладки, это floor id NOTE:fidfid
     * @private
     */
    this._onTabShow = function (shown_tab_id) {
        console.log('<_onTabShow> shown_tab_id = ' + shown_tab_id);

        if (_options['onFloorTabChange'] != undefined) {
            _options['onFloorTabChange'](shown_tab_id);
        }
    };

    //---[ dsd ]---------------------------------------------------------------------------------------------------------------------

    this._fInit = function (options) {
        // TODO:: _options extend options
        _options = $.extend(_options, options);

        // создаём компонент "вкладки"
        _tabs = new Tabs();

    };

    this._parseData = function () {
        console.log('<BuildingInfo._parseData>');

        // обойдём этажи, построим вкладки
        for (var i = 0; i < _cur_map_building_json['floors'].length; i++) {

            var ifloor_data = _cur_map_building_json['floors'][i];
            var ifloor_id = ifloor_data["id"]; // NOTE:fidfid
            //console.log(ifloor_data); // => see C80MapFloors::Floor.as_json

            // создадим вкладку
            _tabs.addTab(ifloor_data["title"], ifloor_id, this._onTabShow);

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