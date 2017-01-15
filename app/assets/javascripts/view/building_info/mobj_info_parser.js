"use strict";

// в задачи этого кода входит преобразование JSON объектов в human-читаемый текст с характеристиками

function MobjInfoParser() {

    var _this = this;

    // с помощью этого хелпера можно понять, например, что square это "общая площадь" (типа locales/ru.yml)
    var _i18n = null;

    // todo-clear22:: необходимо сбрасывать это значение после того, как сбросили поиск
    // текущий результат поиска - какие полигоны площадей соответствуют поиску и содержат искомые магазины
    var _sresults_areas = null;

    /**
     * Лабаем html текст из json-данных полигона Этажа/Здания/Площади.
     *
     * @param json
     */
    this.makeHtmlText = function (json) {
        console.log("<makeHtmlText> Лабаем html текст из json данных полигона.");

        var result = "";

        //#-> предполагается, что json в поряде и данные целостны (т.е. уровнем выше была проверка json на корректность)
        switch (json["class_name"]) {
            case "C80MapFloors::Floor":

                /* json:
                {
                    <...свойства картинки этажа, чисто класс C80MapFloors::Floor..>

                    "areas": [                                              // полигоны площадей этой картинки этажа
                                {  "id": 5,
                                    <...C80MapFloors::Floor..>

                                    "data": {                               // данные привязанной к плоигону Площади
                                        "id": 9,
                                        "title": "Дом-1",
                                        "square": null,
                                        "desc": "",
                                        "price_string": null,
                                        "communications": null,
                                        "is_free": false,
                                        "shop": {                           // данные Магазина, который занимает эту Площадь
                                            "id": 130,
                                            "title": "ИП Кибардин",
                                            "desc": "",
                                            "tel": "(910) 514 08 68",
                                            "site": "",
                                            "url": "/shops/ip-kibardin.html"
                                        }
                                    }
                                },
                    ],

                    "data":                                                 // данные Этажа, привязанного к картинке этажа
                        "id": 40,
                        "ord": 1,
                        "title": "1 этаж",
                        "square": 0.0,
                        "square_free": 0.0,
                        "areas_count": 2,
                        "areas_free_count": 2,
                        "price_string": "от  до  руб./кв.м",
                        "floor_height": null,
                        "communications": ""
                    }
                }*/

                /* или сокращённо
                json:
                {
                    "areas": [                                              // полигоны площадей этой картинки этажа
                                {  "id": 5,

                                    "data": {                               // данные привязанной к плоигону Площади
                                        "id": 9,
                                        "title": "Дом-1",
                                        "is_free": false,
                                        "shop": {                           // данные Магазина, который занимает эту Площадь
                                            "id": 130,
                                            "title": "ИП Кибардин",
                                        }
                                    }
                                },
                    ],

                    "data":                                                 // данные Этажа, привязанного к картинке этажа
                        "id": 40,
                        "title": "1 этаж",
                    }
                }
                */

                //<editor-fold desc=" // отобразим данные Этажа: метраж, кол-во площадей, коммуникации, цена за кв.м">
                result += _this._row('square', json);
                result += _this._row('square_free', json);
                //result += _this._row('floor_height', json);
                result += _this._row('communications', json);
                result += _this._row('areas_count', json);
                result += _this._row('areas_free_count', json);
                result += _this._row('price_string', json);
                //</editor-fold>

            break;
        }

        result = "<ul>" + result + "</ul>";
        return result;

    };

    this.setSearchResultAreas = function (sresult_areas) {
        _sresults_areas = sresult_areas;
    };

    this._row = function (key, json) {
        var s = '';
        if (key == 'price_string') {
            s = "<li class='price'>" + json['data'][key] + "</li>";
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
}

