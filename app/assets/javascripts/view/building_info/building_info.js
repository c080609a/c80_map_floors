"use strict";

/**
 *  Содержит компонент Tabs, пользуется им для отображения информации об этажах здания.
 *  Имеется возможность подсветить результаты поиска.
 *
 * @param options   - { onFloorTabChange - при клике по табам вызывается этот callback }
 * @constructor
 */

function BuildingInfo(options) {

    var _this = this;

    var _$el_building_info = null;

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

    // todo-clear22:: необходимо сбрасывать это значение после того, как сбросили поиск
    // текущий результат поиска - какие этажи имеют искомые магазины
    var _search_results_floors = null;

    // todo-clear22:: необходимо сбрасывать это значение после того, как сбросили поиск
    // текущий результат поиска - кол-во магазинов на соответствющих этажах в _search_results_floors
    var _search_results_floors_shops_count = null;

    // todo-clear22:: необходимо сбрасывать это значение после того, как сбросили поиск
    // текущий результат поиска - какие полигоны площадей соответствуют поиску и содержат искомые магазины
    var _search_results_areas = null;

    // привязка данных об этажах здания ко вкладкам в этом удобном хэше
    // NOTE:: но нахуя он был добавлен - пока загадка. В комменты его. Детективная история, главная улика - слово "удобный".
    //var _tabs_floors_data = {};

    //-[ public ]-----------------------------------------------------------------------------------------------------------------------

    /**
     * Получить данные для отображения, распарсить их и отобразить в инфо-окне.
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
        this.set_max_height_of_tab_content();

    };

    /**
     * Войти на этаж с указанным номером (др.словами: индексом).
     * (например: у первого этажа индекс равен 0)
     * @param floor_index
     */
    this.setSelectedFloor = function (floor_index) {
        _tabs.setSelectedIndex(floor_index);
    };

    /**
     * Подсветить результаты поиска: добавить на табы красные кружки с цифрами.
     * Вызывается как и в момент прихода результата поиска,
     * так и после установки данных в компонент. Для 2-го случая была введена
     * переменная _search_results_floors.
     *
     * @param search_results - { buildings: [map_buildings_ias], floors: [map_floors_ids], areas: [map_areas_ids] }
     * Т.е. объект массивов айдишников элементов карты.
     */
    this.searchResultsShow = function (search_results) {

        if (search_results['floors'] != undefined) {

            _search_results_floors = search_results['floors'];
            _search_results_floors_shops_count = search_results['floors_shops_count'];

            if (_tabs != null) {
                _tabs.searchResultsShowFloors(search_results['floors'], search_results['floors_shops_count']);
            } else {
                console.log('<BuildingInfo.searchResultsShow> [ERROR] Нет компонента: _tabs = null.');
            }

        }

        else {
            console.log('<BuildingInfo.searchResultsShow> [ERROR] Нет данных: search_results["floors"] = null.');
        }

        // в случае наличия данных про полигоны площадей (удовлетворяющих поиску) - отдадим эти данные парсеру
        if (search_results['areas'] != undefined) {

            _search_results_areas = search_results['areas'];

            // парсер будет ориентироваться на них, и в случае их присутствия
            // будет понимать, что поиск активен и надо при формировании HTML строки
            // обнаружить искомое в данных и (в таком случае) отобразить только их
            if (_mobj_info_parser != undefined) {
                _mobj_info_parser.setSearchResultAreas(_search_results_areas);
            }

        }

        else {
            console.log('<BuildingInfo.searchResultsShow> [ERROR] Нет данных: search_results["areas"] = null.');
        }
    };

    /**
     * 20170327: подгоняем по высоте блок с текстом внутри инфо-панели,
     * т.к. список арендаторов и площадей может быть очень большим
     *
     * Вызывается при resize окна.
     * Вызывается в конце this.SetData.
     * @param max_height
     */
    this.set_max_height_of_tab_content = function (max_height) {
        console.log('<set_max_height_of_tab_content>');
        $('div.tab_content').css('max-height',max_height+'px');
    };

    this.show = function() {
        _$el_building_info.css("top", _$el_building_info.data("init"));
    };

    this.hide = function() {

        if (_$el_building_info.data("init") == undefined) {
            _$el_building_info.data('init', _$el_building_info.css("top"));
        }        
        
        var h = _$el_building_info.height() + 100;
        _$el_building_info.css("top", -h+'px');
        _$el_building_info.css("display", "block");
    };

    /**
     * Показать инфо о просматриваемой площади (это код, который остался без изменений от c80_map)
     *
     * @param area_json
     * @param parent_floor_json
     */
    this.show_area_info = function (area_json, parent_floor_json) {

        console.log('<BuildingInfo.show_area_info>');

        //console.log(area_hash);

        // так было в c80_map
        //"area_hash": {
        //        "id": 2,
        //        "title": "Площадь 2.12",
        //        "is_free": false,
        //        "props": {
        //            "square": "100 кв.м.",
        //            "floor_height": "6 кв. м",
        //            "column_step": "2 м",
        //            "gate_type": "распашные",
        //            "communications": "Интернет, электричество, водоснабжение",
        //            "price": "от 155 руб/кв.м в месяц"
        //    }

        // так стало в c80_map_floors
        //"rent_building_hash": {
        //        "id": 2,
        //        "title": "Здание 2",
        //        "props": {
        //            "square": "1234 кв.м.",
        //            "square_free": "124 кв. м",
        //            "floor_height": "6 кв. м",
        //            "column_step": "2 м",
        //            "gate_type": "распашные",
        //            "communications": "Интернет, электричество, водоснабжение",
        //            "price": "от 155 руб/кв.м в месяц"
        //    }

        // 20170328: если площадь занята, то:
        //      {
        //          id: 458,
        //          desc: 'От 400 руб за м.',
        //          is_free: false,
        //          title: 'ИЕ-12',
        //          square: 120,
        //          price_string: null,
        //          shop: {
        //              desc: ,
        //              id: 555,
        //              site:
        //              tel:
        //              url:
        //          }
        //      }

        if (area_json == null || area_json == undefined) {
            alert('[ERROR] У полигона нет привязки к Площади. Привяжите полигон площади.');
        } else {

            // сначала скроем всё
            $('.li_area').css('display','none');

            // покажем только релевантный
            $('.li_area#li_area_'+area_json["id"]).css('display','block');

            // TODO:: этот код должен переехать туда, где будем выводить инфо о площади без арендатора
            /*// заполняем данными ссылку 'Оставить заявку'
            var $a_make_order = _$el_building_info.find('.c80_order_invoking_btn');
            $a_make_order.data('comment-text', 'Здравствуйте, оставляю заявку на площадь: ' + area_json["title"]);
            $a_make_order.data('subj-id', area_json["id"]);*/

        }

    };

    this.set_left = function(left) {
        _$el_building_info.css("left", left + "px");
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

        // фиксируем html-узел
        _$el_building_info = $('.building_info');

        // TODO:: _options extend options
        _options = $.extend(_options, options);

        // кастуем помощника
        _mobj_info_parser = new MobjInfoParser();

        // создаём компонент "вкладки"
        _tabs = new Tabs({
            info_helper: _mobj_info_parser
        });

        // находим заголовок
        _$title = _$el_building_info.find('h3');

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
            var ifloor_id = ifloor_data["id"]; // NOTE: fidfid: айди полигона этажа равен айдишнику вкладки
            console.log(ifloor_data); // => see C80MapFloors::Floor.as_json

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

        if (_search_results_floors != null) {
            _this.searchResultsShow(_search_results_floors);
        }

    };

    // очистим данные и вью
    this._removeAll = function () {

        _$title.text('');
        //_tabs_floors_data = {};
        _tabs.removeAll();
    };


    this._fInit(options);
}