/**
 * Author: pauky
 * Date: 2016/3/23
 * Verson: 0.1
 */
'use strict';
var config = require('./conf/config');
var Koa = require('koa');
var app = new Koa();
var Router = require('koa-router');
var mongoose = require('mongoose');
var logger = require('./logger').getLogger(module);
var _ = require('underscore');
var moment = require('moment');
var util = require('util');
var routes = require('./routes');
var router = new Router();
var appContent = require("./application/applicationUtil");
var userAgent = require('koa-useragent');
var bodyParser = require('koa-bodyparser');
var morgan = require('koa-morgan');
var siteMapController = require('./lib/siteMapController');
var co = require('co');
var exception = require("./application/Exception");
var db = require('./module/mongo');

app.proxy = true; // 设置一些proxy header 参数会被加到信任列表中

// 解析body数据
app.use(bodyParser());


// 模板引擎
let Jade = require('koa-jade');
let jade = new Jade({
  viewPath: __dirname + '/views',
  debug: false,
  pretty: false,
  compileDebug: false,
  noCache: config.ENV === 'dev', // 是否开启jade缓存
  basedir: __dirname + '/views',
  app: app // equals to jade.use(app) and app.use(jade.middleware)
});
jade.locals.config = config;
jade.locals.staticDomain = config.staticDomain + new Date().getTime() + '/assets';
jade.locals.jsDomain = jade.locals.staticDomain + '/assets/js';
jade.locals.portalUrl = config.portalUrl;
jade.locals.moment = moment;
jade.locals._= _;
jade.locals.filter = require('./application/filter');

//User Agent解析,判断是否是手机,爬虫等
app.use(userAgent());

// url访问日志
app.use(morgan.middleware('tiny', {
  stream: logger.stream
}));

// 注入中间件
app.use(function *(next) {
  if (this.req.headers['x-requested-with']&&this.req.headers['x-requested-with'].toLowerCase() == 'xmlhttprequest') {
    this.req.xhr = true;
  } else {
    this.req.xhr = false;
  }
  yield next;
});

// 本地开发环境的静态资源
if (config.staticRoot) {
  let send = require('koa-send');

  // 前端静态资源
  router.get(/^\/blog\/\d+/, function *() {
    this.path = this.path.replace(/^\/blog\/\d+/, '');
    yield send(this, this.path, { root: config.staticRoot });
  });

  // 文档
  router.get(/^\/doc/, function *() {
    if (this.path === '/doc') {
      return this.redirect('/doc/index.html');
    }
    if (this.path === '/doc/') {
      this.path = '/doc/index.html';
    }
    this.path = this.path.replace('/doc', '');
    yield send(this, this.path, { root: __dirname + '/doc' });
  });
}

// 路由
// mapping path and handler, all methods support GET, POST and JSONP
_.each(routes.Routes, function (actions, path) {
  _.each(actions, function(action){
    _.each(action.methods, function(method){
      router[method](path, function *(next) {
        yield appContent.commonHandler.call(this, this.req, this.res, next, action.handler);
        //appContent.commonHandler.call(this, this.req, this.res, next, action.handler);
      });
      if (action.childRouter) {
        _.each(action.childRouter, function (r) {
          router[method](path+r, function *(next) {
            yield appContent.commonHandler.call(this, this.req, this.res, next, action.handler);
          });
        });
      }
    });
  });
});

app.use(router.routes());


// 监听404
app.use(function *() {
  if (this.headers['x-requested-with']&&this.headers['x-requested-with'].toLowerCase() == 'xmlhttprequest') {
    // 异步请求
    this.response.body = exception.exceptionsEnum['NotFound'];
  } else {
    this.redirect('/err/404.html');
  }
});

// 重置koa内置的error监听
let onError = require('./application/onError');
onError(app);

// 监听错误
app.on('error', function(err, ctx){
  var params = ctx.params || {};
  var body = ctx.request.body || {};
  var query = ctx.query || {};
  var requestText = 'REQUEST: params: ' + JSON.stringify(params) + ' body: ' + JSON.stringify(body) + ' query: ' + JSON.stringify(query);
  logger.error('Internal Server Error: ', ctx.method, ctx.url, requestText, err);
  ctx.status = 500;
  // 异步请求
  if(ctx.req.xhr){
    ctx.set('Content-Type', 'application/json');
    return ctx.res.end(JSON.stringify(exception.exceptionsEnum.Other));
  }
  //同步请求
  ctx.redirect('/err/500.html');

  return ctx.res.end();
});

// 应用入口
co(function *() {
  try {
    // 连接数据库
    var connection = yield db.connect();
    logger.info('mongodb connected');

    // 启动应用
    app.listen(config.httpPort);
    console.log('%s Listening on port %d', moment().format('YYYY-MM-DD HH:mm:ss'), config.httpPort);

    // 定时任务
    yield* siteMapController.createSiteMap(); // 发布版本时都先生成新的sitemap
    setInterval(function () {
      co(siteMapController.createSiteMap);
    }, 1000 * 60 * 60 * 2);//2小时生成一次sitemap

  } catch (err) {
    logger.error(err);
  }
});

// listen uncaughtException
process.on('uncaughtException', function (err) {
  console.trace(err)
});