"use strict";

function ImageLoader() {

    var _this = this;

    //--[ private ]----------------------------------------------------------------------------------------------------------------------

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

    _this._preloader_hide = function ($target) {
        var $ilp = $target.find('.image_loader_preloader');
        $ilp.removeClass('shown');
        setTimeout(function () {
            $ilp.remove();
        }, 400);
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

        console.log('<ImageLoader.load> ' + img_src);

        // покажем прелоадер
        _this._preloader_show(options["$target"], options["params"]);

        // создадим картинку
        var img = new Image();
        var $img = $(img);

        // настроим картинку
        $img.data('top', options['params']['y'])
            .data('left', options['params']['x'])
            .data('width', options['params']['width'])
            .data('height', options['params']['height'])
            .addClass('map_object_image_bg'); /* этот класс используем при [zoomove]*/

        img.onload = function () {

            // NOTE:: разделим вставку в DOM и отображение: в mozilla картинка отображается постепенно прорисовываясь сверху вниз, некрасиво

            $img.appendTo(options["$target"]);

            setTimeout(function () {

                // спрячем прелоадер
                _this._preloader_hide(options["$target"]);

                // сделаем картинку видимой
                $img.addClass('shown');

                // вызовем колбэк
                if (options['on_load'] != undefined) {
                    options['on_load']( $img );
                }

            }, 300);

        };

        // отобразим картинку
        img.src = img_src;

        return $img;

    };

    //--[ run ]----------------------------------------------------------------------------------------------------------------------

    var _fInit = function () {

    };

    _fInit();

}