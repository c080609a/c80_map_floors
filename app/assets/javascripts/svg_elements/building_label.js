"use strict";

var BuildingLabel = function (options, link_to_map) {
    
    this._x = String(options['x']);
    this._y = String(options['y']);
    this._count = options['count'];
    this._map = link_to_map;

    var _this = this;
    var center_for_circle_x = String(this._x);
    var center_for_circle_y = String(this._y - 50);

    // создадим узел, который будет помещён в дерево и будет виден пользователю
    this._g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this._g.setAttribute("class", "free_areas_label");

    // кружок
    this._bg_pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this._bg_pulse.setAttribute("cx", center_for_circle_x);
    this._bg_pulse.setAttribute("cy", center_for_circle_y);
    this._bg_pulse.setAttribute("r", '40');
    this._bg_pulse.setAttribute("class", "pulse");

    // кружок
    this._bg_pulse2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this._bg_pulse2.setAttribute("cx", center_for_circle_x);
    this._bg_pulse2.setAttribute("cy", center_for_circle_y);
    this._bg_pulse2.setAttribute("r", '40');
    this._bg_pulse2.setAttribute("class", "pulse2");

    // кружок
    this._bg_circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this._bg_circle.setAttribute("cx", center_for_circle_x);
    this._bg_circle.setAttribute("cy", center_for_circle_y);
    this._bg_circle.setAttribute("r", '40');
    this._bg_circle.setAttribute("class", "circle");

    // текст
    this._text_element_ns = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this._text_element_ns.setAttribute('x', center_for_circle_x);
    this._text_element_ns.setAttribute('y', center_for_circle_y);
    this._text_element_ns.setAttribute('class', 'text');
    this._text_element_ns.textContent = this._count;

    // вертикальная линия
    this._aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    this._aLine.setAttribute('x1', this._x);
    this._aLine.setAttribute('y1', this._y);
    this._aLine.setAttribute('x2', center_for_circle_x);
    this._aLine.setAttribute('y2', center_for_circle_y);
    this._aLine.setAttribute('stroke', '#39BD5F');
    this._aLine.setAttribute('stroke-width', '2');

    // цепляем НЕ в #svg_overlay (об этом нам говорит is_overlay = false аргумент)
    this._map.addNodeToSvg(this._g, false);

    // собираем
    this._g.appendChild(this._aLine);
    this._g.appendChild(this._bg_pulse);
    this._g.appendChild(this._bg_pulse2);
    this._g.appendChild(this._bg_circle);
    this._g.appendChild(this._text_element_ns);

    //--[ public ]------------------------------------------------------------------------------------------------------

    this.destroy = function () {
        if (this._map != null) {
            console.log('<BuildingLabel.destroy> Уничтожаем метку с кол-вом магазинов.');

            _this._map.removeNodeFromSvg(_this._g, false);

            if (_this._g != null) {

                _this._g.removeChild(_this._aLine);
                _this._g.removeChild(_this._bg_pulse);
                _this._g.removeChild(_this._bg_pulse2);
                _this._g.removeChild(_this._bg_circle);
                _this._g.removeChild(_this._text_element_ns);

                delete _this._aLine;
                delete _this._bg_pulse;
                delete _this._bg_pulse2;
                delete _this._bg_circle;
                delete _this._text_element_ns;

                delete _this._g;
            }

        }
    };

};