var AreaLabel = function (options, link_to_map) {

    if (options.area_hash != undefined && typeof options.area_hash.id != 'undefined') {

        this._x = options.coords[0];
        this._y = options.coords[1];
        this._map = link_to_map;

        // создадим узел, который будет помещён в дерево и будет виден пользователю
        this._g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this._text_element_ns = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        this._text_element_ns.setAttribute('x', this._x);
        this._text_element_ns.setAttribute('y', this._y);
        this._text_element_ns.setAttribute('fill', '#000000');
        this._text_element_ns.setAttribute('style', 'font-size:12px;font-weight:bold;');
        this._text_element_ns.textContent = "id="+options.area_hash.id + "; " + options.area_hash.title;

        //
        this._map.addNodeToSvg(this._g, true);
        this._g.appendChild(this._text_element_ns);

    }


};