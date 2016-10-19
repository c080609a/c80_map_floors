"use strict";

// Zoom Buttons
function ZoomButtons() {

    var self = this;
    var _map = null;
    this.el = null;

    this.init = function (options, link_to_map) {
        var mt = options["height"] - 10;
        _map = link_to_map;

        //var div_container = $('<div></div>')
        //    .addClass("container")
        //    .attr("id",'container_buttons')
        //    .appendTo(_map.container)
        //    .css('margin-top',mt+"px");
        var div_container = $("#container_buttons");
        div_container.css('margin-top', mt + "px");

        //this.el = $('<div></div>').addClass('mzoom_buttons').appendTo(div_container);
        this.el = $('.mzoom_buttons');

        this.zoomin = $('<a></a>').attr('href', '#').addClass('mapplic-zoomin-button').appendTo(this.el);

        this.zoomin.on('click touchstart', function (e) {
            e.preventDefault();

            var scale = _map.normalizeScale(_map.scale + 0.2);
            //_map.scale = _map.normalizeScale(scale + .2);

            //_map.x = _map.normalizeX(_map.x - (_map.container.width() / 2 - _map.x) * (_map.scale / scale - 1));
            //_map.y = _map.normalizeY(_map.y - (_map.container.height() / 2 - _map.y) * (_map.scale / scale - 1));

            self.__execute_zoom(scale);

        });

        this.zoomout = $('<a></a>').attr('href', '#').addClass('mapplic-zoomout-button').appendTo(this.el);

        this.zoomout.on('click touchstart', function (e) {
            e.preventDefault();

            var scale = _map.normalizeScale(_map.scale - .2);
            //_map.scale = _map.normalizeScale(scale - .2);

            //_map.x = _map.normalizeX(_map.x - (_map.container.width() / 2 - _map.x) * (_map.scale / scale - 1));
            //_map.y = _map.normalizeY(_map.y - (_map.container.height() / 2 - _map.y) * (_map.scale / scale - 1));

            self.__execute_zoom(scale);

        });
    };

    self.__execute_zoom = function (scale) {
        var x = _map.normalizeX({
            x: _map.x - (_map.container.width() / 2 - _map.x) * (scale / _map.scale - 1),
            scale: scale
        });

        var y = _map.normalizeY({
            y: _map.y - (_map.container.width() / 2 - _map.y) * (scale / _map.scale - 1),
            scale: scale
        });

        _map.moveTo(x, y, scale, 400, 'easeInOutCubic');
        _map.mark_virgin = false;
    };

    this.update = function (scale) {
        this.zoomin.removeClass('mapplic-disabled');
        this.zoomout.removeClass('mapplic-disabled');
        if (scale == _map.o.fitscale) this.zoomout.addClass('mapplic-disabled');
        else if (scale == _map.o.maxscale) this.zoomin.addClass('mapplic-disabled');
    };

}
