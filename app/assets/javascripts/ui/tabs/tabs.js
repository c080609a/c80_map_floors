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
    var _options;

    // view контейнеры, в которых живут кнопки и контент
    var _$div_tabs;
    var _$div_tab_buttons;
    var _$div_tab_content;

    // массив кнопок
    var _tab_buttons = [];

    // массив содержимого вкладок
    var _tab_contents = [];

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
        console.log('<removeAll>');

        // очистим данные
        _data = {};

        // очистим массив колбэков
        _callbacks = {};

        // сбросим курсор
        _current_tab_id = -1;

        // удалим все кнопки и слушатели
        for (var i = 0; i < _tab_buttons.length; i++) {
            var $ibuttn = _tab_buttons[i];
            $ibuttn.remove();
            $ibuttn.off('click', this._onTabButtonClick)
        }

    };

    /**
     * Добавить именованную вкладку.
     *
     *
     * @param tab_title
     * @param tab_id
     * @param on_tab_show
     *
     */
    this.addTab = function (tab_title, tab_id, on_tab_show) {

        // создадим кнопку и контент
        var btn = this._buttonAdd(tab_title, tab_id, on_tab_show);
        //var cnt = this._contentAdd();

        // запишем это в структуру
        _data[tab_id] = {
            tab_button: btn,
            tab_content: null
        };

        // поместим в массивы
        //_tab_contents.push(cnt);

    };

    this.setSelectedIndex = function (index) {
        console.log('<setSelectedIndex> index: ' + index);
        _$div_tab_buttons.find('a[data-index='+index+']')
            .click();
    };

    //--[ controller ]----------------------------------------------------------------------------------------------------------------------

    this._onTabButtonClick = function (e) {
        //console.log('<_onTabButtonClick>');
        //console.log(e);
        e.preventDefault();

        // зафиксируем id нажатой кнопки
        var clicked_id = $(e.target).data('id');
        console.log('<_onTabButtonClick> clicked_id: ' + clicked_id);

        // зафиксируем index нажатой кнопки
        var clicked_index = $(e.target).data('index');
        console.log('<_onTabButtonClick> clicked_index: ' + clicked_index);

        // сравним с курсором, колбэк вызовем, только если есть изменения
        if (_current_tab_id != clicked_id) {

            _current_tab_id = clicked_id;
            _selected_index = clicked_index;

            var fun = _callbacks[clicked_id];
            if (fun != undefined) {
                fun(clicked_id);
            }

        }

    };

    //--[ private ]----------------------------------------------------------------------------------------------------------------------

    this._buttonAdd = function (tab_button_title, button_id, on_click_callback) {
        console.log('<_addTabButton> tab_button_title: ' + tab_button_title);

        // создадим кнопку
        var b = $('<a href="#"></a>')
            .text(tab_button_title)
            .attr('data-id',button_id)
            .attr('data-index', _tab_buttons.length)
            //.data('id', button_id)
            //.data('index', _tab_buttons.length)
            .appendTo(_$div_tab_buttons)
            .on('click', this._onTabButtonClick);

        // её колбэк поместим в отдельный массив
        _callbacks[button_id] = on_click_callback;

        _tab_buttons.push(b);

    };

    this._contentAdd = function () {

    };

    this._buttonRemove = function ($a_button) {

    };

    this._contentRemove = function () {

    };

    this._fInit = function (options) {

        // найдем нужную DOM структуру
        _$div_tabs = $('.tabs_js');
        if (_$div_tabs.length) { /*NOTE-q*/
            _$div_tab_buttons = _$div_tabs.find('.tab_buttons');
            _$div_tab_content = _$div_tabs.find('.tab_content');
        }

    };

    //--[ startup ]----------------------------------------------------------------------------------------------------------------------

    this._fInit(options);

}