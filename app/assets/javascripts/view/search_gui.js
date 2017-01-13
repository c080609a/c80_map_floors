"use strict";

//----------------------------------------------------------------------------------------------------------------------
//
//      На экране присутствует div#search_gui, в котором содержится форма поиска (поле ввода и кнопка).
//      SearchGUI обслуживает этот див, а именно:
//          - позволяет управлять видимостью,
//          - отправляет поисковые запросы на сервер и принимает ответы
//
//----------------------------------------------------------------------------------------------------------------------

var SearchGUI = function (link_to_map) {

    var _this = this;
    var _map = null;                // ссылка на класс карты
    var _$search_gui = null;        // ссылка на обслуживаемый div с формой
    var _$input = null;             // поле ввода (сюда юзер вводит искомый текст)
    var _$submit = null;            // кнопка "найти"

    //--[ public ]------------------------------------------------------------------------------------------------------

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
            dataType: 'script'
        }).done(_this._sendSearchRequestDone);

    };

    /** Получили [какой-то] ответ от сервера на запрос о поиске.
     *
     * @private
     */
    this._sendSearchRequestDone = function () {
        console.log('<_sendSearchRequestDone> Получили [какой-то] ответ от сервера на запрос о поиске.');

        // скроем прелоадер
        _map.save_preloader_klass.hide();

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