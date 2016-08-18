var config = require("./conf/config");
var express = require('express');
var moment = require('moment');
var async = require('async');
var Exception = require('./application/Exception');
var app = express(),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    useragent = require('express-useragent'),
    bodyParser = require('body-parser');
var _ = require("underscore");
var morgan = require('morgan');
var logger = require('./logger').getLogger(module);
var mongoose = require('mongoose');
var errorController = require('./lib/errorController');
var siteMapController = require('./lib/siteMapController');
var db = require('./module/mongo');
app.locals.filter = require('./application/filter');
app.locals.pretty = config.ENV != "prd";
app.locals.config = config;
app.use(cookieParser()); // required before session.
app.use(bodyParser.json({strict: false}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(useragent.express());//User Agent解析,判断是否是手机,爬虫等

var sessionTTL = 20 * 60 * 1000; // 20 min
var sessionOption = {
    secret: 'ug*&*!^',
    saveUninitialized: false,   // don't create session until something stored
    resave: false,  //don't save session if unmodified
    cookie: {secure: false, maxAge: sessionTTL, domain: config.cookieDomain}
    //store: new MongoStore({mongooseConnection: mongoose.connection, collection: 'sessions', autoRemove: 'native', ttl: sessionTTL})
};
app.use(session(sessionOption));//secure=true requires an https-enabled website 20m.

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.enable('trust proxy');
app.disable('x-powered-by');
app.locals.staticDomain = config.staticDomain + new Date().getTime() + '/assets';
app.locals.jsDomain = app.locals.staticDomain + new Date().getTime() + '/assets/js';
app.locals.portalUrl = config.portalUrl;

app.locals.moment = moment;
app.locals._= _;
if (config.staticRoot) {
    //虚拟路径防止缓存
    app.use(/^\/blog\/\d+/, express.static(config.staticRoot));
    app.use('/doc', express.static(__dirname + '/doc'));
}
app.use(morgan('tiny', {
    stream: logger.stream
}));

var routes = require("./routes");
apppContent = require("./application/applicationUtil");

app.use(useragent.express());//User Agent解析,判断是否是手机,爬虫等
// mapping path and handler, all methods support GET, POST and JSONP
_.each(routes.Routes, function (handler, path) {
    app.all(path, function (req, res, next) {
        apppContent.commonHandler.call(this, req, res, next, handler);
    });
});

app.use(function(err, req, res, next){
    logger.error(req.url, err);
    if (req.xhr) {
        res.status(500).send(Exception.throwException(Exception.Exceptions.Other));
    } else {
        errorController.error500Callback(req, res, function(view){
            res.render(view.name, view.data);
        });
    }
});
//404 NOT FOUND
app.use(function(req, res, next){
    if(req.xhr) {//异步
        res.send(Exception.Exceptions.NotFound);
    } else {
        res.redirect(301, config.portalUrl+'/err/404.html');
    }
});

app.locals.cache = {};

async.auto({
      connectDB: function (callback) {// JOB1
          db.connect(callback);
      },
      timingCreateSiteMap: ['connectDB', function (callback) {// JOB2
          siteMapController.createSiteMap(); // 发布版本时都先生成新的sitemap
          setInterval(siteMapController.createSiteMap, 1000 * 60 * 60 * 2);//2小时生成一次sitemap
          callback();
      }]
  },
  function (err, results) {
      if (err) {
          console.log(err);
          return process.exit(-1)
      }
      var server = app.listen(config.httpPort, config.bindIp || '0.0.0.0', function () {
          console.log('%s Listening on port %d', moment().format('YYYY-MM-DD HH:mm:ss'), server.address().port);
      });
  }
);

// listen uncaughtException
process.on('uncaughtException', function (err) {
    console.trace(err)
});

module.exports = app;
