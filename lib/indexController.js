/**
 * @module index 首页
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
var accountUser = require('../model/accountUser');

/**
 * 首页
 * URL: `/`
 * Result (`jade`):
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.index = function (req, res) {
  return new Promise(function (resolve, reject) {
    async.auto({
      getArticles: function (callback) {
        var query = {status: 'online', onlineTime: {$lte: new Date()}};
        var options = {sort: {onlineTime: 'desc'}, skip: 0, limit: 20};
        mongodbOperation.mongoQueryPage(article, query, 'title subtitle createTime hotScore order', options, callback)
      },
      getHotArticles: function (callback) {
        var options = {sort: {hotScore: 'desc'}, skip: 0, limit: 10};
        mongodbOperation.find(article, {status: 'online'}, 'title order', options, callback)
      }
    },
    function (err, results) {
      if (err) return reject(err);
      var _pageData = {
        articles: results.getArticles,
        hotArticles: results.getHotArticles
      };
      resolve(new View('page/index', _pageData));
    });
  });
}

/**
 * 测试页面
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
//exports.test = function (req, res) {
//  return new Promise(function (resolve, reject) {
//      resolve(new View('page/test'));
//  });
//};