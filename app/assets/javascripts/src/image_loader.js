"use strict";

function ImageLoader() {

    var _this = this;

    //--[ private ]----------------------------------------------------------------------------------------------------------------------

    _this._draw_map_object_image_bg_onload = function (img_src, params) {
        //console.log('<draw_map_object_image_bg>');

        // сохраним начальные параметры в data
        var left = params["x"];
        var top = params["y"];
        var width = params["width"];
        var height = params["height"];

        var $img = $('<img>')
            .data('top', top)
            .data('left', left)
            .data('width', width)
            .data('height', height)
            .attr('src', img_src)
            .addClass('map_object_image_bg') /* этот класс используем при [zoomove]*/
            .appendTo($div_map_object_image_bg);

        // рассчитаем позиционирующий стиль и применим его к созданной оверлейной картинке
        self.__compose_css_style_for_map_object_image($img);

        return $div_map_object_image_bg;

    };


    /** Показать прелоадер в диве $target.
     *
     * @param $target
     * @param params    {x,y,width,height} - габариты и местонах. прелоадера
     * @private
     */
    _this._preloader_show = function ($target, params) {

        var left = params["x"];
        var top = params["y"];
        var width = params["width"];
        var height = params["height"];

        var $a = $('<div class="anim"></div>');

        var $d = $('<div></div>')
            .css('top', top)
            .css('left', left)
            .css('width', width)
            .css('height', height)
            .append('<span class="helper"></span>')
            .append($a)
            .addClass('image_loader_preloader')
            .appendTo($target);

        var spinner = new Spinner().spin();
        $a[0].appendChild(spinner.el);

        $d.addClass('shown');

    };

    _this._preloader_hide = function () {

    };

    //--[ public ]----------------------------------------------------------------------------------------------------------------------

    /** Загрузить картинку и отобразить её в options["$target"].
     *  Процесс оснастить прелоадером.
     *  Показать картинку плавно.
     *
     * @param img_src   урл картинки
     * @param options   { $target, params }, где:
     *        - $target: див, к которому надо прикрепить картинку
     *        - params: {x,y,width,height} - габариты и местонах. картинки
     */
    _this.load = function (img_src, options) {

        // покажем прелоадер
        _this._preloader_show(options["$target"], options["params"]);

    };

    //--[ run ]----------------------------------------------------------------------------------------------------------------------

    var _fInit = function () {

    };

    _fInit();

}