/* Polygon constructor */
var Polygon = function (x, y, is_overlay, self) {

    this._map = self;
    this._map.is_draw = true;

    this.params = [x, y]; //array of coordinates of polygon points

    this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    this._map.addNodeToSvg(this.g, is_overlay);
    this.g.appendChild(this.polygon);

    this.g.obj = this;
    /* Link to parent object */

    this.helpers = [ //array of all helpers-rectangles
        new Helper(this.g, this.params[0], this.params[1])
    ];

    this.helpers[0].setAction('pointMove').setCursor('pointer').setId(0);

    this.selected_point = -1;

    this.select().redraw();

    // app.addObject(this); //add this object to array of all objects
};

Polygon.prototype.setCoords = function (params) {
    //console.log(params);
    var coords_values = params.join(' ');
    this.polygon.setAttribute('points', coords_values);
    utils.foreach(this.helpers, function (x, i) {
        x.setCoords(params[2 * i], params[2 * i + 1]);
    });

    return this;
};

Polygon.prototype.setParams = function (arr) {
    this.params = Array.prototype.slice.call(arr);

    return this;
};

Polygon.prototype.addPoint = function (x, y) {
    var helper = new Helper(this.g, x, y);
    helper.setAction('pointMove').setCursor('pointer').setId(this.helpers.length);
    this.helpers.push(helper);
    this.params.push(x, y);
    this.redraw();

    return this;
};

Polygon.prototype.redraw = function () {
    this.setCoords(this.params);

    return this;
};

Polygon.prototype.right_angle = function (x, y) {
    var old_x = this.params[this.params.length - 2],
        old_y = this.params[this.params.length - 1],
        dx = x - old_x,
        dy = -(y - old_y),
        tan = dy / dx; //tangens

    if (dx > 0 && dy > 0) {
        if (tan > 2.414) {
            x = old_x;
        } else if (tan < 0.414) {
            y = old_y;
        } else {
            Math.abs(dx) > Math.abs(dy) ? x = old_x + dy : y = old_y - dx;
        }
    } else if (dx < 0 && dy > 0) {
        if (tan < -2.414) {
            x = old_x;
        } else if (tan > -0.414) {
            y = old_y;
        } else {
            Math.abs(dx) > Math.abs(dy) ? x = old_x - dy : y = old_y + dx;
        }
    } else if (dx < 0 && dy < 0) {
        if (tan > 2.414) {
            x = old_x;
        } else if (tan < 0.414) {
            y = old_y;
        } else {
            Math.abs(dx) > Math.abs(dy) ? x = old_x + dy : y = old_y - dx;
        }
    } else if (dx > 0 && dy < 0) {
        if (tan < -2.414) {
            x = old_x;
        } else if (tan > -0.414) {
            y = old_y;
        } else {
            Math.abs(dx) > Math.abs(dy) ? x = old_x - dy : y = old_y + dx;
        }
    }

    return {
        x: x,
        y: y
    };
};

Polygon.prototype.dynamicDraw = function (x, y, right_angle) {
    var temp_params = [].concat(this.params);

    if (right_angle) {
        var right_coords = this.right_angle(x, y);
        x = right_coords.x;
        y = right_coords.y;
    }

    temp_params.push(x, y);

    this.setCoords(temp_params);

    return temp_params;
};

Polygon.prototype.move = function (x, y) { //offset x and y
    var temp_params = Object.create(this.params);

    for (var i = 0, count = this.params.length; i < count; i++) {
        //i % 2 ? this.params[i] += y : this.params[i] += x;
        if (i % 2) {
            this.params[i] = Number(this.params[i]) + y;
        } else {
            this.params[i] = Number(this.params[i]) + x;
        }
    }

    return temp_params;
};

Polygon.prototype.pointMove = function (x, y) { //offset x and y
    this.params[2 * this.selected_point] += x;
    this.params[2 * this.selected_point + 1] += y;

    return this.params;
};

Polygon.prototype.dynamicEdit = function (temp_params) {
    this.setCoords(temp_params);

    return temp_params;
};

Polygon.prototype.remove = function () {
    this._map.removeNodeFromSvg(this.g);
};

Polygon.prototype.select = function () {
    //console.log("<POLYGON.SELECT>");
    utils.addClass(this.polygon, 'selected');

    return this;
};

Polygon.prototype.deselect = function () {
    //console.log("<POLYGON.DE-SELECT>");
    utils.removeClass(this.polygon, 'selected');

    return this;
};

Polygon.createFromSaved = function (params, is_overlay, self) {
    //console.log("<Polygon.createFromSaved>");
    //console.log("<Polygon.createFromSaved> is_overlay = " + is_overlay);

    var coords = params.coords,
        area = new Polygon(coords[0], coords[1], is_overlay, self);

    for (var i = 2, c = coords.length; i < c; i += 2) {
        area.addPoint(coords[i], coords[i + 1]);
    }

    area.polyline = area.polygon;
    area.polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    area.g.replaceChild(area.polygon, area.polyline);
    area.setCoords(area.params).deselect();
    delete(area.polyline);

    self.is_draw = false;
    self.drawing_poligon = null;

    return area;

};
