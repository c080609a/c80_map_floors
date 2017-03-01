/**
 * Для выравнивания картинок необходима возможность выставлять масштаб равный "1".
 * Для этого реализую js класс, который слушает клавиатуру, и может дать ответ на
 * вопрос "нажата ли кнопка ctrl" сейчас.
 *
 * Может пригодиться ссылка: https://gist.github.com/c80609a/d897edaaaec7ff237d167aa1a29d0ecf
 *
 * @constructor
 */
function KeyBoardListener() {

    //-[ PRIVATE ]------------------------------------------------------------------------------------------------------

    // пока отслеживаем только одну клавишу - ctrl
    var _ctrl_key_is_pressed_right_now = false;

    var _fInit = function () {
        $(document).keydown(_fKeyDown);
        $(document).keyup(_fKeyUp);
    }

    var _fKeyDown = function(e) {
        //console.log('<KeyBoardListener._fKeyDown> e.keyCode = ' + e.keyCode);
        if (e.keyCode == 17) { // ctrl
            _ctrl_key_is_pressed_right_now = true;
        }
    };

    var _fKeyUp = function(e) {
        //console.log('<KeyBoardListener._fKeyUp> e.keyCode = ' + e.keyCode);
        if (e.keyCode == 17) { // ctrl
            _ctrl_key_is_pressed_right_now = false;
        }
    }

    //-[ PUBLIC ]-------------------------------------------------------------------------------------------------------

    /**
     * Выдать наружу информацию о том, зажата ли кнопка ctrl прямо сейчас
     * @returns {boolean}
     */
    this.is_ctrl = function() {
        return _ctrl_key_is_pressed_right_now;
    }

    //-[ RUN ]----------------------------------------------------------------------------------------------------------

    _fInit();

}

var keyboard_listener = new KeyBoardListener();