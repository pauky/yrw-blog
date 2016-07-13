/**
 * @module tag 标签
 */
'use strict';
var config = require("../conf/config");
var _ = require("underscore");
var article = require('../model/article');
var tag = require('../model/tag');
var comment = require('../model/comment');
var accountUser = require('../model/accountUser');
var adminUser = require('../model/adminUser');
var ObjectId = require('mongoose').Types.ObjectId;
var mongodbOperation = require("../application/mongodbOperation");
var moment = require('moment');
var logger = require('../logger').getLogger(module);
var View = require("../application/View");


/**
 * GET: /tag/:enName/:pageNum-:pageSize 标签详细页
 * @param enName
 * @param pageNum
 * @param pageSize
 * @param req
 * @param res
 * @param ctx
 * @returns {*|exports|module.exports}
 */
exports.detail = function *(enName, pageNum, pageSize, req, res, ctx) {
  let getTag = null;
  if(ctx.state.userAgent.isBot){//爬虫不增加热度
    getTag = yield mongodbOperation.findOne(tag, {enName: enName});
  } else {
    getTag = yield mongodbOperation.findOneAndUpdate(tag, {enName: enName, deleted: false}, {$inc: {hotScore: 1}}, {new: true});
  }

  var results = yield {
    getArticles: function *(){
      var tagId = getTag._id;
      var options = {sort: {onlineTime: 'desc'}, skip: (pageNum -1) * pageSize, limit: pageSize};
      return yield mongodbOperation.mongoQueryPage(article, {tags: tagId, status: 'online'}, 'title subtitle createTime hotScore order', options);
    },
    getHotTags: function *() {
      return yield mongodbOperation.find(tag, {deleted: false}, 'name enName', {sort: {hotScore: 'desc'}, skip: 0, limit: 10});
    }
  };

  var _pageData = {
    articles: results.getArticles,
    tag: getTag,
    hotTags: results.getHotTags
  };

  return new View('page/tag', _pageData);

};
