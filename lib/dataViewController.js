/**
 * @module dataView 数据可视化
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
var tag = require('../model/tag');
var accountUser = require('../model/accountUser');

/**
 * 数据视图
 * URL: `/data-view.html`
 * Result (`jade`):
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.index = function (req, res) {
  return new Promise(function (resolve, reject) {
      resolve(new View('demo/data-view'));
  });
};

/**
 * 标签文章数量统计
 * URL: `/api/countTagArticle`
 * Result (`jade`):
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.countTagArticle = function (req, res) {
  return new Promise(function (resolve, reject) {
    async.auto({
        getTags: function (callback) {
          var query = {deleted: false};
          mongodbOperation.find(tag, query, '_id name enName', callback);
        },
        getTagsArticles: ['getTags', function (callback, results) {
          if (!results.getTags) {
            callback();
          }
          var tagIds = _.pluck(results.getTags, '_id');
          if (_.size(tagIds) == 0) return callback();
          mongodbOperation.find(article, {tags: {$in: tagIds}, status: 'online'}, '_id tags', callback);
        }],
        countTagArticle: ['getTagsArticles', function (callback, results) {
          if (!results.getTagsArticles) {
            callback();
          }
          var value = 0;
          var tagArticles = _.map(results.getTags, function (tag) {
            tag = tag.toJSON();
            value = _.filter(results.getTagsArticles, function (item) {
              return _.contains(item.tags, tag._id.toString() ? tag._id.toString() : null);
            }).length;
            return {
              label: tag.name,
              value: value
            };
          });
          callback(null, tagArticles);
        }]
      },
      function (err, results) {
        if (err) return reject(err);
        resolve(results.countTagArticle);
      });
  });
};

/**
 * 类型文章数量统计
 * URL: `/api/countTypeArticle`
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.countTypeArticle = function (req, res) {
  return new Promise(function (resolve, reject) {
    async.auto({
        getArticles: function (callback, results) {
          var query = {status: 'online', $or: [{type: 'tech'}, {type: 'life'}]};
          mongodbOperation.find(article, query, '_id type', callback);
        },
        countTypeArticle: ['getArticles', function (callback, results) {
          if (!results.getArticles) {
            callback();
          }
          var typeArr = ['tech', 'life'];
          var value = 0;
          var typeArticles = _.map(typeArr, function (type) {
            value = _.filter(results.getArticles, function (item) {
              return item.type === type;
            }).length;
            return {
              label: type,
              value: value
            };
          });
          callback(null, typeArticles);
        }]
      },
      function (err, results) {
        if (err) return reject(err);
        resolve(results.countTypeArticle);
      });
  });
};

/**
 * 月份文章统计
 * URL: `/api/countMonthArticle`
 * @param year 年份
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.countMonthArticle = function (year, req, res) {
  var years = ['2015'];
  if (!year || !_.contains(years, year)) {
    year = parseInt(moment().toDate().getFullYear(), 10); // 默认是今年
  } else {
    year = parseInt(year, 10);
  }
  return new Promise(function (resolve, reject) {
    async.auto({
        getArticles: function (callback) {
          if (isNaN(year) || typeof parseInt(year) !== 'number') {
            return callback();
          }
          var query = {status: 'online', createTime: {$gte: new Date(year+'-1'), $lt: new Date((year+1)+'-1')}};
          var options = {
            sort: {createTime: 'desc'}
          };
          mongodbOperation.find(article, query, '_id title createTime tags', options, callback);
        },
        getTags: ['getArticles', function (callback, results) {
          var query = {deleted: false};
          //var ids = _.chain(results.getArticles).pluck('_id')
          //  .uniq()
          //  .filter(function (item) {return item;})
          //  .value();
          //query._id = {$in: ids};
          mongodbOperation.find(tag, query, 'name enName', callback);
        }]
      },
      function (err, results) {
        if (err) return reject(err);
        var maxDate = null;
        var minDate = null;
        var res = [];
        var articles = [];
        var clusterJson = null;
        var itemTagChild = null;
        for (var m = 1; m <= 12; m += 1) {
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
          res.push({
            month: m,
            num: articles.length,
            articles: articles,
            clusterJson: clusterJson
          });
        };
        resolve({
          monthArticles: res,
          year: {
            all: years,
            current: year
          }
        });
      });
  });
};
