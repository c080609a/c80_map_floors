function SavePreloader() {

    var _this = this;
    var $el;

    _this.init = function () {
        $el = $("#savePreloader");
    };

    _this.show = function () {
        $el.css("display","block");
        $el.addClass('shown');
    };

    _this.hide = function () {
        $el.removeClass('shown');
        setTimeout(function () {
            $el.css("display","none");
        },500);
    };

    _this.toggle = function () {
        if ($el.hasClass('shown')) {
            _this.hide();
        } else {
            _this.show();
        }
    };

}