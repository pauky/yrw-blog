/**
 * @module wonderfulContent 精彩内容
 */
'use strict';
var config = require("../conf/config");
var _ = require("underscore");
var moment = require('moment');
var mongodbOperation = require("../application/mongodbOperation");
var article = require('../model/article');
var tag = require('../model/tag');
var accountUser = require('../model/accountUser');
var filter = require('../application/filter');
var View = require("../application/View");

/**
 * GET: /demo/data-view.html 数据视图
 * @param ctx
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.dataView = function *(ctx, req, res) {
  return new View('demo/data-view');
};
