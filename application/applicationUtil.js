/**
 * Created by zhush_000 on 2014-4-24-0024.
 */

'use strict';

/* import */
var View = require('./View');
var Promise = require("promise");
var config = require("../conf/config");
var _ = require("underscore");
var Exception = require('./Exception');
var errorController = require('../lib/errorController');
var logger = require('../logger').getLogger(module);
/* exports */
var app_util = {};
module.exports = app_util;
/* constants */
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
/**
 * format response result
 * @param result
 * @returns {*}
 */
app_util.formatResult = function (result) {
    result = {
        error: false,
        result: result || null
    };
    return result;
}

app_util.formatErrorResult = function (err) {
    var e = {}
    e.error = true;
    e.msg = err.toString();
    e.errorCode = 0; //not login code
    return e;
}

/**
 * common handler,作用是将http method参数解析出来，然后调用真正的普通的js function
 * @param req
 * @param res
 * @param next
 * @param handleFn
 */
app_util.commonHandler = function (req, res, next, handleFn) {
    var funcParamNames = app_util.getFuncParamNames(handleFn);
    var funcParamVals = [];
    if (funcParamNames) {
        funcParamNames.forEach(function (paramName) {
            if (paramName === 'req') {
                funcParamVals.push(req);
            } else if (paramName === 'res') {
                funcParamVals.push(res);
            } else {
                var paramVal = app_util.getValueFromRequest(req, paramName);
                funcParamVals.push(paramVal);
            }
        });
    }

    var result;
    try {
        result = handleFn.apply(this, funcParamVals);
    } catch (err) {
        return app_util.sendError(err, req, res);
    }
    if (result instanceof Promise) { // is promise object
        result.then(function (data) {
            app_util.sendSuccess(data, req, res);
        }, function (err) {
            app_util.sendError(err, req, res);
        });
    } else if (result instanceof Error){ // is common object or Error object
        app_util.sendError(result, req, res);
    } else if (result){
        app_util.sendSuccess(result, req, res);
    } else {
        // handler return null.Nothing need to do !
    }
}

app_util.sendError = function (err, req, res) {
    var params = req.params || {};
    var body = req.body || {};
    var query = req.query || {};
    var requestText = 'REQUEST: params: ' + JSON.stringify(params) + ' body: ' + JSON.stringify(body) + ' query: ' + JSON.stringify(query)
    if(err instanceof Exception.ApplicationException){
        logger.error(JSON.stringify(err), req.url, requestText);
    } else {
        logger.error(err, req.url, requestText)
    }
    if(req.xhr){//异步
        if(err instanceof Exception.ApplicationException){
            return res.send(err);
        }
        res.send(app_util.formatErrorResult(err));
    } else {//同步请求
        errorController.error500Callback(req, res, function(view){
            console.log(view);
            res.render(view.name, view.data);
        });
    }
}

app_util.sendSuccess = function (result, req, res) {
    if (result instanceof View) {
        if(result.redirect){
            res.redirect(result.redirect)
        }else if(result.resolved){//已经处理完response
//            res.send(result));
        } else {
            res.render(result.name, result.data);
        }
    } else {
        res.send(app_util.formatResult(result));
    }
}
/*========== util methods ==================================================*/

/**
 * get function param names
 * @param func
 * @returns {Array|{index: number, input: string}}
 */
app_util.getFuncParamNames = function (func) {
    var funStr = func.toString();
    funStr = funStr.replace(STRIP_COMMENTS, '');
    if(!funStr) return funStr;
    return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
}
/**
 * parse str to camel format
 * for example:
 *    USER_ID -> userId
 * @param str
 * @returns {string}
 */
app_util.toCamel = function (str) {
    str = str.toLowerCase();
    return str.replace(/([\-_][a-zA-Z])/g, function ($1) {
        return $1.toUpperCase().replace(/[\-_]/g, '');
    });
}

/**
 * 从req获取参数, params-->body-->query
 * @param req
 * @param name
 * @param defaultValue
 * @returns {*}
 */
app_util.getValueFromRequest = function(req, name, defaultValue){
    var params = req.params || {};
    var body = req.body || {};
    var query = req.query || {};
    if (null != params[name] && params.hasOwnProperty(name)) return params[name];
    if (null != body[name]) return body[name];
    if (null != query[name]) return query[name];
    return defaultValue;
}