"use strict";

// в задачи этого кода входит преобразование JSON объектов в human-читаемый текст с характеристиками

var MobjInfoParser = function () {

    var _this = this;

    // с помощью этого хелпера можно понять, например, что square это "общая площадь" (типа locales/ru.yml)
    var _i18n = null;

    /** Лабаем html текст из json-данных полигона Этажа/Здания/Площади
     *
     * @param json
     */
    this.makeHtmlText = function (json) {
        console.log("<makeHtmlText> Лабаем html текст из json данных полигона.");

        var result = "";

        //#-> предполагается, что json в поряде и данные целостны (т.е. уровнем выше была проверка json на корректность)
        switch (json["class_name"]) {
            case "C80MapFloors::Floor":
                result += _this._row('square', json);
                result += _this._row('square_free', json);
                result += _this._row('floor_height', json);
                result += _this._row('areas_count', json);
                result += _this._row('areas_free_count', json);
                result += _this._row('price_string', json);
            break;
        }

        result = "<ul>" + result + "</ul>";
        return result;

    };

    this._row = function (key, json) {
        var s = '';
        if (key == 'price_string') {
            s = "<li>" + json['data'][key] + "</li>";
        } else {
            s = "<li>" + _i18n.t(key) + ": " + "<span class='dd'>" + json['data'][key] + "</span>" + "</li>"
        }
        return s;
    };

    var _fInit = function () {

        // кастуем locales-помощника
        _i18n = new I18n();

    };

    _fInit();
};

