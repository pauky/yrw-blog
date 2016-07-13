/**
 * Author: pauky
 * Date: 2016/3/23
 * Verson: 0.1
 */
'use strict';
var indexController = require('./lib/indexController');
var articleController = require('./lib/articleController');
var searchController = require('./lib/searchController');
var techController = require('./lib/techController');
var lifeController = require('./lib/lifeController');
var tagController = require('./lib/tagController');
var wonderfulContentController = require('./lib/wonderfulContentController');
var dataViewController = require('./lib/dataViewController');
var errorController = require('./lib/errorController');
var siteMapController = require('./lib/siteMapController');

exports.Routes = {
  // 首页
  '/': [{handler:indexController.index, methods:['get']}],

  // 文章详情页
  '/a/:order.html': [{handler:articleController.detail, methods:['get']}],

  // 所有文章页面
  '/a/:pageNum(\\d+)?(-)?:pageSize(\\d+)?': [{
    handler: articleController.all,
    methods: ['get']
  }],

  // 同步搜索
  '/search/:keyword?/:pageNum(\\d+)?(-)?:pageSize(\\d+)?': [{
    handler:searchController.search,
    methods: ['get']
  }],

  // 异步搜索
  '/partials/search': [{handler:searchController.search, methods: ['post']}],

  // 技术
  '/tech/:pageNum(\\d+)?(-)?:pageSize(\\d+)?': [{
    handler: techController.list,
    methods: ['get']
  }],

  // 生活杂记
  '/life/:pageNum(\\d+)?(-)?:pageSize(\\d+)?': [{
    handler: lifeController.list,
    methods: ['get']
  }],

  // 标签页
  '/tag/:enName/:pageNum(\\d+)?(-)?:pageSize(\\d+)?': [{
    handler: tagController.detail,
    methods: ['get']
  }],

  // 精彩内容（示例）
  '/demo/data-view.html': [{handler: wonderfulContentController.dataView, methods: ['get']}], // 数据视图

  // 异步接口
  '/api/countTagArticle': [{handler: dataViewController.countTagArticle, methods: ['post']}], // 标签文章数量统计
  '/api/countTypeArticle': [{handler: dataViewController.countTypeArticle, methods: ['post']}], // 类型文章数量统计
  '/api/countMonthArticle': [{handler: dataViewController.countMonthArticle, methods: ['post']}], // 月份文章数量统计

  // error page
  '/err/404.html': [{handler: errorController.error404, methods: ['get']}],
  '/err/500.html': [{handler: errorController.error500, methods: ['get']}],

  // 网站地图
  '/sitemap.xml': [{handler: siteMapController.sendSiteMap, methods: ['get']}],
  '/robots.txt': [{handler: siteMapController.sendRobot, methods: ['get']}]

};