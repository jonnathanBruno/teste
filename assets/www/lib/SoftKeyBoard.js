cordova.define("cordova/plugin/softkeyboard",
  function(require, exports, module) {
    var exec = require("cordova/exec"); 
    function SoftKeyBoard() {}

    SoftKeyBoard.prototype.show = function(win, fail) {
        return exec(
                function (args) { if(win !== undefined) { win(args); } },
                function (args) { if(fail !== undefined) { fail(args); } },
                "SoftKeyBoard", "show", []);
    };

    SoftKeyBoard.prototype.hide = function(win, fail) {
        return exec(
                function (args) { if(win !== undefined) { win(args); } },
                function (args) { if(fail !== undefined) { fail(args); } },
                "SoftKeyBoard", "hide", []);
    };

    SoftKeyBoard.prototype.isShowing = function(win, fail) {
        return exec(
                function (args) { if(win !== undefined) { win(args); } },
                function (args) { if(fail !== undefined) { fail(args); } },
                "SoftKeyBoard", "isShowing", []);
    };
 
    var softkeyboard = new SoftKeyBoard();
    module.exports = softkeyboard;
});
 
if (!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.softkeyboard) {
    window.plugins.softkeyboard = cordova.require("cordova/plugin/softkeyboard");
}

// (function( cordova ) {

//     var exec = require('cordova/exec');
//     function SoftKeyBoard() {}
//     SoftKeyBoard.prototype.show = function(win, fail) {
//         return exec(
//                 function (args) { if(win !== undefined) { win(args); } },
//                 function (args) { if(fail !== undefined) { fail(args); } },
//                 "SoftKeyBoard", "show", []);
//     };

//     SoftKeyBoard.prototype.hide = function(win, fail) {
//         return exec(
//                 function (args) { if(win !== undefined) { win(args); } },
//                 function (args) { if(fail !== undefined) { fail(args); } },
//                 "SoftKeyBoard", "hide", []);
//     };

//     SoftKeyBoard.prototype.isShowing = function(win, fail) {
//         return exec(
//                 function (args) { if(win !== undefined) { win(args); } },
//                 function (args) { if(fail !== undefined) { fail(args); } },
//                 "SoftKeyBoard", "isShowing", []);
//     };

//     if(!window.plugins) {
//         window.plugins = {};
//     }

//     if (!window.plugins.SoftKeyBoard) {
//         console.log('Criando plugin..');
//         window.plugins.SoftKeyBoard = new SoftKeyBoard();
//         console.log(window.plugins.SoftKeyBoard.isShowing());
//     }

// })( window.cordova );