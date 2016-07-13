/**
 * @module dataView 数据可视化
 */
'use strict';
var config = require("../conf/config");
var _ = require("underscore");
var moment = require('moment');
var mongodbOperation = require("../application/mongodbOperation");
var article = require('../model/article');
var tag = require('../model/tag');
var accountUser = require('../model/accountUser');
var filter = require('../application/filter');
var View = require("../application/View");

/**
 * POST: /api/countTagArticle 标签文章数量统计
 * @param req
 * @param res
 * @returns {json}
 */
exports.countTagArticle = function *(req, res) {
  let results = {};
  results.getTags = yield function *() {
    let query = {deleted: false};
    return yield mongodbOperation.find(tag, query, '_id name enName');
  };
  if (results.getTags) {
    results.getTagsArticles = yield function *() {
      var tagIds = _.pluck(results.getTags, '_id');
      if (_.size(tagIds) == 0) return;
      return yield mongodbOperation.find(article, {tags: {$in: tagIds}, status: 'online'}, '_id tags');
    };
  }
  if (results.getTagsArticles) {
    let value = 0;
    results.countTagArticle = _.map(results.getTags, function (tag) {
      tag = tag.toJSON();
      value = _.filter(results.getTagsArticles, function (item) {
        return _.contains(item.tags, tag._id.toString() ? tag._id.toString() : null);
      }).length;
      return {
        label: tag.name,
        value: value
      };
    });
  }

  return results.countTagArticle;
};

/**
 * POST: /api/countTypeArticle 类型文章数量统计
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.countTypeArticle = function *(req, res) {
  let results = {};
  results.getArticles = yield function *() {
    let query = {status: 'online', $or: [{type: 'tech'}, {type: 'life'}]};
    return yield mongodbOperation.find(article, query, '_id type');
  };
  if (results.getArticles) {
    let typeArr = ['tech', 'life'];
    let value = 0;
    results.countTypeArticle = _.map(typeArr, function (type) {
      value = _.filter(results.getArticles, function (item) {
        return item.type === type;
      }).length;
      return {
        label: type,
        value: value
      };
    });
  }
  return results.countTypeArticle;
};

/**
 * POST: /api/countMonthArticle 月份文章统计
 * @param year 年份
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.countMonthArticle = function *(year, req, res) {
  var years = ['2015'];
  if (!year || !_.contains(years, year)) {
    year = parseInt(moment().toDate().getFullYear(), 10); // 默认是今年
  } else {
    year = parseInt(year, 10);
  }
  let results = {};
  if (!isNaN(year) && typeof parseInt(year) === 'number') {
    results.getArticles = yield function *() {
      var query = {status: 'online', createTime: {$gte: new Date(year+'-1'), $lt: new Date((year+1)+'-1')}};
      var options = {
        sort: {createTime: 'desc'}
      };
      return yield mongodbOperation.find(article, query, '_id title createTime tags', options);
    };
  }
  results.getTags = yield function *() {
    let query = {deleted: false};
    return yield mongodbOperation.find(tag, query, 'name enName');
  };

  let maxDate = null;
  let minDate = null;
  let data = [];
  let articles = [];
  let clusterJson = null;
  let itemTagChild = null;
  for (let m = 1; m <= 12; m += 1) {
    clusterJson = {name: config.siteName, children: []};
    minDate = new Date(year+'-'+m+'-1');
    maxDate = moment(new Date((m === 12 ? year+1 : year)+'-'+(m+1 <= 12 ? m+1 : 1)+'-1')).subtract(1).toDate();
    articles = [];
    _.each(results.getArticles, function (item, i) {
      if (item) {
        if (minDate.getTime() <= item.createTime.getTime() && maxDate >= item.createTime.getTime()) {
          articles.push(item);
          return false;
        }
      }
    });
    _.each(results.getTags, function (tag) {
      itemTagChild = {'name': tag.name, children: []};
      _.each(articles, function (art) {
        art = art.toJSON();
        if (_.contains(art.tags, tag._id.toString())) {
          art.name = art.title;
          itemTagChild.children.push(art);
        }
      });
      if (_.size(itemTagChild.children)) {
        clusterJson.children.push(itemTagChild);
      }
    });
    data.push({
      month: m,
      num: articles.length,
      articles: articles,
      clusterJson: clusterJson
    });
  };
  return {
    monthArticles: data,
    year: {
      all: years,
      current: year
    }
  };

};
