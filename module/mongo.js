/**
 * mongodb 模块
 */
var config = require("../conf/config");
var logger = require("../logger").getLogger(module);
var mongoose = require('mongoose');
var connection = null;

exports.connect = function(callback) {
    connection = mongoose.connect(config.mongo.connectionStr, function(err){
        if(err){
            console.log('mongodb connect error, ', err)
            return callback(err);
        }
        logger.info('mongodb connected');
        callback();
    }).connection;
    mongoose.set('debug', false);
    connection.on('error', function (err) {
        logger.error(new Date() + " connect error :" + err);
    });
    //监听db close event并重新连接
    connection.on('close', function () {
        logger.warn(new Date() + " connection close retry connect ");
    });
    return connection;
};