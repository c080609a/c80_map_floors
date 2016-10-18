"use strict";

var BuildingLabel = function (options, link_to_map) {

    if (    options["rent_building_hash"] != undefined &&
            typeof options["rent_building_hash"].id != 'undefined' &&
            options["rent_building_hash"].props.free_areas_count != 0
    ) {

        this._x = options.coords[0];
        this._y = options.coords[1];
        this._map = link_to_map;

        var center_for_cicrle_x = this._x;
        var center_for_cicrle_y = this._y - 100;

        // создадим узел, который будет помещён в дерево и будет виден пользователю
        this._g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this._g.setAttribute("class","free_areas_label");

        this._bg_pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this._bg_pulse.setAttribute("cx",center_for_cicrle_x);
        this._bg_pulse.setAttribute("cy",center_for_cicrle_y);
        this._bg_pulse.setAttribute("r", 40);
        this._bg_pulse.setAttribute("class","pulse");
        
        this._bg_pulse2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this._bg_pulse2.setAttribute("cx",center_for_cicrle_x);
        this._bg_pulse2.setAttribute("cy",center_for_cicrle_y);
        this._bg_pulse2.setAttribute("r", 40);
        this._bg_pulse2.setAttribute("class","pulse2");
        
        this._bg_circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this._bg_circle.setAttribute("cx",center_for_cicrle_x);
        this._bg_circle.setAttribute("cy",center_for_cicrle_y);
        this._bg_circle.setAttribute("r",40);
        this._bg_circle.setAttribute("class","circle");
        
        this._text_element_ns = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this._text_element_ns.setAttribute('x', center_for_cicrle_x);
        this._text_element_ns.setAttribute('y', center_for_cicrle_y);
        this._text_element_ns.setAttribute('class', 'text');
        this._text_element_ns.textContent = options["rent_building_hash"].props.free_areas_count;

        this._aLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this._aLine.setAttribute('x1', this._x);
        this._aLine.setAttribute('y1', this._y);
        this._aLine.setAttribute('x2', center_for_cicrle_x);
        this._aLine.setAttribute('y2', center_for_cicrle_y);
        this._aLine.setAttribute('stroke', '#39BD5F');
        this._aLine.setAttribute('stroke-width', '2');


        // цепляем НЕ в #svg_overlay (об этом нам говорит is_overlay = false аргумент)
        this._map.addNodeToSvg(this._g, false);
        
        this._g.appendChild(this._aLine);
        this._g.appendChild(this._bg_pulse);
        this._g.appendChild(this._bg_pulse2);
        this._g.appendChild(this._bg_circle);
        this._g.appendChild(this._text_element_ns);

    }
    
};