"use strict";

// при клике на эту кнопку произойдет:
// * показ прелоадера,
// * запрос за несвязанными этажами здания,
// * после получения ответа - показ модального окна _modal_window.html.erb куда будет подставлен %modal-title% и %modal-body%

function FloorLinkButton() {

    var _map = null;
    var _this = this;
    _this.el = null;

    // служебная невидимая ссылка, js-клик по которой покажет модальное окно
    var $link_show_modal_window = null;

    // настроить и показать модальное окно
    var show_modal_window = function () {

        //var $dialog = $('#modal_window');
        //$dialog.find("h4").text($t.data("wtitle"));
        //$dialog.find("#form_comment").css('display','block');
        //$dialog.find("input#comment_part_id").val(partid);
        //$dialog.find("input#comment_author").val(author);

        // фиксируем участников
        var $m = $('#modal_window');
        var $cc = $m.find('.modal-body');

        // устанавливаем заголовок окна
        $m.find('.modal-title').text('Укажите Этаж, соответствующий этой картинке.');

        // инициализируем bootstrap-selectpicker
        setTimeout(function () {
            $("select#unlinked_floors").selectpicker({size: 50, tickIcon: 'hidden'});
        }, 10);

        // клик по кнопке "применить" вызовет  _map.link_floor()
        setTimeout(function () {
            //console.log($cc.find("button#submit_floor_link"));
            var b = $cc.find("button#submit_floor_link");
            //console.log('<breakpoint>');
            b.on('click', function () {
                //console.log('<ButtonFloorLink.submit_floor_link> CLICK');
                _map.link_floor();
            });
        }, 1000);

        // нажмём служебную ссылку, которая откроет модальное окно
        $link_show_modal_window.click();

    };

    /** функция, запрашивающая с сервера Этажи без полигонов (указанного Здания).
     *
     * @param bid - ID Здания, которому должны принадлежать Этажи без полигонов
     */
    var fetch_free_floors = function (bid) {
        console.log('<ButtonFloorLink.fetch_free_floors> Запросим Этажи без полигонов для bid:' + bid);

        $.ajax({
            url:'/ajax/fetch_unlinked_floors',
            type:'POST',
            data: {
                building_id:bid
            },
            dataType:'script'
        }).done(fetch_free_floors_done);
    };

    // при успешном ответе - скроем прелоадер, покажем модальное окно
    //noinspection JSUnusedLocalSymbols
    var fetch_free_floors_done = function (data, result) {
        _map.save_preloader_klass.hide();
        show_modal_window();
    };

    // при клике по кнопке "назначить Этаж" - покажем прелоадер, запросим данные с сервера
    this.onClick = function (e) {
        if (_this.el.hasClass('disabled')) return;
        e.preventDefault();

        //console.log("<FloorLinkButton.click>");

        // ID Здания, которому должны принадлежать Этажи без полигонов
        var bid = _map.current_building.get_bid();

        if (bid == undefined || bid == null) {
            alert('[ERROR] Перед тем, как назначать Этаж, необходимо назначить Здание полигону.');
        } else {
            _map.save_preloader_klass.show();
            fetch_free_floors(bid);
        }
    };

    // инициализация
    this.init = function (button_css_selector, link_to_map) {

        // фиксируем элементы, настраиваем
        _map = link_to_map;
        _this.el = $(button_css_selector);
        _this.el.on('click', _this.onClick);

        // изначально кнопка "назначить Этаж" скрыта
        _this.hide();

        // найдем ссылку, клик по которой покажет окно [_modal_window.html.erb]
        $link_show_modal_window = $('.show_modal_window');

    };

    // спрятать кнопку "назначить этаж"
    this.hide = function () {
        _this.el.css('display','none');
    };

    // показать кнопку "назначить этаж"
    this.show = function () {
        //console.log("<FloorLinkButton.show>");
        _this.el.css('display','block');
    };

}
