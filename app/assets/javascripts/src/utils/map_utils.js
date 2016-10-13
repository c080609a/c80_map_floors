var MapUtils = {

    svgOverlayHideAllExcept: function ($g) {
        if ($g != null) {
            console.log("<MapUtils.svgOverlayHideAllExcept>");

            // убираем у всех g из svg_overlay класс viewing_area
            $g.parent().find('g').css('display','none');

            // а редактируемому полигону добавим класс viewing_area
            $g.css('display','block');
        }

    },

    svgOverlayRestore: function ($g) {
        if ($g != null) {
            console.log("<MapUtils.svgOverlayRestore>");
            $g.parent().find('g').css('display','block');
        }
    }

};