"use strict";

// при клике на эту кнопку произойдет:
// * показ прелоадера,
// * запрос за несвязанными площадями,
// * после получения ответа - показ модального окна _modal_window.html.erb куда будет подставлен %modal-title% и %modal-body%

function AreaLinkButton() {

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
        $m.find('.modal-title').text('Укажите площадь, соответствующую полигону на карте');

        setTimeout(function () {
            $("select#unlinked_areas").selectpicker({size: 50, tickIcon: 'hidden'});
        }, 1);

        setTimeout(function () {
            //console.log($cc.find("button"));
            $cc.find("button").on('click', function () {
                if ($(this).attr('id') == "submit_area_link") {
                    _map.link_area();
                }
            });
        }, 1000);

        $link_show_modal_window.click();

    };

    /** функция, запрашивающая с сервера Площади (указанного Этажа).
     *
     * @param sfid - ID Этажа, которому должны принадлежать Площади
     */
    var fetch_areas_by_floor = function (sfid) {
        console.log('<ButtonAreaLink.fetch_areas_by_floor> ');
        
        $.ajax({
            url:'/ajax/fetch_unlinked_areas',
            type:'POST',
            data: {
                sfloor_id: sfid
            },
            dataType:'script'
        }).done(fetch_areas_by_floor_done);
        
    };
    var fetch_areas_by_floor_done = function (data, result) {
        _map.save_preloader_klass.hide();
        show_modal_window();
    };

    var $link_show_modal_window = null;

    _this.onClick = function (e) {
        if (_this.el.hasClass('disabled')) return;
        e.preventDefault();

        //console.log("<AreaLinkButton.click>");

        //_map.save_preloader_klass.show();
        //fetch_areas_by_floor();

        // сначала пробуем добраться до данных Этажа картинки этажа        
        var floor_data = _map.current_building.json_current_floor()["data"];

        if (floor_data == null || floor_data == undefined) {
            alert('[ERROR] Перед тем, как назначать Площадь, необходимо назначить Этаж.');
        } else {
            // ID Этажа, которому должны принадлежать Площади, которые надо вывести в модальном окне
            var sfid = floor_data["id"];
            console.log("<ButtonAreaLink.onClick> Нажали кнопку 'Связать Площадь', запрашиваем Площади Этажа sfid = " + sfid);
            _map.save_preloader_klass.show();
            fetch_areas_by_floor(sfid);
        }
        
    };

    _this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);
        _this.el.on('click', _this.onClick);
        _this.hide();

        // найдем кнопку, клик по которой покажет окно [_modal_window.html.erb]
        $link_show_modal_window = $('.show_modal_window');

        //console.log("<AreaLinkButton.init>");
        //console.log(this.el);
    };

    _this.hide = function () {
        _this.el.css('display','none');
    };

    _this.show = function () {
        //console.log("<AreaLinkButton.show>");
        _this.el.css('display','block');
    };

}
