"use strict";

// именно эта кнопка контролирует переходы между состояниями приложения:
// - viewing, editing;
// - view_building, edit_building;
// - view_area, edit_area;
// - view_floor, edit_floor

function EditButton() {

    var _map = null;
    var _this = this;
    _this.state = 'init'; // editing / viewing
    _this.el = null;

    // если true - значит кнопка имеется на странице и код в методах будет исполняться
    var mark_button_present = false;

    /** Изменить состояние кнопки.
     *
     * @param {string} state
     * @param {boolean} [mark_change_only_inner_state]
     *
     * NOTE:: Клик по этой кнопке изменит состояние этой кнопки и поменяет режим приложения.
     *
     * Также: приложение меняет состояние этой кнопки,
     * когда входим в здание\площадь (вот тут [a1x7]),
     * и чтобы не происходило бесконечного зацикленного вызова,
     * вводится флаг mark_change_only_inner_state.
     *
     * http://usejsdoc.org/tags-param.html
     *
     */
    this.setState = function (state, mark_change_only_inner_state) {
        if (!mark_button_present) return;

        if (mark_change_only_inner_state == undefined) {
            mark_change_only_inner_state = false;
        }
        console.log("<EditButton.setState> Кнопка EDIT перешла в состояние state = " + state);

        //<editor-fold desc="//Впишем режим в cssClass кнопки">
        // NOTE: этот код коррелирует с [x9cs7]. Возможно, нужен рефакторинг, но на него нет времени сейчас.
        _this.state = state;
        _this.el.removeClass('editing');
        _this.el.removeClass('viewing');
        _this.el.removeClass('removing');
        _this.el.removeClass('view_building');
        _this.el.removeClass('edit_building');
        _this.el.removeClass('view_area');
        _this.el.removeClass('edit_area');
        _this.el.removeClass('eb_view_floor');
        _this.el.removeClass('eb_edit_floor');
        _this.el.addClass(state);
        //</editor-fold>

        // NOTE:: изменим режим приложения
        if (!mark_change_only_inner_state) {
            var s = state.split('eb_').join('');
            _map.setMode(s);
        }

    };

    // слушаем клики по кнопке (внутренняя state машина)
    this.onClick = function (e) {
        e.preventDefault();

        // если после исполнения switch..case эта перменная будет true - значит надо будет вызвать кое-какой код
        var mark_restore_svg_overlay = false;

        switch (_this.state) {
            case 'editing':
                _this.setState('viewing');
                break;

            case 'viewing':
                _this.setState('editing');
                break;

            case 'view_building':
                _this.setState('edit_building');
                break;

            // находились в режиме редактирования здания, и перешли в режим просмотра здания
            case 'edit_building':
                _this.setState('view_building');
                mark_restore_svg_overlay = true;
                break;

            case 'view_area':
                _this.setState('edit_area');
                // спрячем от клика мышки все полигоны из svg_overlay, кроме редактируемого полигона
                MapUtils.svgOverlayHideAllExcept(_map.last_clicked_g);
                break;

            // находились в режиме редактирования площади, и перешли в режим просмотра площади
            case 'edit_area':
                _this.setState('view_area');
                mark_restore_svg_overlay = true;
                break;

            case 'eb_view_floor':
                _this.setState('eb_edit_floor');
                mark_restore_svg_overlay = true;
                break;

            case 'eb_edit_floor':
                _this.setState('eb_view_floor');
                break;

        }

        // покажем для клика мышкой все полигоны из svg_overlay
        if (mark_restore_svg_overlay) {
            MapUtils.svgOverlayRestore(_map.last_clicked_g);
            _map.last_clicked_g = null;
        }

    };

    this.init = function (button_css_selector, link_to_map) {
        _map = link_to_map;
        _this.el = $(button_css_selector);

        if (_this.el.length) {
            mark_button_present = true;
            _this.state = _map.mode;
            _this.el.addClass(_map.mode);
            _this.el.on('click', this.onClick);
        }

        //console.log('button_edit.js: init: for breakpoint: ' + _this.el.length);
    };

}