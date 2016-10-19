"use strict";

var IS_ADMIN = false;
var map_on_index_page = null;

var InitMap = function (params) {

    var dnd_enable = true;
    if (params != undefined && params["dnd_enable"] != undefined) {
        dnd_enable = params["dnd_enable"];
    }

    // - to delete start -----------------------------------------------------------------------------------------------------------------------
    var scale = 0.599999;

    var window_height = $(window).height() - 200;
    if (window_height < 400) window_height = 400;

    var window_width = $(window).width();
    var image_width = MAP_WIDTH * scale;
    var image_height = MAP_HEIGHT * scale;

    var x = (window_width - image_width)/2;
    var y = (window_height - image_height)/2;
    // - to delete end -----------------------------------------------------------------------------------------------------------------------

    map_on_index_page = $('#map_wrapper').beMap(
        {
            source:LOCS_HASH,
            scale: scale,
            x: x,
            y: y,
            mapwidth: MAP_WIDTH,
            mapheight: MAP_HEIGHT,
            height: window_height,
            dnd_enable: dnd_enable
        }
    );

};

var clog = function () {
    console.log(arguments[0]);
};

(function () {

    var Map = function () {
        var self = this;

        self.debug = true;
        self.o = {
            source: 'locations.json', // data
            height: 400,    // viewbox height, pixels
            mapwidth: 100,   // actual image size, in pixels
            mapheight: 100,
            mapfill: true,
            zoom: true,
            zoombuttons: true,
            maxscale: 1,
            fitscale: 0.51,
            skin: '',         // css class name
            scale: 1,
            x: 0,
            y: 0,
            dnd_enable: true
        };
        self.svg = null;
        self.svg_overlay = null;
        self.container = null;
        self.mode = 'viewing';
        self.prev_mode = null;
        self.setMode = null;
        self.selected_area = null;      // ссылка на полигон из #svg_overlay
        self.drawing_poligon = null;
        self.events = [];
        self.edit_type = null;
        self.remove_button_klass = null;
        self.new_button_klass = null;
        self.edit_button_klass = null;
        self.complete_creating_button_klass = null;
        self.back_to_map_button_klass = null;
        self.current_building = null;
        self.current_area = null;
        self.is_draw = false;
        self.save_button_klass = null;
        self.area_link_button_klass = null;
        self.drawn_areas = []; // если имеются нарисованные но несохранённые Площади - они хранятся тут
        self.drawn_buildings = []; // если имеются нарисованные но несохранённые Здания - они хранятся тут
        self.save_preloader_klass = null;
        self.last_clicked_g = null; // начали просматривать area\building (запустили сессию), и здесь храним ссылку на последний кликнутый полигон из svg_overlay в течение сессии
        self.dnd_enable = null; // если да, то можно карту dnd мышкой

        // true, если:
        //- юзер еще не кликал по кнопкам zoom
        //- юзер еще не делал drag-n-drop
        //- юзер ещё не вошёл ни в здание ни в площадь
        // Т.Е., другими словами, true до момента, пока пользователь не начал взаимодействовать с картой
        self.mark_virgin = true;

        // здесь сохранятся параметры для метода moveTo
        // чтобы вернуть карту в исходное состояние после нажатия кнопки "назад на карту"
        self.initial_map_position = null;

        self.init = function (el, params) {
            // extend options
            self.o = $.extend(self.o, params);

            self.x = self.o.x;
            self.y = self.o.y;
            self.scale = self.o.scale; /* NOTE:: инициализация: начальные значения */

            self.el = el.addClass('melem mloading').addClass(self.o.skin).height(self.o.height);

            // Disable modules when landmark mode is active
            /*if (self.o.landmark) {
             self.o.sidebar = false;
             self.o.zoombuttons = false;
             self.o.deeplinking = false;
             }*/

            if (typeof self.o.source === 'string') {
                // Loading .json file with AJAX
                $.getJSON(self.o.source, function (data) { // Success
                    initProcessData(data);
                    self.el.removeClass('mloading');
                    //setTimeout(invalidateZoom,1000);

                }).fail(function () { // Failure: couldn't load JSON file, or it is invalid.
                    console.error('Couldn\'t load map data. (Make sure you are running the script through a server and not just opening the html file with your browser)');
                    self.el.removeClass('mloading').addClass('merror');
                    alert('Data file missing or invalid!');
                });
            }
            else {
                // Inline json object
                initProcessData(self.o.source);
                self.el.removeClass('mloading');
            }


            return self;


        };

        var initProcessData = function (data) {

            self.data = data;

            //var nrlevels = 0;
            //var shownLevel;

            self.container = $('.mcontainer'); //$('<div></div>').addClass('mcontainer').appendTo(self.el);
            self.map = self.container.find('.mmap'); //$('<div></div>').addClass('mmap').appendTo(self.container);
            if (self.o.zoom) self.map.addClass('mapplic-zoomable');
            self.map_layers = self.map.find('.layers');
            self.map_overlay_layers = self.map.find('.overlay_layers');

            self.svg = $("#svg");
            self.svg_overlay = $('#svg_overlay');
            //$('<svg></svg>')
            //.attr('xmlns','http://www.w3.org/2000/svg')
            //.attr('version','1.2')
            //.attr('baseProfile','tiny')
            //.attr('id','svg')
            //.appendTo(self.map);

            self.levelselect = $('<select></select>').addClass('mlevels_select');

            self.container.css('width', '100%'); // if (!self.o.sidebar)

            self.contentWidth = parseInt(data.mapwidth);
            self.contentHeight = parseInt(data.mapheight);

            self.hw_ratio = data.mapheight / data.mapwidth;

            self.map.css({
                'width': data.mapwidth,
                'height': data.mapheight
            });

            /*  NOTE:: важная строка: определяет css и js поведение кое-где [qwwqq]:
                2016-10-19

                1. Всё начинается в JSON - в самом начале разработки проектировался JSON:
                2. там для root объекта указан был
                руками
                набор характеристик. Среди которых был и object_type[переименован в class_name].
                3. на тот момент object_type был равен строке "main_map".
                4. Затем эта строка (в процессе разработки) стала использоваться, как
                имя css класса, и были накиданы стили для оформления.
                5. Затем, уже css класс был использован внутри StateController.js, который
                работает с состоянием приложения и видимостью детей '.main_map'.

                По хорошему - надо убрать из JSON этот параметр,
                а здесь рукми напишем строку 'main_map', что и сделаем.
            */
            // Create new map layer
            var layer = $('<div></div>')
                .addClass('mlayer')
                //.addClass(data["class_name"])/* [qwwqq] */
                .addClass("main_map")/* [qwwqq] */
                .appendTo(self.map_layers); // .hide()
            $('<img>').attr('src', data["img"]).addClass('mmap-image').appendTo(layer);

            // Zoom buttons
            if (self.o.zoombuttons) {
                self.zoombuttons = new ZoomButtons();
                self.zoombuttons.init({height: self.o.height}, self);
                //if (!self.o.clearbutton) self.zoombuttons.el.css('bottom', '0');
            }

            var sc = new StateController();
            sc.init(self);
            self.setMode = sc.setMode;

            // Admin buttons
            $.ajax({
                url: '/ajax/map_edit_buttons',
                type: 'POST',
                dataType: 'script',
                data: {
                    div_css_selector: '#container_buttons .mzoom_buttons'
                }
            }).done(function () {
                clog('<ajax.done>');

                self.edit_button_klass = new EditButton();
                self.edit_button_klass.init('.mapplic-edit-button', self);

                var e = new NewButton();
                e.init('.mapplic-new-button', self);
                self.new_button_klass = e;

                e = new RemoveButton();
                e.init('.mapplic-remove-button', self);
                self.remove_button_klass = e;

                e = new CancelRemoveButton();
                e.init('#cancelRemoving', self);

                e = new CancelCreatingButton();
                e.init("#cancelCreating", self);

                e = new CompleteCreatingButton();
                e.init("#completeCreating", self);

                self.save_button_klass = new SaveChangesButton();
                self.save_button_klass.init('.mapplic-save-button', self);

                // при клике на эту кнопку произойдет показ модального окна
                self.area_link_button_klass = new AreaLinkButton();
                self.area_link_button_klass.init('.mapplic-area-link-button', self);

                // при клике на эту кнопку произойдет показ модального окна, в котором можно будет указать здание, соответствующее полигону
                self.building_link_button_klass = new BuildingLinkButton();
                self.building_link_button_klass.init('.mapplic-building-link-button', self);

                $('[data-toggle="tooltip"]').tooltip();

            });

            // Controls
            initAddControls();

            self.draw_childs(data["buildings"]);

            self.ivalidateViewArea();

            // Browser resize
            $(window).resize(function () {

                // Mobile
                //if ($(window).width() < 668) {
                //    self.container.height($(window).height() - 66);
                //}
                //else self.container.height('100%');

                // Контейнер с картой должен слушать изменения габаритов окна и подгоняться по высоте
                var window_height = $(window).height() - 200;
                if (window_height < 400) window_height = 400;
                self.el.height(window_height + "px");

                // 20161003: заодно после редизайна необходимо позиционировать текстовый блок с адресом
                var hh = _$address_p.outerHeight(true);
                _$address_p.css('margin-top',(window_height - hh - 200)+"px");

                // ------------------------------------------------------------------------------------------------------------------------

                // если пользователь еще не взаимодействовал с картой или вне здания\площади
                // вписываем картинку карты в главный прямоугольник карты
                // т.е. меняем масштаб
                if (self.mark_virgin) {
                    // рассчитаем масштаб, при котором можно вписать главный прямоугольник карты в прямоугольник рабочей области
                    var scaleX = self.calcScale(self.o.mapwidth*0.05, self.o.mapwidth *.95, self.X10, self.X20);
                    var scaleY = self.calcScale(self.o.mapheight*0.05, self.o.mapheight *.95, self.Y10, self.Y20);
                    var scale = (scaleX < scaleY) ? scaleX : scaleY;
                    self.scale = scale; /* NOTE:: вызывается во время window resize */
                }

                // совмещаем точку на экране, в которую надо центрировать карту,
                // с центром карты (или с центром здания\площади, в котором находится юзер),
                // с учётом рассчитанного масштаба

                // если пользователь еще не взаимодействовал с картой или вне здания\площади,
                // то фокусируемся на центр карты,
                // иначе - фокусируемся на центр здания\площади, в котором находится пользователь и
                // фокус сдвигаем, с учётом того, что сбоку открыта панель с информацией о здании

                // NOTE-25::хардкод
                // логические координаты - геометрический центр картинки
                var cx = self.o.mapwidth/2;
                var cy = self.o.mapheight/2;
                var mark_do_moving = false;

                if (self.current_building) {
                    cx = self.current_building.cx();
                    cy = self.current_building.cy();
                    mark_do_moving = true;
                } else if (self.current_area) {
                    cx = self.current_area.cx();
                    cy = self.current_area.cy();
                    mark_do_moving = true;
                } else if (self.mark_virgin) {
                    mark_do_moving = true;
                }

                if (mark_do_moving) {
                    self.x = self.normalizeX({
                        x: self.CX - self.scale * cx - self.container.offset().left,
                        scale: self.scale
                    });
                    self.y = self.normalizeY({
                        y: self.CY - self.scale * cy - self.container.offset().top,
                        scale: self.scale
                    });
                    clog("<$(window).resize> call moveTo");
                    self.moveTo(self.x, self.y, self.scale, 100);

                    // если пользователь ещё не взаимодействовал с картой (т.е. она только загрузилась и готова к использованию)
                    // запомним позицию, чтобы при нажатии на кнопку "назад на карту" происходил возврат с исходному
                    // состоянию
                    if (self.mark_virgin) {
                        self.initial_map_position = {
                            x: self.x,
                            y: self.y,
                            scale: self.scale
                        }
                    }

                }

                // ------------------------------------------------------------------------------------------------------------------------


                self.ivalidateViewArea();

            }).resize();

        };

        var initAddControls = function () {
            var map = self.map,
                mapbody = $('.mmap-image', self.map);

            document.ondragstart = function () {
                return false;
            }; // IE drag fix

            function onSvgMousedown(e) {
                clog("<onSvgMousedown> self.mode = " + self.mode);

                if (self.mode === 'editing' || self.mode === "edit_building" || self.mode === 'edit_area') {
                    if (e.target.parentNode.tagName === 'g') {
                        clog("<onSvgMousedown> e = ");
                        //clog(e.pageX);
                        //clog("<mouseDown> e.target.parentNode.tagName = " + e.target.parentNode.tagName);
                        //clog(e.target);
                        //info.unload();

                        // запомним ссылку на "выбранную" область
                        self.selected_area = e.target.parentNode.obj;

                        //app.deselectAll();

                        // поменяем внешний вид полигона - добавим класс .selected
                        self.selected_area.select();

                        // запомним начальные координаты кликаы
                        self.selected_area.delta = {
                            'x': e.pageX,
                            'y': e.pageY
                        };

                        // если взаимодействуем с вершиной
                        if (utils.hasClass(e.target, 'helper')) {
                            var helper = e.target;
                            //clog("<mouseDown> helper.action = ");
                            //clog(helper.action);
                            self.edit_type = helper.action; // pointMove

                            if (helper.n >= 0) { // if typeof selected_area == polygon
                                self.selected_area.selected_point = helper.n;
                            }

                            self.addEvent(self.el[0], 'mousemove', self.onEdit)
                                //self.addEvent(self.el[0], 'mousemove', self.selected_area.onEdit)
                                .addEvent(self.el[0], 'mouseup', self.onEditStop);
                        }

                        else if (e.target.tagName === 'rect' || e.target.tagName === 'circle' || e.target.tagName === 'polygon') {
                            self.edit_type = 'move';
                            self.addEvent(self.el[0], 'mousemove', self.onEdit)
                                .addEvent(self.el[0], 'mouseup', self.onEditStop);
                        }
                    } else {
                        //app.deselectAll();
                        //info.unload();
                    }
                }
            }

            self.svg.on('mousedown', onSvgMousedown);
            //self.el[0].addEventListener('mousedown', onSvgMousedown, false);


            // Drag & drop
            function onDragNdrop(event) {
                //clog("<mousedown> edit_type = " + self.edit_type);
                clog("<mousedown> mode = " + self.mode);
                //clog(event);

                // если в данный момент не редактируем фигуру (т.е. не двигаем вершину фигуры)
                if (self.edit_type == null) {
                    self.dragging = false;
                    map.stop();

                    map.data('mouseX', event.pageX);
                    map.data('mouseY', event.pageY);
                    map.data('lastX', self.x);
                    map.data('lastY', self.y);
                    map.data('startX', self.x);
                    map.data('startY', self.y);

                    map.addClass('mdragging');

                    self.map.on('mousemove', function (event) {
                        self.dragging = true;

                        if (self.dnd_enable) {
                            var x = event.pageX - map.data('mouseX') + self.x;
                            var y = event.pageY - map.data('mouseY') + self.y;

                            x = self.normalizeX({
                                x:x,
                                scale: self.scale
                            });
                            y = self.normalizeY({
                                y:y,
                                scale: self.scale
                            });

                            //clog("<Map.mousemove> x = " + x + "; y = " + y);
                            //clog("<Map.mousemove> Call moveTo.");
                            self.moveTo(x, y); /* NOTE:: вызывается во время dnd */
                            map.data('lastX', x);
                            map.data('lastY', y);
                        }
                    });

                    $(document).on('mouseup', function (event) {
                        //clog("<mouseup> dragging = " + self.dragging + ", mode = " + self.mode + "; is_draw = " + self.is_draw + "; scale = " + self.scale);
                        //clog("<mouseup> event = ");
                        //clog(event);
                        //clog("<mouseup> event.target = ");
                        //clog($(event.target).parent()[0].obj);

                        //clog("<mouseup> [qq] screen: " + event.pageX + ", " + event.pageY +
                        //"; logic: " + self.rightX(event.pageX) + ", " + self.rightY(event.pageY));

                        clog("<mouseup> self.mode = " + self.mode);

                        // исключаем случайный dnd дрожащей рукой
                        var dx = map.data('startX') - map.data('lastX');
                        var dy = map.data('startY') - map.data('lastY');
                        var delta = Math.sqrt(dx*dx + dy*dy);
                        var is_real_dragging = delta > 10;

                        // если это в самом деле был drag\n\drop
                        if (self.dragging && is_real_dragging) {

                            self.x = map.data('lastX');
                            self.y = map.data('lastY');
                        }

                        // иначе - пытаемся выяснить, в каком режиме находимся
                        else {

                            var p;

                            /* если находимся в режиме просмотра всей карты - входим в здание */
                            if (self.mode == 'viewing') {
                                //clog($(event.target).parent()[0].obj.building);

                                // добираемся до объекта класса Здание, который обслуживает полигон
                                p = $(event.target).parent()[0];
                                if (p.obj && p.obj.building) {
                                    var building = p.obj.building;
                                    clog("<mouseup> Входим в здание.");
                                    building.enter();
                                }

                            }

                            /* если находимся в режиме рисования - рисуем */
                            else if (self.mode == 'creating') {

                                // и если ещё пока не начали рисовать (т.е. если это первый клик)
                                if (!self.is_draw) {

                                    var xx = self.rightX(event.pageX);
                                    var yy = self.rightY(event.pageY);
                                    //clog("<mouseup> " + xx + "; " + yy);

                                    self.drawing_poligon = new Polygon(xx, yy, false, self);

                                    //self.addEvent(self.el[0], 'mousemove', self.drawing_poligon.onDraw)
                                    self.addEvent(self.el[0], 'mousemove', function (e) {
                                        var _n_f = self.drawing_poligon;
                                        var right_angle = !!e.shiftKey; //e.shiftKey ? true : false;

                                        _n_f.dynamicDraw(self.rightX(e.pageX), self.rightY(e.pageY), right_angle);
                                    })
                                        //.addEvent(self.drawing_poligon.helpers[0].helper, 'click', self.drawing_poligon.onDrawStop)
                                        //.addEvent(self.el[0], 'click', self.drawing_poligon.onDrawAddPoint);
                                        .addEvent(self.el[0], 'click', function (e) {

                                            // если кликнули в первую точку фигуры - заканчиваем рисование
                                            var $et = $(e.target);
                                            var $h = $(self.drawing_poligon.helpers[0].helper);
                                            if ($et.attr('x') == $h.attr('x') && $et.attr('y') == $h.attr('y')) {
                                                //self.drawing_poligon.onDrawStop();
                                                self.onDrawStop();
                                                return;
                                            }

                                            var x = self.rightX(e.pageX),
                                                y = self.rightY(e.pageY),
                                                _n_f = self.drawing_poligon;

                                            if (e.shiftKey) {
                                                var right_coords = _n_f.right_angle(x, y);
                                                x = right_coords.x;
                                                y = right_coords.y;
                                            }
                                            _n_f.addPoint(x, y);
                                        })
                                        .addEvent(document, 'keydown', self.onDrawStop);
                                }
                            }

                            /* если находимся в режиме просмотра здания - входим в площадь */
                            /* если находится в режиме просмотра площади - переключаемся на другую площадь */
                            else if (self.mode == 'view_building' || self.mode == 'view_area') {

                                //console.log($(event.target).parent());
                                // => g, который живёт в #svg_overlay, или, другими словами,
                                // тот g, по которому кликнули последний раз,
                                // просматривая либо здание, либо площадь
                                var $viewing_g_from_svg_overlay = $(event.target).parent();

                                // добираемся до объекта класса Area, который обслуживает полигон
                                p = $viewing_g_from_svg_overlay[0];
                                //clog($(event.target).parent()[0].obj.area_hash);

                                if (p.obj && p.obj.area) {

                                    // запомним последний кликнутый полигон
                                    self.last_clicked_g = $viewing_g_from_svg_overlay;

                                    var area = p.obj.area;
                                    clog("<mouseup> Входим в площадь. self.last_clicked_g = ");
                                    clog(self.last_clicked_g);
                                    area.enter();
                                }

                            }
                        }

                        self.map.off('mousemove');
                        $(document).off('mouseup');

                        map.removeClass('mdragging');
                    });
                }
            }

            self.svg.on('mousedown', onDragNdrop);
            self.svg_overlay.on('mousedown', onDragNdrop);

            self.el[0].addEventListener('mousemove', function (e) {
                //coords_info.innerHTML = 'x: ' + rightX(e.pageX) + ', ' + 'y: ' + rightY(e.pageY);
            }, false);

            self.el[0].addEventListener('mouseleave', function () {
                //coords_info.innerHTML = '';
            }, false);

            /* Disable selection */
            //self.el[0].addEventListener('mousedown', function(e) { e.preventDefault(); }, false);

            /* Disable image dragging */
            self.el[0].addEventListener('dragstart', function (e) {
                e.preventDefault();
            }, false);

            self.back_to_map_button_klass = new BackToMapButton();
            self.back_to_map_button_klass.init("#ui", self);

            self.save_preloader_klass = new SavePreloader();
            self.save_preloader_klass.init();

        };

        // какой должен быть минимальный масштаб, чтобы вписать отрезок [min,max] в отрезок [p1,p2]
        self.calcScale = function (min, max, p1, p2) {
            //clog("<calcScale> [" + min + "," + max + '] to [' + p1 + "," + p2 + "]");
            return (p2 - p1) / (max - min);
        };

        self.calcCoord = function (scale, pageC, logicC) {
            return pageC - scale * logicC;
        };

        /* --- ivalidateViewArea BEGIN --------------------------------------------------------------------------------- */

        var _$m = $("#map_wrapper");
        var _$b = $('.container');//$('footer .container');
        var $building_info = $('.building_info'); // "layouts/shared/map_row/building_info"
        var $area_order_button = $('.area_order_button');
        var $container_buttons = $('#container_buttons');
        var _is_debug_drawn = true;
        var _$address_p = $('#paddress'); // 20161003: после редизайна надо дополнительно позиционировать блок с адресом

        self.ivalidateViewArea = function () {
            //clog('<init> _$b.offset().left = ' + _$b.offset().left);

            // рассчитаем "константы" - прямоугольник, в который надо вписывать картинки зданий при входе в них
            self.X1 = _$b.offset().left + 100;
            self.X1S = _$b.offset().left + 200;
            self.Y1 = 73;
            self.Y1S = 140;
            self.X2 = self.X1 + _$b.width() * .5;
            self.X2S = self.X1 + _$b.width() * .4;
            self.X3 = self.X1 + _$b.width() - 100;
            self.Y2 = _$m.height() - 20;
            self.Y2S = _$m.height() - 80;
            self.CX = (self.X2 - self.X1) / 2 - 2 + self.X1;
            self.CY = (self.Y2 - self.Y1) / 2 - 2 + self.Y1;

            self.X10 = _$b.offset().left + 15;
            self.X20 = self.X10 + _$b.width();
            self.Y10 = 73;
            self.Y20 = _$m.height();

            // позиционируем элементы
            $building_info.css("left", self.X2 + "px");
            $area_order_button.css("left", self.X2 + "px");
            if (self.container) $container_buttons.css("margin-top", (self.container.height() -10) + "px");

            // DEBUG
            if (self.debug) {

                if (!_is_debug_drawn) {
                    _is_debug_drawn = true;

                    var style = "display:block;position:absolute;background-color:#00ff00;opacity:0.4;";
                    var style_x = style + "width:1px;height:800px;top:0;left:{X}px;";
                    var style_y = style + "width:3000px;height:1px;left:0;top:{Y}px;";
                    var style_dot = style + 'width:4px;height:4px;left:{X}px;top:{Y}px;';

                    var to_draw = [
                        {x: self.X10},
                        {x: self.X20},
                        {y: self.Y10},
                        {y: self.Y20},
                        {x: self.CX},
                        {y: self.CY},
                    ];


                    var i, istyle, xx, yy, ip;
                    for (i = 0; i < to_draw.length; i++) {
                        ip = to_draw[i];

                        if (ip.x != undefined) {
                            istyle = style_x.split("{X}").join(ip.x);
                        } else if (ip.y != undefined) {
                            istyle = style_y.split("{Y}").join(ip.y);
                        }

                        _$m.append($("<div style=" + istyle + "></div>"));
                    }

                }

            }

        };

        /* --- ivalidateViewArea END ----------------------------------------------------------------------------------- */

        self.addEvent = function (target, eventType, func) {
            self.events.push(new AppEvent(target, eventType, func));
            return self;
        };

        self.removeAllEvents = function () {
            utils.foreach(self.events, function (x) {
                x.remove();
            });
            self.events.length = 0;
            self.edit_type = null;
            return this;
        };

        self.addNodeToSvg = function (node, is_overlay) {
            if (is_overlay) {
                self.svg_overlay[0].appendChild(node);
            } else {
                self.svg[0].appendChild(node);
            }
            return self;
        };

        self.removeNodeFromSvg = function(node, is_overlay) {
            if (is_overlay) {
                self.svg_overlay[0].removeChild(node);
            } else {
                self.svg[0].removeChild(node);
            }
            return this;
        };

        self.svgRemoveAllNodes = function () {
            self.svg.empty();
            self.svg_overlay.empty();
        };

        /** Нарисовать на карте объекты из массива childs.
         *
         * Массив childs содержит наборы однотипных объектов.
         * Т.е. объекты только одного типа приходят в фукнцию.
         * Типы могут быть: C80MapFloors::MapBuilding,C80MapFloors::Area
         *
         * Если мы рисуем набор Площадей C80MapFloors::Area, то:
         *          - это означает, что мы вошли в Здание C80MapFloors::Building.
         *          - parent_hash - это as_json объекта класса C80Rent:Building,
         *          который привязан к родителю отрисовываемого C80MapFloors::Area,
         *          (т.е. родитель - это C80MapFloors::Building).
         *           - И подаётся он для того, чтобы в окне с информацией о C80Rent:Area
         *           можно было отобразить характеристики Здания родителя C80Rent:Building.
         */
        self.draw_childs = function (childs, parent_hash) {
            //clog("<Map.draw_childs>");

            //var ip;
            var iobj;
            var ib, id, ia;
            for (var i = 0; i < childs.length; i++) {
                iobj = childs[i];

                switch (iobj["class_name"]) { /* NOTE:: сопоставление Ruby класса и JS класса */
                    case 'C80MapFloors::MapBuilding':
                        ib = new Building();
                        ib.init(iobj,self);
                        break;
                    case 'dot':
                        id = new Dot();
                        id.init(iobj,self);
                        break;
                    case 'C80MapFloors::Area':
                        ia = new Area();
                        ia.init(iobj, parent_hash, self);
                        break;
                    case 'C80MapFloors::Floor':
                        ia = new Floor();
                        ia.init(iobj, parent_hash, self);
                        break;
                }
                //ip = Polygon.createFromSaved(iobj);
                //utils.id('svg').appendChild(ip.g);
            }
        };

        /**
         *  создаёт DOM элемент:
         *      <div class='mlayer #{obj_type}'>
         *          <img src='#{img_src}' class='mmap-image' />
         *      </div>
         *  и помещает его либо в map_overlay_layers, либо в map_layers (~ от параметра is_overlay)
         */
        self.draw_child_bg_image = function (img_src, obj_type, is_overlay) {
            var t;
            if (is_overlay == true) {
                t = self.map_overlay_layers;
            } else {
                t = self.map_layers;
            }
            // Create new map layer
            var layer = $('<div></div>').addClass('mlayer').addClass(obj_type).appendTo(t); // .hide()
            $('<img>').attr('src', img_src).addClass('mmap-image').appendTo(layer);

            return layer;
        };

        /**
         *  создаёт DOM элемент:
         *      <div class='map_object_image_bg'>        // style='background-image:url(#{img_src});'
         *          <img src=#{img_src} />
         *      </div>
         *  и помещает его map_layers
         *
         *  left и top - координаты bound box верхнего левого угла здания
         *
         */
        self.draw_map_object_image_bg = function (img_src, params) {

            // породим DOM
            var $div_map_object_image_bg = $('<div></div>')
                .addClass('mlayer')
                //.attr('style','background-image:url("'+img_src+'")')
                .appendTo(self.map_layers); // .hide()

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

            // рассчитаем и применим стиль
            self.__compose_css_style_for_map_object_image($img);

            return $div_map_object_image_bg;

        };

        /**
         * Задача этой служебной функции является:
         *      - рассчёт актуальных (для данного масштаба) размеров и координат местонах указанного объекта (вместо объекта подаётся хэш описывающий его, с x,y,width,height)
         *      - составление css стиля для картинки с css-классом map_object_image_bg
         *      - присвоении этого стиля картинке
         * @private
         */
        self.__compose_css_style_for_map_object_image = function ($img_with_class_map_object_image_bg) {

            var $i = $img_with_class_map_object_image_bg;

            // проведём калькуляцию [zoomove-calc]
            var left = $i.data("left")*self.scale_during_animation;
            var top = $i.data("top")*self.scale_during_animation;
            var width = $i.data("width")*self.scale_during_animation;
            var height = $i.data("height")*self.scale_during_animation;

            // впишем в DOM стили
            var style = 'top:';
            style += top + 'px;';
            style += "left:";
            style += left + 'px;';
            style += "width:";
            style += width + 'px;';
            style += "height:";
            style += height + 'px;';

            console.log("> scale: " + self.scale + "; style: " + style);
            $i.attr('style',style);

        };

        self.onEdit = function (e) {

            //clog("<Polygon.prototype.onEdit> _s_f = " + _s_f);
            //clog("<Polygon.prototype.onEdit> e = ");
            //clog(_s_f);
            //clog(e.pageX);

            var selected_area = self.selected_area;
            var edit_type = self.edit_type;
            //clog("<Polygon.prototype.onEdit> edit_type = " + edit_type);

            selected_area.dynamicEdit(selected_area[edit_type](e.pageX - selected_area.delta.x, e.pageY - selected_area.delta.y));
            selected_area.delta.x = e.pageX;
            selected_area.delta.y = e.pageY;
        };

        self.onDrawStop = function (e) {
            clog("<Map.onDrawStop>");

            if (e != undefined) {
                if (e.type == 'keydown' && e.keyCode == 13) {
                    // its ok, continue execution..
                } else {
                    return
                }
            }

            var _n_f = self.drawing_poligon;
            if (_n_f.params.length >= 6) { //>= 3 points for polygon
                _n_f.polyline = _n_f.polygon;
                _n_f.polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                _n_f.g.replaceChild(_n_f.polygon, _n_f.polyline);
                _n_f.setCoords(_n_f.params).deselect();
                delete(_n_f.polyline);

                // в зависимости от предыдущего состояния, создадим либо Здание, либо Площадь
                if (self.prev_mode == "edit_building") {
                    var bo = self.current_building.options;
                    var a = new Area();
                    a.init({ coords:_n_f.params }, bo, self);
                    //a.is_new = true;
                    _n_f.remove(); // удаляем нарисованный полигон, т.к. его уже заменили полигоном Area
                    self.registerJustDrownArea(a);
                }
                else if (self.prev_mode == 'editing') {
                    var b = new Building();
                    b.init({ coords:_n_f.params }, self);
                    //b.is_new = true;
                    _n_f.remove(); // удаляем нарисованный полигон, т.к. его уже заменили полигоном Building
                    self.registerJustDrownBuilding(b);
                }

                self.removeAllEvents();
                self.drawing_poligon = null;
                self.is_draw = false;
            }

            self.setMode('editing');
        };

        self.onEditStop = function (e) {
            //clog("<Polygon.prototype.onEditStop>");
            var _s_f = self.selected_area,
                edit_type = self.edit_type;

            _s_f.setParams(_s_f.dynamicEdit(_s_f[edit_type](e.pageX - _s_f.delta.x, e.pageY - _s_f.delta.y)));

            self.removeAllEvents();
        };

        self.registerJustDrownArea = function (area) {
            self.drawn_areas.push(area);
        };

        self.registerJustDrownBuilding = function (building) {
            self.drawn_buildings.push(building);
        };

        /**
         * Зная ширину контейнера и контента,
         * используя указанные параметры,
         * рассчитать нормальный X
         * @param x
         * @param scale
         * @returns {*}
         */
        self.normalizeX = function (params) {

            var x = params['x'];
            var scale = params['scale'];

            var minX = self.container.width() - self.contentWidth * scale;

            if (minX < 0) {
                if (x > 0) x = 0;
                else if (x < minX) x = minX;
            }
            else x = minX / 2;

            return x;
        };

        /**
         * Зная высоту контейнера и контента,
         * используя указанные параметры,
         * рассчитать нормальный Y
         * @param y
         * @param scale
         * @returns {*}
         */
        self.normalizeY = function (params) {

            var y = params['y'];
            var scale = params['scale'];

            var minY = self.container.height() - self.contentHeight * scale;

            if (minY < 0) {
                if (y >= 0) y = 0;
                else if (y < minY) y = minY;
            }
            else y = minY / 2;

            return y;
        };

        /**
         * Используя ограничения по масштабу нормализовать scale
         * @param scale
         * @returns {*}
         */
        self.normalizeScale = function (scale) {
            clog('<self.normalizeScale>' + self.o.fitscale);
            if (scale < self.o.fitscale) scale = self.o.fitscale;
            else if (scale > self.o.maxscale) scale = self.o.maxscale;

            if (self.zoombuttons) self.zoombuttons.update(scale);

            return scale;
        };

        /*self.zoomTo = function (x, y, s, duration, easing, ry) {
            duration = typeof duration !== 'undefined' ? duration : 400;
            ry = typeof ry !== 'undefined' ? ry : 0.5;

            // это значение нужно присвоить только после анимации
            self.scale = self.normalizeScale(self.o.fitscale * s);

            self.x = self.normalizeX(self.container.width() * 0.5 - self.scale * self.contentWidth * x);
            self.y = self.normalizeY(self.container.height() * ry - self.scale * self.contentHeight * y);

            clog("<Map.zoomTo> Call moveTo.");
            self.moveTo(self.x, self.y, self.scale, duration, easing);
        };*/

        /** задачи этой функции:
         *      - быть контейнером кода
         *      - считывать css атрибут self.map
         *      - по регулярке извлекать left и top
         *      - трансформировать эти значения
         *      - изменить атрибут viewBox обоих svg слоёв
         *      
         *      Изначально была задумка каждый шаг анимации вызывать эту функцию.
         *      Но затем во время оптимизации слои с svg стали видны только тогда,
         *      когда анимация не проходит. По-этому этот код был поставлен на setTimeout
         * */
        var __afterMovingCorrectSvgLayersPositions = function () {
            //clog(self.map.attr('style'));
            // left: -69.9985px; top: -299.999px;
            // left: [-]{0,1}(\d+\.\d+px);

            var str = self.map.attr('style');
            var rx_left = /left: [-]{0,1}(\d+\.\d+)px;/;
            var rx_top = /top: ([-]{0,1}\d+\.\d+)px;/;
            var match_left = str.match(rx_left);
            var match_right = str.match(rx_top);

            if (match_left != null && match_right != null) {
                var x = -1 * Number(match_left[1]); // ["left: -69.9985px;", "69.9985"]
                var y = -1 * Number(match_right[1]); // ["left: -69.9985px;", "69.9985"]
                var att = x + " " + y + " " + self.contentWidth + " " + self.contentHeight;
                //clog(x + "; y = " + y);
                self.svg.attr('viewBox', att);
                self.svg_overlay.attr('viewBox', att);
            }

            __moveToStep();

        };

        /** Задачей этого метода является постоянная корректировка местонах и размера оверлейного слоя,
         * который сейчас виден (картинка этажа, например), во время анимации zoom\move
         * 
         * @private
         */
        var __moveToStep = function () {
            console.log("<__moveToStep>");

            // [zoomove]
            $('.map_object_image_bg').each(function () {
                // рассчитаем и применим стиль
                self.__compose_css_style_for_map_object_image($( this ));
            });
            
        };
        
        var __moveToTimeout = function () {
            if (self.mode === 'edit_area'|| self.mode === 'view_area') {
                $("#masked").removeClass('hiddn');
            }
        };
        var __moveToAnimate = function () {
            if (self.tooltip) self.tooltip.position();
        };

        // x,y - экранные координаты
        // сюда подаётся scale, который нужно присвоить map после анимации
        self.moveTo = function (x, y, scale, d, easing) {
            clog("<self.moveTo> x = " + x + "; y = " + y + "; scale = " + scale + "; delay = " + d);
            //clog('<self.moveTo>');

            // если подан аргумент scale(масштаб)
            // перемещаемся анимированно
            if (scale !== undefined) {

                // на время движения скрываем слой с полосатой анимацией
                if (self.current_area != null) {
                    $("#masked").addClass('hiddn');
                    setTimeout(__moveToTimeout, d);
                }

                setTimeout(__afterMovingCorrectSvgLayersPositions, d);

                /* TODO:: реализовать рассчёт scale во время анимации (но во время анимации мы можем прятать image_bg слои */
                self.map.stop().animate(
                    {
                        'left': x,
                        'top': y,
                        'width': self.contentWidth * scale,
                        'height': self.contentHeight * scale
                    },
                    {
                        'step': __moveToStep,
                        'complete': function () {
                            console.log('<CORE>');

                            self.scale = scale; /* NOTE:: CORE */
                            self.x = x;
                            self.y = y;
                        }
                    },
                    d,
                    easing,
                    __moveToAnimate
                );

            }

            // если не подан аргумент scale(масштаб)
            // перемещаемся без анимации
            else {

                self.map.css({
                    'left': x,
                    'top': y
                });

                console.log('<CORE>');
                self.scale = scale; /* NOTE:: CORE */
                self.x = x;
                self.y = y;

                var t = (-x) + " " + (-y) + " " + self.contentWidth * self.scale + " " + self.contentHeight * self.scale;
                self.svg.attr('viewBox',t);
                self.svg_overlay.attr('viewBox', t);
            }

            if (self.current_area != null) {
                self.current_area.invalidateAnimationMask();
            }

            //if (self.tooltip) self.tooltip.position();
            //if (self.minimap) self.minimap.update(x, y);
        };

        // показать инфо о здании
        self.showBuildingInfo = function (rent_building_hash) {
            console.log("<main.showBuildingInfo> Показать информацию о Rent-здании с id = " + rent_building_hash.id);

            //"rent_building_hash": {
            //    "id": 2,
            //        "title": "Здание 2",
            //        "props": {
            //            "square": "1234 кв.м.",
            //            "square_free": "124 кв. м",
            //            "floor_height": "124 кв. м",
            //            "column_step": "2 м",
            //            "gate_type": "распашные",
            //            "communications": "Интернет, электричество, водоснабжение",
            //            "price": "от 155 руб/кв.м в месяц"
            //    }

            if (rent_building_hash.id == undefined) {
                $building_info.css('display','none');
            } else {
                $building_info.css('display','block');
                $building_info.find("h2").text(rent_building_hash["title"]);

                var v, $ili, p;
                for (p in rent_building_hash["props"]) {

                    v = rent_building_hash["props"][p];
                    $ili = $building_info.find("#" + p);
                    $ili.find('span').text(v);
                    //console.log("."+v+".");

                    // Не показывать пользователю карты незаполненные поля
                    var li_css_display = 'block';
                    if (v == '' || v == '-1' || v === 'null' || v == null) {
                        li_css_display = 'none';
                    }
                    $ili.css('display',li_css_display);


                }

                $building_info.find("#square_free").css('height', 'auto');
            }
        };

        // показать инфо о просматриваемой площади
        self.showAreaInfo = function (area_hash, parent_building_hash) {
            //clog(area_hash);

            //"area_hash": {
            //        "id": 2,
            //        "title": "Площадь 2.12",
            //        "is_free": false,
            //        "props": {
            //            "square": "100 кв.м.",
            //            "floor_height": "6 кв. м",
            //            "column_step": "2 м",
            //            "gate_type": "распашные",
            //            "communications": "Интернет, электричество, водоснабжение",
            //            "price": "от 155 руб/кв.м в месяц"
            //    }

            //"rent_building_hash": {
            //        "id": 2,
            //        "title": "Здание 2",
            //        "props": {
            //            "square": "1234 кв.м.",
            //            "square_free": "124 кв. м",
            //            "floor_height": "6 кв. м",
            //            "column_step": "2 м",
            //            "gate_type": "распашные",
            //            "communications": "Интернет, электричество, водоснабжение",
            //            "price": "от 155 руб/кв.м в месяц"
            //    }

            $building_info.find("h2").html("</span>" + area_hash["title"] + "<span style='color:#D0B2B2;'> / " + parent_building_hash["title"]);

            var v;
            for (var p in area_hash["props"]) {
                v = area_hash["props"][p];
                $building_info.find("#" + p).find('span').text(v);
            }

            $building_info.find("#square_free").css('height', '0');

            // заполняем данными ссылку 'Оставить заявку'
            var $a_make_order = $building_info.find('.c80_order_invoking_btn');
            $a_make_order.data('comment-text', 'Здравствуйте, оставляю заявку на площадь: ' + area_hash["title"]);
            $a_make_order.data('subj-id', area_hash["id"]);

        };

        // перевод экранных координат в логические
        self.rightX = function(x) {
            return (x - self.x - self.container.offset().left) / self.scale;
        };

        self.rightY = function(y) {
            return (y - self.y - self.container.offset().top) / self.scale
        };

        // взять C80MapFloors::current_area и назначить ей Rent::area.id,
        // выбранный в окне _modal_window.html.erb
        self.link_area = function () {

            // фиксируем компоненты модального окна
            var $m = $('#modal_window');
            var $b = $m.find('.modal-footer').find('.btn');
            var $s = $m.find('select');

            // извлекаем значения
            var rent_area_id = $s.val();
            var map_area_id = self.current_area.id;
            console.log("<Map.link_area> rent_area_id = " + rent_area_id + "; map_area_id = " + map_area_id);

            // нажимаем кнопку "закрыть"
            $b.click();

            // показываем прелоадер
            self.save_preloader_klass.show();

            // отправляем запрос на сервер
            // TODO_MY:: реализовать обработчик ошибок
            $.ajax({
                url:'/ajax/link_area',
                type:'POST',
                data: {
                    rent_area_id: rent_area_id,
                    map_area_id: map_area_id
                },
                dataType:"json"
            }).done(function (data, result) {
                self.save_preloader_klass.hide();
                self.data = data["updated_locations_json"];
            });

        };

        // взять C80MapFloors::current_building и назначить ему Rent::building.id,
        // выбранный в окне _modal_window.html.erb
        self.link_building = function () {
            console.log('<Map.link_building> ');

            // фиксируем компоненты модального окна
            var $m = $('#modal_window');
            var $b = $m.find('.modal-footer').find('.btn');
            var $s = $m.find('select');

            // извлекаем значения
            var rent_building_id = $s.val();
            var map_building_id = self.current_building.id;
            console.log("<Map.link_area> rent_building_id = " + rent_building_id + "; map_building_id = " + map_building_id);

            // нажимаем кнопку "закрыть"
            $b.click();

            // показываем прелоадер
            self.save_preloader_klass.show();

            // отправляем запрос на сервер
            // TODO_MY:: реализовать обработчик ошибок
            $.ajax({
                url:'/ajax/link_building',
                type:'POST',
                data: {
                    rent_building_id: rent_building_id,
                    map_building_id: map_building_id
                },
                dataType:"json"
            }).done(function (data, result) {
                self.save_preloader_klass.hide();
                self.data = data["updated_locations_json"];
            });

        };

        self.show_free_areas_hint = function () {
            // рисуем в слое #svg_overlay,
            // а т.к. находимся в режиме просмотра карты,
            // этот слой пуст, можно им пока воспользоваться



        };
        self.hide_free_areas_hint = function () {

        };

    };

    //  Create a jQuery plugin
    $.fn.beMap = function (params) {
        var len = this.length;

        return this.each(function (index) {
            var me = $(this),
                key = 'beMap' + (len > 1 ? '-' + ++index : ''),
                instance = (new Map).init(me, params);
        });
    };

})
(jQuery);