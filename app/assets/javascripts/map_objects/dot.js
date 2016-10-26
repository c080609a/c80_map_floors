
function Dot() {

    var _this = this;
    var _options = null;
    var _polygon = null;

    _this.init = function (options,pself) {
        //console.log('<Dot.init>');
        _options = options;
        _polygon = Polygon.createFromSaved(options, false, pself);
    }

}
