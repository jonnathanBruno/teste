/**
 * cordova Web Intent plugin
 * Copyright (c) Boris Smus 2010
 *
 */
cordova.define("cordova/plugin/webintent",
  function(require, exports, module) {
    var exec = require("cordova/exec");
    var WebIntent = function() {};

    WebIntent.prototype.ACTION_SEND = "android.intent.action.SEND";
    WebIntent.prototype.ACTION_VIEW= "android.intent.action.VIEW";
    WebIntent.prototype.EXTRA_TEXT = "android.intent.extra.TEXT";
    WebIntent.prototype.EXTRA_SUBJECT = "android.intent.extra.SUBJECT";
    WebIntent.prototype.EXTRA_STREAM = "android.intent.extra.STREAM";
    WebIntent.prototype.EXTRA_EMAIL = "android.intent.extra.EMAIL";

    WebIntent.prototype.startActivity = function(params, success, fail) {
        return cordova.exec(function(args) {
            success(args);
        }, function(args) {
            fail(args);
        }, 'WebIntent', 'startActivity', [params]);
    };

    WebIntent.prototype.hasExtra = function(params, success, fail) {
        return cordova.exec(function(args) {
            success(args);
        }, function(args) {
            fail(args);
        }, 'WebIntent', 'hasExtra', [params]);
    };

    WebIntent.prototype.getUri = function(success, fail) {
        return cordova.exec(function(args) {
            success(args);
        }, function(args) {
            fail(args);
        }, 'WebIntent', 'getUri', []);
    };

    WebIntent.prototype.getExtra = function(params, success, fail) {
        return cordova.exec(function(args) {
            success(args);
        }, function(args) {
            fail(args);
        }, 'WebIntent', 'getExtra', [params]);
    };


    WebIntent.prototype.onNewIntent = function(callback) {
        return cordova.exec(function(args) {
            callback(args);
        }, function(args) {
        }, 'WebIntent', 'onNewIntent', []);
    };

    WebIntent.prototype.sendBroadcast = function(params, success, fail) {
        return cordova.exec(function(args) {
            success(args);
        }, function(args) {
            fail(args);
        }, 'WebIntent', 'sendBroadcast', [params]);
    };

    var webintent = new WebIntent();
    module.exports = webintent;

});

if (!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.webintent) {
    window.plugins.webintent = cordova.require("cordova/plugin/webintent");
}