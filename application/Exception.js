
var util = require("util");
var _ = require("underscore");
var config = require("../conf/config");

var ApplicationException = function (error) {
    for (var key in error) {
        this[key] = error[key];
    }
}
util.inherits(ApplicationException, Error);

/**
 * 已经定义好的异常格式
 * @type {{NeedLogin: {msg: string, redirectUrl: string, errorCode: number}}}
 */
var Exceptions = {
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
    OverBuyLimit: {
        error: true,
        msg: "over buy limit",
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
}

/**
 * 程序调用此方法统一抛出异常
 * @param type
 * @returns {ApplicationException}
 */
function throwException(exception, error) {
    if (!exception) throw new Error('unkown Exception for type: ' + exception);
    exception = _.extend(_.clone(exception), error);
    return new ApplicationException(exception)
}

module.exports.throwException = throwException;
module.exports.Exceptions = Exceptions;
module.exports.ApplicationException = ApplicationException;
