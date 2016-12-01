"use strict";

// StackOverflow: How to get object length
// http://stackoverflow.com/a/24457767/4209080

//noinspection JSUnusedGlobalSymbols
var fCalcObjSize = function (obj) {
    var count = 0;

    if (typeof obj == "object") {

        if (Object.keys) {
            count = Object.keys(obj).length;
        } else {
            //noinspection JSUnresolvedVariable
            if (window._) {
                //noinspection JSUnresolvedVariable
                count = _.keys(obj).length;
            } else if (window.$) {
                count = $.map(obj, function () {
                    return 1;
                }).length;
            } else {
                for (var key in obj) if (obj.hasOwnProperty(key)) count++;
            }
        }

    }

    return count;
};