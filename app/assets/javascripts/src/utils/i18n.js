'use strict';

var I18n = function () {

    var _dictionary = {
        square        : 'Общая площадь',
        square_free   : 'Свободная площадь',
        floor_height  : 'Высота потолков',
        communications: 'Коммуникации',

        areas_count     : 'Площадей',
        areas_free_count: 'Свободных площадей',
        price_string    : ''
    };

    this.t = function (key) {
        return _dictionary[key];
    };

    var _fInit = function () {

    };

    _fInit();

}