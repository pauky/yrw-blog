/**
 * @module life 生活杂记
 */
'use strict';
var config = require("../conf/config");
var _ = require("underscore");
var moment = require('moment');
var mongodbOperation = require("../application/mongodbOperation");
var article = require('../model/article');
var comment = require('../model/comment');
var accountUser = require('../model/accountUser');
var filter = require('../application/filter');
var View = require("../application/View");

/**
 * GET: /life/:pageNum-:pageSize 生活杂记列表页
 * Result (`jade`):
 * @param pageNum
 * @param pageSize
 * @param req
 * @param res
 * @param ctx
 * @returns {*|exports|module.exports}
 */
exports.list = function *(pageNum, pageSize, req, res, ctx) {
  pageNum = parseInt(pageNum) || 1;
  pageSize = parseInt(pageSize) || 20;
  var query = {type: 'life', status: 'online'};
  var options = {sort: {onlineTime: 'desc'}, skip: (pageNum -1) * pageSize, limit: pageSize};
  var hotArtOptions = {sort: {hotScore: 'desc'}, skip: 0, limit: 10};
  var results = yield {
    getArticles: mongodbOperation.mongoQueryPage(article, query, 'title subtitle createTime hotScore order', options),
    getHotArticles: mongodbOperation.find(article, {type: 'tech', status: 'online'}, 'order title', hotArtOptions)
  };
  var _pageData = {
    articles: results.getArticles,
    hotArticles: results.getHotArticles,
    pageNum: pageNum,
    pageSize: pageSize
  };

  return new View('page/life', _pageData);

};
