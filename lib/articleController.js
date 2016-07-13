/**
 * @module article 文章
 */
'use strict';
var config = require("../conf/config");
var _ = require("underscore");
var exception = require("../application/Exception");
var article = require('../model/article');
var tag = require('../model/tag');
var accountUser = require('../model/accountUser');
var mongodbOperation = require("../application/mongodbOperation");
var moment = require('moment');
var logger = require('../logger').getLogger(module);
var View = require("../application/View");

/**
 * GET: /a/:pageNum-:pageSize 所有文章页面
 * @param pageNum
 * @param pageSize
 * @param ctx
 * @returns {*|exports|module.exports}
 */
exports.all = function *(pageNum, pageSize, ctx) {
  pageNum = parseInt(this.params.pageNum) || 1;
  pageSize = parseInt(this.params.pageSize) || 20;
  var query = {status: 'online'};
  var options = {sort: {onlineTime: 'desc'}, skip: (pageNum -1) * pageSize, limit: pageSize};
  var hotArtOptions = {sort: {hotScore: 'desc'}, skip: 0, limit: 10};
  var _pageData = yield {
    articles: mongodbOperation.mongoQueryPage(article, query, 'title subtitle createTime hotScore order', options),
    hotArticles: mongodbOperation.find(article, {status: 'online'}, 'order title', hotArtOptions)
  };
  _pageData.pageNum = pageNum;
  _pageData.pageSize = pageSize;
  return new View('page/all-articles', _pageData);
};

/**
 * GET: a/:order.html 文章详细页
 * @param order
 * @param ctx
 * @returns {*|exports|module.exports}
 */
exports.detail = function *(order, ctx) {
  var articleQuery = {order: order, status: 'online'};
  var currentArticle = null;
  if (this.state.userAgent.isBot) {
    currentArticle = yield mongodbOperation.findOne(article, articleQuery);
  } else {
    currentArticle = yield mongodbOperation.findOneAndUpdate(article, articleQuery, {$inc: {hotScore: 1}}, {new: true});
  }
  if (!currentArticle) return exception.throwException('NotFound');

  var results = yield {
    getAuthor: mongodbOperation.findOne(accountUser, {_id: currentArticle.author, status: 'online'}, '_id name'),
    getTags: mongodbOperation.find(tag, {_id: {$in: currentArticle.tags}}, '_id name enName'),
    // 上一篇文章
    getPreArt: mongodbOperation.find(article, {createTime: {$lt: currentArticle.createTime}, status: 'online'}, '_id order title', {skip: 0, limit: 1, sort: {createTime: 'desc'}}),
    // 下一篇文章
    getNextArt: mongodbOperation.find(article, {createTime: {$gt: currentArticle.createTime}, status: 'online'}, '_id order title', {skip: 0, limit: 1, sort: {createTime: 'asc'}})
  };
  var ar = currentArticle.toJSON();
  ar.authorInfo = results.getAuthor && results.getAuthor.toJSON();
  ar.tagInfo = results.getTags;
  var _pageData = {
    article: ar,
    preArticle: results.getPreArt && results.getPreArt[0],
    nextArticle: results.getNextArt && results.getNextArt[0]
  };

  return new View('page/article', _pageData);
};