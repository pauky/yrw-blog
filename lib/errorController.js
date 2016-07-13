/**
 * @module error 错误
 */
var config = require("../conf/config");
var _ = require("underscore");
var async = require("async");
var Exception = require("../application/Exception");
var mongodbOperation = require("../application/mongodbOperation");
var View = require("../application/View");
var Promise = require('promise');
var article = require('../model/article');
var moment = require('moment');
var comment = require('../model/comment');
var accountUser = require('../model/accountUser');
var logger = require('../logger').getLogger(module);

// 404
exports.error404 = function (req, res) {
    return new Promise(function (resolve, reject) {
        exports.error404Callback(req, res, resolve);
    });
};

exports.error404Callback = function (req, res, callback) {
    res.status(404);
    callback(new View('page/404'));
};

// 500
exports.error500 = function (req, res) {
    return new Promise(function (resolve, reject) {
        exports.error500Callback(req, res, resolve);
    });
};

exports.error500Callback = function (req, res, callback) {
    res.status(500);
    callback(new View('page/500'));
};

// 浏览器版本过低提示
//exports.browserWarn = function (req, res) {
//    return new Promise(function(resolve, reject) {
//        resolve(new View('browser-warn'));
//    });
//};