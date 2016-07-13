/**
 * Created by zhush_000 on 2014-4-24-0024.
 */

'use strict';

/* import */
var View = require('./View');
var config = require("../conf/config");
var _ = require("underscore");
var exception = require('./Exception');
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
};

app_util.formatErrorResult = function (err) {
    var e = {};
    e.error = true;
    e.msg = err.toString();
    e.errorCode = 0; //not login code
    return e;
};

/**
 * common handler,作用是将http method参数解析出来，然后调用真正的普通的js function
 * @param req
 * @param res
 * @param next
 * @param handleFn
 */
app_util.commonHandler = function *(req, res, next, handleFn) {
    var _self = this;
    var funcParamNames = app_util.getFuncParamNames(handleFn);
    var funcParamVals = [];
    if (funcParamNames) {
        funcParamNames.forEach(function (paramName) {
            if (paramName === 'req') {
                funcParamVals.push(req);
            } else if (paramName === 'res') {
                funcParamVals.push(res);
            } else if (paramName === 'next') {
                funcParamVals.push(next);
            } else if (paramName === 'ctx') {
                funcParamVals.push(_self);
            } else {
                var paramVal = app_util.getValueFromRequest(_self, paramName);
                funcParamVals.push(paramVal);
            }
        });
    }

    let result;
    try {
        result = yield* handleFn.apply(_self, funcParamVals);
        app_util.sendSuccess(result, _self);
    } catch(err) {
        return app_util.sendError(err, _self);
    }

};

/**
 * 错误时返回
 * @param err
 * @param ctx
 */
app_util.sendError = function (err, ctx) {
    if (err instanceof exception.Exception) {
        // 处理异常
        exception.handleException(err, ctx);
    } else {
        // 处理错误
        if (config.ENV !== 'prd') {
            // 方便调试
            logger.error(ctx.method, ctx.url, err);
            if(ctx.req.xhr){//异步
                ctx.response.body = app_util.formatErrorResult(err);
            } else {
                ctx.redirect('/err/500.html');
            }
        } else {
            throw err;
        }
    }
};

/**
 * 成功时返回
 * @param result
 * @param ctx
 */
app_util.sendSuccess = function (result, ctx) {
    if (result instanceof View) {
        if(result.redirect){
            ctx.redirect(result.redirect)
        }else if(result.resolved){//已经处理完response
//            res.send(result));
        } else {
            if (result.name) {
                ctx.render(result.name, result.data);
            } else {
                // 没有模板路径，则直接返回数据
                ctx.response.body = result.data;
            }
        }
    } else {
        ctx.response.body = app_util.formatResult(result);
    }
};

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
};

/**
 * 从req获取参数, params-->body-->query
 * @param req
 * @param name
 * @param defaultValue
 * @returns {*}
 */
app_util.getValueFromRequest = function(req, name, defaultValue){
    var params = req.params || {};
    var body = req.request.body || {};
    var query = req.query || {};
    if (null != params[name] && params.hasOwnProperty(name)) return params[name];
    if (null != body[name]) return body[name];
    if (null != query[name]) return query[name];
    return defaultValue;
};