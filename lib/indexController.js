/**
 * @module index 首页
 */
'use strict';
var config = require('../conf/config');
var mongodbOperation = require("../application/mongodbOperation");
var exception = require("../application/Exception");
var article = require('../model/article');
var friendLink = require('../model/friendLink').model;
var co = require('co');
var View = require("../application/View");

/**
 * GET: / 首页
 * @param ctx 上下文
 * @param req
 * @param res
 * @param next
 * @returns {*|exports|module.exports}
 */
exports.index = function *(ctx, req, res, next) {
  let artQuery = {status: 'online', onlineTime: {$lte: new Date()}};
  let artOptions = {sort: {onlineTime: 'desc'}, skip: 0, limit: 20};
  let hotArtOptions = {sort: {hotScore: 'desc'}, skip: 0, limit: 10};
  let _pageData = yield {
    articles: mongodbOperation.mongoQueryPage(article, artQuery, 'title subtitle createTime hotScore order', artOptions),
    hotArticles: mongodbOperation.find(article, {status: 'online'}, 'title order', hotArtOptions),
    friendLinks: mongodbOperation.find(friendLink, {status: 'online'}, 'name link')
  };
  return new View('page/index', _pageData);
};