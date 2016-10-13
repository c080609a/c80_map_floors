
/* Helper constructor */
function Helper(node, x, y) {
    this.helper = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.helper.setAttribute('class', 'helper');
    this.helper.setAttribute('height', 5);
    this.helper.setAttribute('width', 5);
    this.helper.setAttribute('x', x - 3);
    this.helper.setAttribute('y', y - 3);
    node.appendChild(this.helper);
}

Helper.prototype.setCoords = function (x, y) {
    this.helper.setAttribute('x', x - 3);
    this.helper.setAttribute('y', y - 3);

    return this;
};

Helper.prototype.setAction = function (action) {
    this.helper.action = action;

    return this;
};

Helper.prototype.setCursor = function (cursor) {
    utils.addClass(this.helper, cursor);

    return this;
};

Helper.prototype.setId = function (id) {
    this.helper.n = id;

    return this;
};
