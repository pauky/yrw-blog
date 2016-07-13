/**
 * @module tag 标签
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


/**
 * 标签详细页
 * URL: `/tag/enName`
 * @param enName
 * @param pageNum
 * @parma pageSize
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.detail = function (enName, pageNum, pageSize, req, res) {
    return new Promise(function (resolve, reject) {
        async.auto({
            getTag: function(callback){
                if(req.useragent.isBot){//爬虫不增加热度
                    mongodbOperation.findOne(tag, {enName: enName}, callback);
                } else {
                    mongodbOperation.findOneAndUpdate(tag, {enName: enName, deleted: false}, {$inc: {hotScore: 1}}, {new: true}, callback);
                }
            },
            getArticles: ['getTag', function(callback, results){
                var tagId = results.getTag._id;
                var options = {sort: {onlineTime: 'desc'}, skip: (pageNum -1) * pageSize, limit: pageSize};
                mongodbOperation.mongoQueryPage(article, {tags: tagId, status: 'online'}, 'title subtitle createTime hotScore order', options, callback);
            }],
            getHotTags: ['getTag', function (callback) {
                mongodbOperation.find(tag, {deleted: false}, 'name enName', {sort: {hotScore: 'desc'}, skip: 0, limit: 10}, callback);
            }]
        }, function(err, results){
            if(err) return reject(err);
            var _pageData = {
                articles: results.getArticles,
                tag: results.getTag,
                hotTags: results.getHotTags
            };
            resolve(new View('page/tag', _pageData));
        })
    });
};
