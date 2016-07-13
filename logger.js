var winston = require('winston');
var path = require('path');
var moment = require('moment');
var fs = require('fs')
var env = require('./conf/config');

var logDirectory =  __dirname + '/logs';
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create the main logger
var logger = new(winston.Logger)({
    level: 'debug',
    transports: [
        // setup console logging
        new(winston.transports.Console)({
            name: 'console',
            level: 'debug', // Only write logs of info level or higher
            timestamp: function(){return moment().format('YYYY-MM-DD HH:mm:ss')},
            colorize: true,
            silent: env.logStdout == false
        }),
        new(winston.transports.DailyRotateFile)({
            name: 'info-file',
            filename: logDirectory + '/info.log',
            datePattern: '.yyyy-MM-dd',
            level: 'info',
            maxFiles: 30,
            colorize: false,
            timestamp: function(){return moment().format('YYYY-MM-DD HH:mm:ss')},
            silent: env.logStdout == true,
            json: false
        }),
        new(winston.transports.DailyRotateFile)({
            name: 'error-file',
            filename: logDirectory + '/error.log',
            datePattern: '.yyyy-MM-dd',
            level: 'error',
            maxFiles: 30,
            colorize: false,
            timestamp: function(){return moment().format('YYYY-MM-DD HH:mm:ss')},
            silent: env.logStdout == true,
            json: false
        })
    ]
});

function getClazz(module) {
    if (module) {
        if (module.id) {
            if (module.id == '.') {
                return "[yrw] "
            }
            return "[" + path.basename(module.id) + "] ";
        } else {
            return "[" +  module + "] ";
        }
    }
    return "";
}

module.exports.getLogger = function(module){
    var clazz = getClazz(module);
    return {
        debug: function(msg) {
            arguments[0] = clazz + arguments[0];
            logger.debug.apply(this, arguments);
        },
        info: function(msg) {
            arguments[0] = clazz + arguments[0];
            logger.info.apply(this, arguments);
        },
        warn : function(msg) {
            arguments[0] = clazz + arguments[0];
            logger.warn.apply(this, arguments);
        },
        error: function(msg) {
            arguments[0] = clazz + arguments[0]
            if(arguments[0] && arguments[0].length > 10000){
                arguments[0] = arguments[0].substring(0, 10000) + '...'
            }
            logger.error.apply(this, arguments)
        },
        stream: new WinstonStream(logger)
    };
}


/**
 * winston stream bridge
 * @type {exports}
 */
var stream = require("stream");
var util = require("util");

util.inherits(WinstonStream, stream.Writable);

function WinstonStream(logger) {
    stream.Writable.call(this, {decodeStrings: false});
    this._logger = logger;
}

WinstonStream.prototype._write = function _write(chunk, encoding, callback) {
    var s = (typeof chunk === "string") ? chunk : chunk.toString("utf-8");
    if (s.slice(-1) === "\n") {
        s = s.slice(0, -1);
    }
    this._logger.info(s);
    callback();
}