"use strict";

//----------------------------------------------------------------------------------------------------------------------
//
//      На экране присутствует div#search_gui, в котором содержится форма поиска (поле ввода и кнопка).
//      SearchGUI обслуживает этот див, а именно:
//          - позволяет управлять видимостью,
//          - отправляет поисковые запросы на сервер и принимает ответы,
//          - парсит ответы,
//          - и содержит публичный метод, подсвечивающий результаты поиска (полигоны) на карте и табы в инфо-панели
//
//----------------------------------------------------------------------------------------------------------------------

var SearchGUI = function (link_to_map) {

    var _this = this;
    var _map = null;                // ссылка на класс карты
    var _$search_gui = null;        // ссылка на обслуживаемый div с формой
    var _$input = null;             // поле ввода (сюда юзер вводит искомый текст)
    var _$submit = null;            // кнопка "найти"
    var _current_search_results = null; // текущие результаты поиска

    //--[ public ]------------------------------------------------------------------------------------------------------

    /** На основе текущих результатов поиска и
     *  в зависимости от текущего состояния приложения
     *  метод подсвечивает полигоны на карте и табы в инфо-панели
     *
     */
    this.handleSearchResults = function () {
        if (_current_search_results != null) {
            console.log('<SearchGUI.handleSearchResults> Подсветим результаты поиска.');

            var s = _map.svg;
            var c = s.children();
            var l = c.length;
            var i, ig, imbid; // <i_map_building_id>

            for (i=0; i<l; i++) {
                ig = s[0].children[i];          // именно [0]
                //console.log(ig['obj']);       // => Polygon
                if (ig != undefined) {          // такое тоже бывает
                    if (ig['obj'] != undefined) {   //
                        if (ig['obj']['building'] != undefined) {       // добираемся до класса Building.js
                            //console.log("Полигон здания: " + ig['obj']['building'].id); => Полигон здания: 10
                            imbid = ig['obj']['building'].id;

                            // если в результатах поиска присутствует перебираемый map_building_id - полигону добавим класс 'found'
                            if (_current_search_results['buildings'].indexOf(imbid) != -1) {
                                console.log('<SearchGUI.handleSearchResults> addClass "found" на полигон здания imdid=' + imbid);
                                $(ig).find('polygon').addClass('found');
                            }

                        }
                    }
                }

            }


        }
    };

    //--[ private ]-----------------------------------------------------------------------------------------------------

    /** Отправляем запрос с текстом для поиска на сервер.
     *
     * @param stext     - название категории, которой должны соответствовать арендаторы
     * @private
     */
    this._sendSearchRequest = function (stext) {
        console.log('<_sendSearchRequest> Отправляем поисковый запрос на сервер: stext = ' + stext);

        // покажем прелоадер
        _map.save_preloader_klass.show();

        // отправим запрос на сервер
        $.ajax({
            url: '/ajax/find_shops',
            type: 'POST',
            data: {
                stext: stext
            },
            dataType: 'json'
        }).done(_this._sendSearchRequestDone);

    };

    /** Получили [какой-то] ответ от сервера на запрос о поиске.
     *
     * @param data  - результат поиска (внутри метода в комментах пример ответа)
     * @param result
     * @private
     */
    this._sendSearchRequestDone = function (data, result) {
        console.log('<_sendSearchRequestDone> Получили [какой-то] ответ от сервера на запрос о поиске:');

        //console.log(data);
        // {
        //    buildings: [7,10],
        //    floors: [2,6,40],
        //    areas: [3,5,8,6]
        //}

        // один из вариантов (unused)
        //{
        //    buildings: [
        //        {   id: 7,
        //            floors: [
        //                {  id: 2,
        //                    areas: [3]
        //                }
        //            ]
        //        },
        //        {
        //            id: 10,
        //            floors: [
        //                { id: 6,
        //                    areas: [5,8]
        //                },
        //                { id: 48,
        //                    areas: [6]
        //                }
        //            ]
        //        }
        //    ]
        //}

        _current_search_results = data;

        // скроем прелоадер
        _map.save_preloader_klass.hide();

        _this.handleSearchResults();

    };

    /** Нажали на кнопку "найти". -> Отправляем запрос на сервер.
     *
     * @param e
     * @private
     */
    var _submitOnClick = function (e) {
        e.preventDefault();
        var search_text = _$input.val();
        if (search_text.length > 2) {
            console.log('<_submitOnClick> Нажали на кнопку "найти", отправляем текст "' + search_text + '" на поиск.');
            _this._sendSearchRequest(search_text);
        } else {
            console.log('<_submitOnClick> Нажали на кнопку "найти", но искать нечего...');
        }
    };

    //--[ init ]--------------------------------------------------------------------------------------------------------

    var _init = function (link_to_map) {
        console.log('<SearchGUI.init>');

        _map = link_to_map;

        // найдём обслуживаемый div
        _$search_gui = $('div#search_gui');
        if (_$search_gui.length > 0) {  // работать будем только тогда, когда элемент имеется

            // зафиксируем элементы
            _$input = _$search_gui.find('input.form-control');
            _$submit = _$search_gui.find('button.btn');

            // при клике по кнопке 'submit' - отправим текст на сервер, заблокируем форму поиска, сгенерим событие
            _$submit.on('click', _submitOnClick);
        }

    };

    _init(link_to_map);

};