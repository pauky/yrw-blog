/**
 * @module life 生活
 */
var config = require("../conf/config");
var _ = require("underscore");
var async = require("async");
var moment = require('moment');
var Exception = require("../application/Exception");
var mongodbOperation = require("../application/mongodbOperation");
var View = require("../application/View");
var Promise = require('promise');
var article = require('../model/article');
var comment = require('../model/comment');
var accountUser = require('../model/accountUser');

/**
 * 生活杂记列表页
 * URL: `/`
 * Result (`jade`):
 * @param pageNum
 * @param pageSize
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.list = function (pageNum, pageSize, req, res) {
  pageNum = parseInt(pageNum) || 1;
  pageSize = parseInt(pageSize) || 20;
  return new Promise(function (resolve, reject) {
    async.auto({
      getArticles: function (callback) {
        var query = {type: 'life', status: 'online', onlineTime: {$lte: new Date()}};
        var options = {sort: {onlineTime: 'desc'}, skip: (pageNum -1) * pageSize, limit: pageSize};
        mongodbOperation.mongoQueryPage(article, query, 'title subtitle createTime hotScore order', options, callback)
      },
      getHotArticles: function (callback) {
        var options = {sort: {hotScore: 'desc'}, skip: 0, limit: 10};
        mongodbOperation.find(article, {type: 'life', status: 'online'}, 'order title', options, callback)
      }
    },
    function (err, results) {
      if (err) return reject(err);
      var _pageData = {
        articles: results.getArticles,
        hotArticles: results.getHotArticles,
        pageNum: pageNum,
        pageSize: pageSize
      };
      resolve(new View('page/life', _pageData));
    });
  });
}
