/**
 * @module search 搜索
 */
'use strict';
var article = require('../model/article');
var tag = require('../model/tag');
var mongodbOperation = require("../application/mongodbOperation");
var _ = require('underscore');
var View = require("../application/View");

/**
 * GET: /search/:keyword/:pageNum/:pageSize 搜索页面
 * @param keyword 关键字
 * @param pageNum 页码
 * @param pageSize 每页显示数量
 * @param req
 * @param res
 * @param ctx
 * @returns {*|exports|module.exports}
 */
exports.search = function *(keyword, pageNum, pageSize, req, res, ctx) {
  pageNum = parseInt(pageNum) || 1;
  pageSize = parseInt(pageSize) || 20;
  var originKeyword = keyword;
  if(keyword) keyword = new RegExp(keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi');
  var options ;
  options = {skip: (pageNum - 1 ) * pageSize, limit: pageSize};
  options.sort = {onlineTime: 'desc'};

  var getArticles = yield searchArticle(keyword, options);

  var _pageData = {
    articles: getArticles,
    keyword: originKeyword,
    pageNum: pageNum,
    pageSize: pageSize
  };

  if(req.xhr) {
    // 异步请求
    return new View('partials/search', _pageData);
  } else {
    return new View('page/search', _pageData);
  }

};

/**
 * 搜索文章公共方法
 * @param keyword
 * @param options
 * @returns {json}
 */
var searchArticle = function *(keyword,  options) {
  var results = [];
  var query = {status: 'online', onlineTime: {$lte: new Date()}, rssId: null};
  if (keyword) {
    query['$or'] = [{title: {$regex: keyword}}, {subtitle: {$regex: keyword}}, {contentMd: {$regex: keyword}}];
  }
  results.getArticles = yield mongodbOperation.mongoQueryPage(article, query, 'title subtitle tags createTime order hotScore', options);
  if (results.getArticles.total === 0) return [];
  var tagIds = [];
  _.each(results.getArticles.data, function (ar) {
    tagIds = _.union(tagIds, ar.tags)
  });
  results.getArticleTags = yield mongodbOperation.find(tag, {_id: {$in: tagIds}, deleted: false});
  _.each(results.getArticles.data, function (ar, index) {
    ar = ar.toJSON();
    ar.tags = _.filter(results.getArticleTags, function (tag) {
      return _.contains(ar.tags, tag._id.toString())
    });
    results.getArticles.data[index] = ar;
  });
  return results.getArticles;
};