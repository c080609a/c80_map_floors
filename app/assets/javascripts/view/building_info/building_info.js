"use strict";

// содержит компонент Tabs, пользуется им для отображения информации об этажах здания

function BuildingInfo(options) {

    // текуще отображаемое здание (Это данные от C80MapFloors::MapBuilding, метод my_as_json5)
    var _cur_map_building_json;

    // настраиваемые параметры
    var _options = {
        onFloorTabChange: undefined
    };

    // заголовок - название здания
    var _$title;

    // помощник в преобразовании JSON характеристик в human-читаемые текста
    var _mobj_info_parser = null;

    // компонент "вкладки"
    var _tabs = null;

    // привязка данных об этажах здания ко вкладкам в этом удобном хэше
    // NOTE:: но нахуя он был добавлен - пока загадка. В комменты его. Детективная история, главная улика - слово "удобный".
    //var _tabs_floors_data = {};

    //-[ public ]-----------------------------------------------------------------------------------------------------------------------

    /** Получить данные для отображения.
     *
     * @param map_building_json     - Это данные от C80MapFloors::MapBuilding, метод my_as_json5
     */
    this.setData = function (map_building_json) {
        console.log('<BuildingInfo.setData> Получили данные для отображения - map_building_json.');
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

        // кастуем помощника
        _mobj_info_parser = new MobjInfoParser();

        // создаём компонент "вкладки"
        _tabs = new Tabs({
            info_helper: _mobj_info_parser
        });

        // находим заголовок
        _$title = $('.building_info').find('h3');

    };

    this._parseData = function () {
        console.log('<BuildingInfo._parseData> Парсим map_building_json, заполняем Tabs компонент:');

        // установим заголовок окна
        var titl = _cur_map_building_json["title"];
        if (_cur_map_building_json['data'] != undefined) {
            titl = _cur_map_building_json['data']['title'];
        }
        _$title.text(titl);

        // обойдём этажи, построим вкладки
        for (var i = 0; i < _cur_map_building_json['floors'].length; i++) {

            var ifloor_data = _cur_map_building_json['floors'][i];
            var ifloor_id = ifloor_data["id"]; // NOTE:fidfid
            //console.log(ifloor_data); // => see C80MapFloors::Floor.as_json

            // создадим вкладку
            _tabs.addTab(ifloor_data["title"], ifloor_id, this._onTabShow, {
                tab_data: ifloor_data
            });

            // свяжем её по id с даными
            //_tabs_floors_data[ifloor_id] = {
            //    tab_data: ifloor_data
            //}
        }
    };

    this._updateView = function () {

    };

    // очистим данные и вью
    this._removeAll = function () {

        _$title.text('');
        //_tabs_floors_data = {};
        _tabs.removeAll();
    };


    this._fInit(options);
}