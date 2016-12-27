"use strict";

// при клике на эту кнопку произойдет:
// * показ прелоадера,
// * запрос за несвязанными ЗДАНИЯМИ,
// * после получения ответа - показ модального окна _modal_window.html.erb куда будет подставлен %modal-title% и %modal-body%

function BuildingLinkButton() {

    var _map = null;
    var _this = this;
    _this.el = null;

    var show_modal_window = function () {

        //var $dialog = $('#modal_window');
        //$dialog.find("h4").text($t.data("wtitle"));
        //$dialog.find("#form_comment").css('display','block');
        //$dialog.find("input#comment_part_id").val(partid);
        //$dialog.find("input#comment_author").val(author);

        var $m = $('#modal_window');
        var $cc = $m.find('.modal-body');
        $m.find('.modal-title').text('Укажите здание, соответствующее полигону на карте');

        setTimeout(function () {
            $("select#unlinked_buildings").selectpicker({size: 50, tickIcon: 'hidden'});
        }, 1);

        setTimeout(function () {
            //console.log($cc.find("button"));
            $cc.find("button").on('click', function () {
                if ($(this).attr('id') == "submit_building_link") {
                    _map.link_building();
                }
            });
        }, 1000);

        $link_show_modal_window.click();

    };

    var fetch_free_buildings = function () {
        $.ajax({
            url:'/ajax/fetch_unlinked_buildings',
            type:'POST',
            data: {building_id:"building_id"},
            dataType:'script'
        }).done(fetch_free_buildings_done);
    };
    var fetch_free_buildings_done = function (data, result) {
        _map.save_preloader_klass.hide();
        show_modal_window();
    };

    var $link_show_modal_window = null;

    _this.onClick = function (e) {
        if (_this.el.hasClass('mapplic-disabled')) return;
        e.preventDefault();

        //console.log("<BuildingLinkButton.click>");

        _map.save_preloader_klass.show();

        fetch_free_buildings();
    };

    _this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);
        _this.el.on('click', _this.onClick);
        _this.hide();

        // найдем кнопку, клик по которой покажет окно [_modal_window.html.erb]
        $link_show_modal_window = $('.show_modal_window');

        //console.log("<BuildingLinkButton.init>");
        //console.log(this.el);
    };

    _this.hide = function () {
        _this.el.css('display','none');
    };

    // При входе в режим "Редактирование Карты": кнопка должна быть неактивна, если не выбрано ни одного полигона здания.
    // также этот публичный метод вызывается, когда кликаем по полигонам Зданий в режиме редактирования (переключаемся между полигонами)
    _this.en_check = function () {
        console.log("<en_check> [breakpoint]");

        //check
        var mark_dirty = _map.selected_area != null;

        // enable
        if (mark_dirty) {
            _this.el.removeClass('mapplic-disabled');
        } else {
            _this.el.addClass('mapplic-disabled');
        }

    };

    _this.show = function () {
        //console.log("<BuildingLinkButton.show>");
        _this.el.css('display','block');
        _this.en_check();
    };

}
