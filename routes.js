var articleController = require('./lib/articleController');
var techController = require('./lib/techController');
var lifeController = require('./lib/lifeController');
var indexController = require('./lib/indexController');
var searchController = require('./lib/searchController');
var errorController = require('./lib/errorController');
var tagController = require('./lib/tagController');
var siteMapController = require('./lib/siteMapController');
var dataViewController = require('./lib/dataViewController');

/**
 * URL 规则
 * 如果url以RegExp字符串开始, 则会删除RegExp, 把剩余字符串当成正则
 * 正则(\d+), 应该写成(\\d+), 防止虚拟机转义
 * 如:
 * /^\/a\/([a-zA-Z0-9]+)(?:\-(\d+)-(\d+))?\.html$/im
 * 应该写成
 * /^\\/a\\/([a-zA-Z0-9]+)(?:\\-(\\d+)\-(\\d+))?\\.html$/im
 */
exports.Routes = {
    // pages
    "/": indexController.index,       // 首页

    // 所有文章页面
    '/a(?:\/:pageNum(\\d+)-:pageSize(\\d+))?': articleController.all,

    // 文章详情页
    '/a/:order([a-zA-Z0-9]+).html': articleController.detail,

    // 同步搜索
    '/search(?:\/:keyword)?(?:\/:pageNum(\\d+))?(?:-:pageSize(\\d+))?': searchController.search,
    // 异步搜索
    '/partials/search': searchController.search,

    // 技术
    '/tech(?:\/:pageNum(\\d+)-:pageSize(\\d+))?': techController.list,

    // 生活杂记
    '/life(?:\/:pageNum(\\d+)-:pageSize(\\d+))?': lifeController.list,

    // 标签页
    '/tag/:enName([a-zA-Z0-9]+)(?:\/:pageNum(\\d+)-:pageSize(\\d+))?': tagController.detail,

    // 精彩内容（示例）
    '/demo/data-view.html': dataViewController.index, // 数据视图

    // 异步接口
    '/api/countTagArticle': dataViewController.countTagArticle, // 标签文章数量统计
    '/api/countTypeArticle': dataViewController.countTypeArticle, // 类型文章数量统计
    '/api/countMonthArticle': dataViewController.countMonthArticle, // 月份文章数量统计

    // error page
    '/err/404.html': errorController.error404,
    '/err/500.html': errorController.error500,

    // 网站地图
    '/sitemap.xml': siteMapController.sendSiteMap,
    '/robots.txt': siteMapController.sendRobot

};
