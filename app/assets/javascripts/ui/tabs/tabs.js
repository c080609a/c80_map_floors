"use strict";

// Знает о том, что где-то на странице живет контейнер .tabs_js
//  <div class="tabs_js">
//      <div class="tab_buttons clearfix"></div>
//      <div class="tab_content clearfix"></div>
//  </div>
//
// NOTE-q:: невнятно подвешен вопрос касательно количества подобных компонентов на странице
// NOTE-q:: код написан с условием, что на странице живет один tabs_js, сейчас пока нет времени думать о нём
//

function Tabs(options) {

    var _this = this;

    // параметры, по которым построен компонент
    var _options = {
        info_helper: null // помогает преобразовывать json в человеческий текст
    };

    // view контейнеры, в которых живут кнопки и контент
    var _$div_tabs;
    var _$div_tab_buttons;
    var _$div_tab_content;

    // массив кнопок
    var _tab_buttons = [];

    // айди текущей просматриваемой вкладки
    var _current_tab_id = -1;

    // zero-based индекс текущей просматриваемой вкладки
    var _selected_index = -1;

    // структура данных, которая описывает текущее содержимое копонента: кнопки и контент
    var _data = {};

    // хэш колбеков: при клике по кнопке с id=ID будет вызван соответствующий колбэк
    var _callbacks = {};

    //--[ public ]----------------------------------------------------------------------------------------------------------------------

    /**
     * Удалить все элементы: кнопки, вкладки и данные
     */
    this.removeAll = function () {
        console.log('<Tabs.removeAll> Начинаем удалять все элементы: кнопки, вкладки и данные.');

        // очистим данные
        _data = {};

        // очистим массив колбэков
        _callbacks = {};

        // сбросим курсор
        _current_tab_id = -1;

        // удалим все кнопки и слушатели
        _this._buttonRemoveAll();

        // очистим _$div_tab_content
        _$div_tab_content.html('<i></i>');

    };

    /**
     * Добавить именованную вкладку (вкладка = tab-button + tab-content).
     *
     * @param tab_title
     * @param tab_id        ID вкладки равен ID Полигона Этажа // NOTE:fidfid
     * @param on_tab_show   Колбэк: сигнал наверх, когда по tab-кнопке кликнули
     * @param params        Опции: tab_data - данные для отображения в tab-content.
     *
     */
    this.addTab = function (tab_title, tab_id, on_tab_show, params) {
        console.log("<Tabs.addTab> Добавить вкладку, title: " + tab_title);

        // создадим кнопку и контент
        var btn = _this._buttonAdd(tab_title, tab_id, on_tab_show);
        var cnt;

        if (params != undefined) {
            if (params['tab_data'] != undefined) {
                cnt = params['tab_data'];
            }
        }

        // запишем это в структуру
        _data[tab_id] = { // tab_id это ID Полигона Этажа // NOTE:fidfid
            tab_button: btn,
            tab_content: cnt
        };

        //console.log('for breakpoint');

    };

    this.setSelectedIndex = function (index) {
        console.log('<setSelectedIndex> index: ' + index);
        _$div_tab_buttons.find('a[data-index='+index+']')
            .click();
    };

    /**
     * Подсветить кнопки-табы, чей id присутствует в search_results_floors, а именно: снабдить красным кружочком с цифрой
     *
     * @param search_results_floors - [map_floors_ids]: айдишники полигонов этажей.
     * @param search_results_count  - [Number]: кол-во магазинов на соответствующих этажах из search_results_floors
     */
    this.searchResultsShowFloors = function (search_results_floors, search_results_count) {
        console.log('<Tabs.searchResultsShowFloors> Подсветить кнопки-табы, search_results_floors=['+search_results_floors.join(',')+']');

        var $ibtn, iindex, icount;
        for (var tab_id in _data) {
            //noinspection JSUnfilteredForInLoop
            $ibtn = _data[tab_id]['tab_button'];
            iindex = search_results_floors.indexOf(Number(tab_id));
            if (iindex != -1) { // если айдишник вкладки имеется в массиве с результатами поиска
                icount = search_results_count[iindex];
                _this._buttonRedCircleAdd($ibtn, icount);
            } else {
                _this._buttonRedCircleRemove($ibtn);
            }
        }

    };

    //--[ controller ]----------------------------------------------------------------------------------------------------------------------

    this._onTabButtonClick = function (e) {
        //console.log('<_onTabButtonClick>');
        //console.log(e);
        e.preventDefault();

        //<editor-fold desc="//Подготовка - фиксируем переменные...">
        // фиксируем кнопку
        var $clicked_button = $(e.target);

        // зафиксируем id нажатой кнопки
        var clicked_id = $clicked_button.data('id'); // Это ID Полигона Этажа // NOTE:fidfid
        //console.log('<_onTabButtonClick> clicked_id: ' + clicked_id);

        // зафиксируем index нажатой кнопки
        var clicked_index = $clicked_button.data('index');
        //console.log('<_onTabButtonClick> clicked_index: ' + clicked_index);
        //</editor-fold>

        // колбэк вызовем, только тогда, когда "tab-курсор" в самом деле изменился
        if (_current_tab_id != clicked_id) {

            _current_tab_id = clicked_id;
            _selected_index = clicked_index;

            var fun = _callbacks[clicked_id];
            if (fun != undefined) {
                fun(clicked_id);
            }

        }

        //<editor-fold desc="// сделаем эту кнопку активной...">
        _$div_tab_buttons
            .find('a')
            .removeClass('active');
        _$div_tab_buttons
            .find('a[data-index='+clicked_index+']')
            .addClass('active');
        //</editor-fold>

        // Отобразим во вкладке соответствующие данные
        _this._displayContent(_data[clicked_id]['tab_content']);

    };

    //--[ private ]----------------------------------------------------------------------------------------------------------------------

    /** Добавить tab-кнопку.
     *
     * @param tab_button_title
     * @param button_id             Это ID Полигона Этажа // NOTE:fidfid
     * @param on_click_callback
     * @private
     */
    this._buttonAdd = function (tab_button_title, button_id, on_click_callback) {
        console.log('<Tabs._addTabButton> Добавляем одну кнопку: tab_button_title: ' + tab_button_title);

        // создадим кнопку
        //noinspection JSUnresolvedFunction
        var b = $('<a href="#"></a>')
            .text(tab_button_title)
            .attr('data-id',button_id) // Это ID Полигона Этажа // NOTE:fidfid
            .attr('data-index', _tab_buttons.length)
            //.data('id', button_id)
            //.data('index', _tab_buttons.length)
            .appendTo(_$div_tab_buttons)
            .on('click', _this._onTabButtonClick);

        // её колбэк поместим в отдельный массив
        _callbacks[button_id] = on_click_callback;

        _tab_buttons.push(b);

        return b;

    };

    //this._contentAdd = function () {
    //
    //};

    // удалить все кнопки
    this._buttonRemoveAll = function () {
        console.log("<Tabs._buttonRemoveAll> Начинаем удалять все кнопки-вкладки:");

        //var n = _tab_buttons.length;
        //for (var i = 0; i < n; i++) {
        //    var $ibuttn = _tab_buttons[i];
        //    $ibuttn.remove();
        //    $ibuttn.off('click', this._onTabButtonClick)
        //}

        var $ibuttn;
        while (_tab_buttons.length) {
            $ibuttn = _tab_buttons.pop();
            _this._buttonRemove($ibuttn);
        }
    };

    // удалить одну кнопку
    this._buttonRemove = function ($a_button) {
        console.log("<Tabs._buttonRemove> Удаляем одну кнопку: tab_button_title = " + $a_button.text());
        $a_button.remove();
        //noinspection JSUnresolvedFunction
        $a_button.off('click', _this._onTabButtonClick);
    };

    /**
     * Снабдить кнопку красным кружочком с цифрой,
     * т.е. показать, что на этом этаже имеется такое-то кол-во магазинов,
     * удовлетворяющих поиску.
     *
     * @param $a_button
     * @param count
     * @private
     */
    this._buttonRedCircleAdd = function ($a_button, count) {

        $a_button.addClass('red')
                 .attr('data-search-count', count);

        console.log('<Tabs._buttonRedCircleAdd> Добавляем красный индикатор на кнопку: data-id='+$a_button.attr('data-id'));
    };

    /**
     * Удалить у кнопки красный кружок с цифрой.
     * @param $a_button
     * @private
     */
    this._buttonRedCircleRemove = function ($a_button) {
        console.log('<Tabs._buttonRedCircleRemove> Убираем красный индикатор с кнопки.');

        $a_button.removeClass('red')
                 .attr('data-search-count', '');
    };

    //this._contentRemove = function () {
    //
    //};

    /** Отобразить во вкладке данные [об Этаже/Здании/Площади].
     *
     * @param json  Конкретный узел полигона Этажа/Здания/Площади
     * @private
     */
    this._displayContent = function (json) {
        console.log("<Tabs._displayContent> Отобразить во вкладке данные об Этаже/Здании/Площади, json: ");
        console.log(json);

        // если будет true - значит будет показано сообщение об ошибке
        var mark_error_occurs = false;

        if (_options['info_helper'] != undefined) {
            if (json != undefined && json['data'] != null) {
                if (json['class_name'] != undefined) {

                    var json_as_html_text = _options['info_helper'].makeHtmlText(json);
                    _$div_tab_content.html(json_as_html_text);
                }

                else {
                    mark_error_occurs = true;
                }
            } else {
                mark_error_occurs = true;
            }
        } else {
            alert('Error, refer log for details.');
            console.log('<_displayContent> [ERROR] info_helper не определён.');
        }

        if (mark_error_occurs) {
            alert('data error, refer log for details.');
            console.log('<_displayContent> [ERROR] Что-то не то с данными.');
        }

    };

    this._fInit = function (options) {

        // найдем нужную DOM структуру
        _$div_tabs = $('.tabs_js');
        if (_$div_tabs.length) { /*NOTE-q*/
            _$div_tab_buttons = _$div_tabs.find('.tab_buttons');
            _$div_tab_content = _$div_tabs.find('.tab_content');
        }

        //info_helper
        _options = $.extend(_options, options);

    };

    //--[ startup ]----------------------------------------------------------------------------------------------------------------------

    this._fInit(options);

}