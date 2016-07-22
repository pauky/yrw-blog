/**
 * Created by zhush_000 on 2014-4-26-0026.
 */
'use strict';
var util = require("util");
var _ = require("underscore");
var config = require("../conf/config");
var logger = require('../logger').getLogger(module);

//var ApplicationException = function (error) {
//    for (var key in error) {
//        this[key] = error[key];
//    }
//}
//util.inherits(ApplicationException, Error);
/**
 * 自定义错误类
 * @param message 错误描述
 */
class Exception extends Error {
    constructor(message) {
        super();
        this.message = message;
        this.stack = (new Error()).stack;
        this.name = this.constructor.name;
    }
}

/**
 * 已经定义好的异常格式
 * @type {{NeedLogin: {msg: string, redirectUrl: string, errorCode: number}}}
 */
var exceptionsEnum = {
    Other: {
        error: true,
        msg: "system error",
        errorCode: 0 //other
    },
    NotFound: {
        error: true,
        msg: "404 not found",
        errorCode: 404 //404 not found
    },
    NeedLogin: {
        error: true,
        msg: "need login first",
        errorCode: 1000
    },
    EmailNotExistsForSign: {
        error: true,
        msg: "email not exist",
        errorCode: 1001
    },
    passwordForSign: {
        error: true,
        msg: "password wrong",
        errorCode: 1002
    },
    EmailExistsForSignUp: {
        error: true,
        msg: "email exist",
        errorCode: 1003
    },
    GoodsNotExists: {
        error: true,
        msg: "goods not exist",
        errorCode: 1004
    },
    accountUnavailable: {
        error: true,
        msg: "account unavailable, pleas contact administrator",
        errorCode: 1005
    },
    LowStocks: {
        error: true,
        msg: "low stocks",
        errorCode: 1006
    },
    PinDollarNotEnough: {
        error: true,
        msg: "pindollar not enough",
        errorCode: 1007
    },
    NeedCaptcha: {
        error: true,
        msg: "need Captcha",
        errorCode: 1008
    },
    CaptchaError: {
        error: true,
        msg: "captcha error",
        errorCode: 1009
    },
    NoPermission: {
        error: true,
        msg: "you have no permission",
        errorCode: 2000
    },
    NeedParameter: {
        error: true,
        msg: "need parameter",
        errorCode: 2001
    }
};

/**
 * 程序调用此方法统一抛出异常
 * @param exception
 * @param options
 */
function throwException(exception, options) {
    if (typeof exception === 'string' && exceptionsEnum[exception]) {
        exception = exceptionsEnum[exception];
    }
    if (!exception) throw new Error('unkown Exception for type: ' + exception);
    exception = _.extend(_.clone(exception), options);

    throw new Exception(exception);
}

/**
 * 处理异常
 * @param err
 * @param ctx
 * @returns {*}
 */
function handleException(err, ctx) {
    var params = ctx.params || {};
    var body = ctx.request.body || {};
    var query = ctx.query || {};
    var requestText = 'REQUEST: params: ' + JSON.stringify(params) + ' body: ' + JSON.stringify(body) + ' query: ' + JSON.stringify(query);
    if (config.ENV === 'prd') {
        err.stack = JSON.stringify(err.stack)
    }
    logger.error(ctx.method, ctx.url, requestText, err.name, err.message, err.stack);
    if(ctx.req.xhr){//异步
        ctx.response.body = err.message;
    } else {//同步请求
        switch (err.message.errorCode) {
            case 404 :
                ctx.redirect('/err/404.html');
                break;
            default :
                ctx.redirect('/err/500.html');
                break;
        }
    }
}

module.exports.throwException = throwException;
module.exports.exceptionsEnum = exceptionsEnum;
module.exports.handleException = handleException;
module.exports.Exception = Exception;
