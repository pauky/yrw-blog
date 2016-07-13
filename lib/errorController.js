/**
 * @module error 错误页面
 */
'use strict';
var config = require("../conf/config");
var _ = require("underscore");
var mongodbOperation = require("../application/mongodbOperation");
var View = require("../application/View");
var exception = require("../application/Exception");
var article = require('../model/article');
var moment = require('moment');
var comment = require('../model/comment');
var accountUser = require('../model/accountUser');
var logger = require('../logger').getLogger(module);

// 404
exports.error404 = function *(req, res) {
  //return exception.throwException('NoPermission', {msg: '[id] is required'});
  return exports.error404Callback.call(this);
};

exports.error404Callback = function () {
  this.status = 404;
  return new View('page/404');
};

// 500
exports.error500 = function *(req, res) {
  return exports.error500Callback.call(this);
};

exports.error500Callback = function () {
  this.status = 500;
  return new View('page/500');
};

// 浏览器版本过低提示
//exports.browserWarn = function (req, res) {
//    return new Promise(function(resolve, reject) {
//        resolve(new View('browser-warn'));
//    });
//};