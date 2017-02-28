
var utils = {

    // выдать из массива arr элемент с указанным id
    getById: function (id,arr) {
        var i;
        var iel;
        for (i=0; i<arr.length; i++) {
            iel = arr[i];
            if (iel == undefined) continue;
            if (iel.hasOwnProperty('id') && iel['id'] == id) {
                return iel;
            }
        }
        return null;
    },

    deleteById: function (id, arr) {
        var i, iel;
        var len = arr.length;
        for (i = len - 1; i >= 0; i--) {
            iel = arr[i];
            if (iel == undefined) continue;
            if (iel.hasOwnProperty('id') && iel['id'] == id) {
                console.log('<deleteById> deleted: id = ' + iel['id']);
                delete arr[i];
                break;
            }
        }
    },

    offsetX: function (node) {
        var box = node.getBoundingClientRect(),
            scroll = window.pageXOffset;

        return Math.round(box.left + scroll);
    },
    offsetY: function (node) {
        var box = node.getBoundingClientRect(),
            scroll = window.pageYOffset;

        return Math.round(box.top + scroll);
    },

    trim: function (str) {
        return str.replace(/^\s+|\s+$/g, '');
    },
    id: function (str) {
        return document.getElementById(str);
    },
    hide: function (node) {
        node.style.display = 'none';

        return this;
    },
    show: function (node) {
        node.style.display = 'block';

        return this;
    },
    encode: function (str) {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    decode: function (str) {
        return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    },
    foreach: function (arr, func) {
        for (var i = 0, count = arr.length; i < count; i++) {
            func(arr[i], i);
        }
    },
    foreachReverse: function (arr, func) {
        for (var i = arr.length - 1; i >= 0; i--) {
            func(arr[i], i);
        }
    },
    debug: (function () {
        var output = document.getElementById('debug');
        return function () {
            output.innerHTML = [].join.call(arguments, ' ');
        }
    })(),
    stopEvent: function (e) {
        e.stopPropagation();
        e.preventDefault();

        return this;
    },
    addClass: function (node, str) {
        // node.className.baseVal for SVG-elements
        // or
        // node.className for HTML-elements
        var is_svg = node.className.baseVal !== undefined ? true : false,
            arr = is_svg ? node.className.baseVal.split(' ') : node.className.split(' '),
            isset = false;

        utils.foreach(arr, function (x) {
            if (x === str) {
                isset = true;
            }
        });

        if (!isset) {
            arr.push(str);
            is_svg ? node.className.baseVal = arr.join(' ') : node.className = arr.join(' ');
        }

        return this;
    },
    removeClass: function (node, str) {
        var is_svg = node.className.baseVal !== undefined ? true : false,
            arr = is_svg ? node.className.baseVal.split(' ') : node.className.split(' '),
            isset = false;

        utils.foreach(arr, function (x, i) {
            if (x === str) {
                isset = true;
                arr.splice(i--, 1);
            }
        });

        if (isset) {
            is_svg ? node.className.baseVal = arr.join(' ') : node.className = arr.join(' ');
        }

        return this;
    },
    hasClass: function (node, str) {
        var is_svg = node.className.baseVal !== undefined ? true : false,
            arr = is_svg ? node.className.baseVal.split(' ') : node.className.split(' '),
            isset = false;

        utils.foreach(arr, function (x) {
            if (x === str) {
                isset = true;
            }
        });

        return isset;
    },
    extend: function (obj, options) {
        var target = {};

        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                target[name] = options[name] ? options[name] : obj[name];
            }
        }

        return target;
    },
    supportFileReader: (function () {
        return (typeof FileReader !== 'undefined');
    })()
};