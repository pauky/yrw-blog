/**
 * Created by pauky on 2016-4-29-0020.
 */
var config = require("../conf/config");
var logger = require("../logger").getLogger(module);
var mongoose = require('mongoose');
var Promise = require('promise');
var connection = null;

exports.connect = function () {
    return new Promise(function (resolve, reject) {
        connection = mongoose.connect(config.mongo.connectionStr, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(connection);
        }).connection;

        // 设置不输出mongodb操作日志
        mongoose.set('debug', false);

        // 监听mongodb错误
        connection.on('error', function (err) {
            logger.error(new Date() + " connect error :" + err);
        });

        //监听db close event并重新连接
        connection.on('close', function () {
            logger.warn(new Date() + " connection close retry connect ");
        });
    });
};