"use strict";

//----------------------------------------------------------------------------------------------------------------------
//
//      На экране присутствует div#search_gui, в котором содержится форма поиска (поле ввода и кнопка).
//      SearchGUI обслуживает этот див, а именно:
//          - позволяет управлять видимостью,
//          - позволяет двигать его РОДИТЕЛЯ так, чтобы он не загораживался ничем при смене состояния приложения,
//          - отправляет поисковые запросы на сервер и принимает ответы,
//          - парсит ответы,
//          - и содержит публичный метод, подсвечивающий результаты поиска (полигоны) на карте и табы в инфо-панели
//
//----------------------------------------------------------------------------------------------------------------------

function SearchGUI(link_to_map) {

    var _this = this;
    var _map = null;                // ссылка на класс карты
    var _$container = null;         // родительский див (добавлен только для того, чтобы можно было двигать форму при смене состояния приложения)
    var _$search_gui = null;        // ссылка на обслуживаемый div с формой
    var _$input = null;             // поле ввода (сюда юзер вводит искомый текст)
    var _$submit = null;            // кнопка "найти"
    var _current_search_results = null; // текущие результаты поиска
    var _counter = 0;               // счётчик отправленных запросов

    //--[ public ]------------------------------------------------------------------------------------------------------

    /**
     * На основе текущих результатов поиска и
     *  в зависимости от текущего состояния приложения
     *  метод подсвечивает полигоны на карте и табы в инфо-панели
     *
     */
    this.handleSearchResults = function () {
        if (_current_search_results != null) {
            console.log('<SearchGUI.handleSearchResults> Подсветим результаты поиска.');

            //<editor-fold desc="// подсветим полигоны на карте...">
            var s = _map.svg;
            var c = s.children();
            var l = c.length;
            var i, ig, igobj, imbid, imaid; // <i_map_building_id>, <i_map_area_id>
            var imb; // <i_map_buidling>
            var iindex; // индекс (айдишника полигона здания) в массиве (полигонов зданий, удовлетворающих поиску)
            var ibscount; // <i_buildings_shops_count>

            for (i=0; i<l; i++) {
                ig = s[0].children[i];          // именно [0]
                //console.log(ig['obj']);       // => Polygon
                if (ig != undefined) {          // такое тоже бывает
                    if (ig['obj'] != undefined) {
                        igobj = ig['obj'];
                        //console.log('[breakpoint]');

                        // добираемся до класса Building.js
                        if (ig['obj']['building'] != undefined) {
                            //console.log("Полигон здания: " + ig['obj']['building'].id); => Полигон здания: 10

                            imb = ig['obj']['building'];
                            imbid = imb.id;
                            iindex = _current_search_results['buildings'].indexOf(imbid);

                            // если в результатах поиска присутствует перебираемый map_building_id - полигону добавим класс 'found'
                            if (iindex != -1) {
                                console.log('<SearchGUI.handleSearchResults> addClass "found" на полигон здания imdid=' + imbid);
                                $(ig).find('polygon').addClass('found');

                                // и зажгём лейбл с подсказкой
                                ibscount = _current_search_results['buildings_shops_count'][iindex];
                                imb.greenCircleShow(ibscount);
                            }

                            // иначе - удалим (возможный) класс `found` и скроем (возможный) лейбл с подсказкой
                            else {
                                $(ig).find('polygon').removeClass('found');
                                imb.greenCircleHide();
                            }

                        }

                        // добираемся до класса Area.js
                        else if (ig['obj']['area'] != undefined) {
                            imaid = ig['obj']['area'].id;

                            // если в результатах поиска присутствует перебираемый map_area_id - полигону добавим класс 'found_area'
                            if (_current_search_results['areas'].indexOf(imaid) != -1) {
                                console.log('<SearchGUI.handleSearchResults> addClass "found_area" на полигон площади imaid=' + imaid);
                                $(ig).find('polygon').addClass('found_area');
                            }
                        }
                    }
                }

            }
            //</editor-fold>

            // подсветим вкладки этажей в инфопанели
            _map.building_info_klass.searchResultsShow(_current_search_results);
        }
    };

    /**
     * Вернуть родительский div-контейнер в начальную (исходную, `нормальную`) позицию.
     */
    this.position_init = function () {
        // если еще ниразу никуда не сдвигали с начальной позиции
        if (_$container.data('init_position_top') == undefined) {
            // запомним начальную позицию
            _$container.data('init_position_top', _$container.css("top"));
            _$container.data('init_position_left', _$container.css("left"));
        }
        _$container.css("top", _$container.data('init_position_top'));
        _$container.css("left", _$container.data('init_position_left'));
    };

    /**
     * Установить div-контейнер чуть левее исходной позиции так, чтобы инфо-панель не загораживала форму поиска.
     * Используется при переходе в режимы, где видна инфо-панель: внутри здания, например. Или внутри этажа.
     */
    this.position_inside = function () {
        //console.log('<position_inside> [breakpoint].');
        _$container.css("left", -200);
        _$container.css("top", _$container.data('init_position_top'));
    };

    /**
     * Спрятать контейнер (задвинуть его за пределы экрана).
     * Например, когда переходим в режим редактирования.
     */
    this.position_hide = function () {
        _$container.css("top", -200);
    };
    
    //--[ private ]-----------------------------------------------------------------------------------------------------

    /**
     * Отправляем запрос с текстом для поиска на сервер.
     *
     * @param stext     - название категории, которой должны соответствовать арендаторы
     * @private
     */
    this._sendSearchRequest = function (stext) {
        console.log('<_sendSearchRequest> Отправляем поисковый запрос на сервер: stext = ' + stext);

        // покажем прелоадер
        _map.save_preloader_klass.show();

        // todo-search: реализовать проверку "слишком короткий текст, не отправляем" тут (перенести проверку из _submitOnClick)
        // todo-search: реализовать проверку "такая строка только что отправлялась и текущие результаты по ней содержатся в _current_search_results)

        // увеличим счётчик запросов
        _counter = _counter + 1;

        // отправим запрос на сервер
        $.ajax({
            url: '/ajax/find_shops',
            type: 'POST',
            data: {
                stext: stext,
                counter: _counter
            },
            dataType: 'json'
        }).done(_this._sendSearchRequestDone);

    };

    /**
     * Получили [какой-то] ответ от сервера на запрос о поиске.
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

        // обработаем результаты поиска
        _this.handleSearchResults();

    };

    /**
     * Нажали на кнопку "найти". -> Отправляем запрос на сервер.
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

        // зафиксируем родителя
        _$container = $('div.container#search_container');

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

}