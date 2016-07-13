/**
 * @module sitemap 网站地图
 */
var config = require("../conf/config");
var _ = require("underscore");
var async = require("async");
var Exception = require("../application/Exception");
var View = require("../application/View");
var Promise = require('promise');
var article = require('../model/article');
var tag = require('../model/tag');
var mongodbOperation = require("../application/mongodbOperation");
var moment = require('moment');
var fs = require('fs');
var sm = require('sitemap');
var sitemap = sm.createSitemap({
    hostname: config.portalUrl,
    cacheTime: 600000,
    urls: [
        {url: config.portalUrl, changefreq: 'always', priority: 1, lastmod: moment().format('YYYY-MM-DD')},
        {url: config.portalUrl + '/a', changefreq: 'daily', priority: 0.8, lastmod: moment().format('YYYY-MM-DD')},
        {url: config.portalUrl + '/tech', changefreq: 'daily', priority: 0.8, lastmod: moment().format('YYYY-MM-DD')},
        {url: config.portalUrl + '/life', changefreq: 'daily', priority: 0.8, lastmod: moment().format('YYYY-MM-DD')}
    ]
});

/**
 * 生成网站地图（sitemap）
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.createSiteMap = function (req, res) {
    return new Promise(function (resolve, reject) {
        async.auto({
            getArticles: function (callback) {
                var query = {status: 'online', onlineTime: {$lte: new Date()}};
                var options = {sort: {onlineTime: 'desc'}};
                mongodbOperation.find(article, query, 'order lastUpdateTime', options, callback)
            },
            getTags: function (callback) {
                mongodbOperation.find(tag, {deleted: false}, 'enName', {sort: {hotScore: 'desc'}}, callback);
            }
        }, function(err, results){
            if(err) return reject(err);
            // 添加文章索引
            _.each(results.getArticles, function (art) {
                sitemap.del({url: config.portalUrl + '/a/' + art.order + '.html'}); // 删除重复
                sitemap.add({
                    url: config.portalUrl + '/a/' + art.order + '.html',
                    lastmod: moment(art.lastUpdateTime).format('YYYY-MM-DD'),
                    changefreq: 'daily',
                    priority: 0.5
                });
            });
            // 添加标签索引
            _.each(results.getTags, function (tag) {
                sitemap.del({url: config.portalUrl + '/tag/' + tag.enName}); // 删除重复
                sitemap.add({
                    url: config.portalUrl + '/tag/' + tag.enName,
                    lastmod: moment().format('YYYY-MM-DD'),
                    changefreq: 'daily',
                    priority: 0.5
                });
            });
            fs.writeFile('sitemap.xml', sitemap.toString(),  function(err) {
                if (err) {
                    return console.error(err);
                }
                //console.log("数据写入成功！");
            });
        });
    });
};

/**
 * 获取并返回sitemap
 * @param res
 * @param req
 */
exports.sendSiteMap = function (res, req) {
    var data = fs.readFileSync("sitemap.xml", "utf-8");
    res.header('Content-Type', 'application/xml'); // 必须加上，不然没格式
    res.end(data);
};

/**
 * 生成robots.txt
 * @param req
 * @param res
 */
exports.sendRobot = function (req, res) {
    var data = fs.readFileSync("robots.txt", "utf-8");
    res.header('Content-Type', 'text/plain'); // 必须加上，不然没格式（如文本换行）
    res.end(data);
};
