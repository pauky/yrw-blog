/**
 * @module search 搜索
 */
var article = require('../model/article');
var tag = require('../model/tag');
var Promise = require('promise');
var mongodbOperation = require("../application/mongodbOperation");
var async = require('async');
var _ = require('underscore');
var View = require("../application/View");
var errorController = require('./errorController');

/**
 * 搜索(同步与异步)
 * @param keyword
 * @param pageNum
 * @param pageSize
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.search = function (keyword, pageNum, pageSize, req, res) {
    pageNum = parseInt(pageNum) || 1;
    pageSize = parseInt(pageSize) || 20;
    var originKeyword = keyword;
    if(keyword) keyword = new RegExp(keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi');
    return new Promise(function (resolve, reject) {
        async.auto({
            getArticles: function (callback) {
                var options ;
                options = {skip: (pageNum - 1 ) * pageSize, limit: pageSize};
                options.sort = {onlineTime: 'desc'};
                searchArticle(keyword, options).then(function (data) {
                    callback(null, data);
                }, function (err) {
                    callback(err);
                })
            }
        },
        function (err, results) {
            if (err) return reject(err);
            var _pageData = {
                articles: results.getArticles,
                keyword: originKeyword,
                pageNum: pageNum,
                pageSize: pageSize
            };
            //resolve(_pageData);
            if(req.xhr) {
                resolve(new View('partials/search', _pageData));
            } else {
                resolve(new View('page/search', _pageData));
            }
        });
    });
};

/**
 * 搜索文章公共方法
 * @param keyword
 * @param options
 * @returns {*|exports|module.exports}
 */
var searchArticle = function (keyword,  options) {
    return new Promise(function (resolve, reject) {
        async.auto({
                getArticles: function (callback) {//获取所有包含这个人物标签的文章
                    var query = {status: 'online', onlineTime: {$lte: new Date()}, rssId: null};
                    if (keyword) {
                        query['$or'] = [{title: {$regex: keyword}}, {subtitle: {$regex: keyword}}, {contentMd: {$regex: keyword}}];
                    }
                    mongodbOperation.mongoQueryPage(article, query, 'title subtitle tags createTime order hotScore', options, callback)
                },
                getArticleTags: ['getArticles', function (callback, results) {
                    if (_.size(results.getArticles.data) == 0) return callback(null, []);
                    var tagIds = [];
                    _.each(results.getArticles.data, function (ar) {
                        tagIds = _.union(tagIds, ar.tags)
                    });
                    mongodbOperation.find(tag, {_id: {$in: tagIds}, deleted: false}, callback);
                }]
            },
            function (err, results) {
                if (err) return reject(err);
                _.each(results.getArticles.data, function (ar, index) {
                    ar = ar.toJSON();
                    ar.tags = _.filter(results.getArticleTags, function (tag) {
                        return _.contains(ar.tags, tag._id.toString())
                    });
                    results.getArticles.data[index] = ar;
                });
                resolve(results.getArticles);
            });
    });
};
