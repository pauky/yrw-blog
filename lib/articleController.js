/**
 * @module article 文章
 */

var config = require("../conf/config");
var _ = require("underscore");
var async = require("async");
var Exception = require("../application/Exception");
var View = require("../application/View");
var Promise = require('promise');
var article = require('../model/article');
var tag = require('../model/tag');
var comment = require('../model/comment');
var accountUser = require('../model/accountUser');
var adminUser = require('../model/adminUser');
var mongodbOperation = require("../application/mongodbOperation");
var moment = require('moment');
var errorController = require('./errorController');


/**
 *  文章详细页
 * URL: `/article/54aa0b912b4fc6202e6ec182.html`
 * @param order
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.detail = function (order, req, res) {
    return new Promise(function (resolve, reject) {
        var articleQuery = {order: order, status: 'online'};
        if(req.useragent.isBot){//爬虫不增加热度
            mongodbOperation.findOne(article, articleQuery, checkToJump);
        } else {
            mongodbOperation.findOneAndUpdate(article, articleQuery, {$inc: {hotScore: 1}}, {new: true}, checkToJump);
        }
        function checkToJump(checkError, currentArticle){
            if (checkError) return reject(checkError);
            if (!currentArticle) {
                return errorController.error404Callback(req, res, resolve);
            }
            async.auto({
                getAuthor: function(callback, results){
                    var userId = currentArticle.author;
                    mongodbOperation.findOne(accountUser, {_id: userId, status: 'online'}, '_id name', callback);
                },
                getTags: function (callback, results) {
                    mongodbOperation.find(tag, {_id: {$in: currentArticle.tags}}, '_id name enName', callback);
                },
                // 上一篇文章
                getPreArt: function (callback) {
                    mongodbOperation.find(article, {createTime: {$lt: currentArticle.createTime}, status: 'online'}, '_id order title', {skip: 0, limit: 1, sort: {createTime: 'desc'}}, callback);
                },
                // 下一篇文章
                getNextArt: function (callback) {
                    mongodbOperation.find(article, {createTime: {$gt: currentArticle.createTime}, status: 'online'}, '_id order title', {skip: 0, limit: 1, sort: {createTime: 'asc'}}, callback);
                }
            }, function(err, results){
                if(err) return reject(err);
                var ar = currentArticle.toJSON();
                ar.authorInfo = results.getAuthor && results.getAuthor.toJSON();
                ar.tagInfo = results.getTags;
                var _pageData = {
                    article: ar,
                    preArticle: results.getPreArt && results.getPreArt[0],
                    nextArticle: results.getNextArt && results.getNextArt[0]
                };
                resolve(new View('page/article', _pageData))
            })
        }
    });
};

/**
 * 获取所有文章
 * GET /a(?:\/:pageNum(\\d+)-:pageSize(\\d+))?
 * @param pageNum
 * @param pageSize
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.all = function (pageNum, pageSize, req, res) {
    pageNum = parseInt(pageNum) || 1;
    pageSize = parseInt(pageSize) || 20;
    return new Promise(function (resolve, reject) {
        async.auto({
              getArticles: function (callback) {
                  var query = {status: 'online'};
                  var options = {sort: {onlineTime: 'desc'}, skip: (pageNum -1) * pageSize, limit: pageSize};
                  mongodbOperation.mongoQueryPage(article, query, 'title subtitle createTime hotScore order', options, callback)
              },
              getHotArticles: function (callback) {
                  var options = {sort: {hotScore: 'desc'}, skip: 0, limit: 10};
                  mongodbOperation.find(article, {status: 'online'}, 'order title', options, callback)
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
              //resolve(_pageData);
              resolve(new View('page/all-articles', _pageData));
          });
    });
}
