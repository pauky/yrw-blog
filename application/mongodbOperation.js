var async = require('async');
var logger = require("../logger").getLogger(module);
var util = require('util')

/**
 * mongo查询分页封装
 * 返回数据格式
 * {
 *    total: 20,
 *    data: [{}]
 * }
 *
 * @param model
 * @param fields
 * @param query
 * @param options
 * @param callback
 */
exports.mongoQueryPage = mongoQueryPage = function (model, query, fields, options, callback) {
    async.auto({
        count: function (cb) {
            count(model, query, cb)
        },
        getData: function (cb) {
            find(model, query, fields, options, cb);
        }
    }, function (err, results) {
        if (err) return callback(err);
        callback(null, {total: results.count, data: results.getData});
    })
}

/**
 * count
 * @type {Function}
 */
exports.count = count = function (model, query, callback) {
    model.count(query, warpCallback(callback, [model.modelName, 'count', query]));
}

/**
 * findOne
 * @type {Function}
 */
exports.findOne = findOne = function (model, query, fields, options, callback) {
    if ('function' == typeof options) {
        callback = options;
        options = null;
    } else if ('function' == typeof fields) {
        callback = fields;
        fields = null;
        options = null;
    } else if ('function' == typeof query) {
        callback = query;
        query = {};
        fields = null;
        options = null;
    }
    model.findOne(query, fields, options, warpCallback(callback, [model.modelName, 'findOne', query, fields, options]));
}

/**
 * findById
 * @type {Function}
 */
exports.findById = findById = function (model, id, fields, options, callback) {
    findOne(model, {_id: id}, fields, options, callback)
}

/**
 * find
 * @type {Function}
 */
exports.find = find = function (model, query, fields, options, callback) {
    if ('function' == typeof query) {
        callback = query;
        query = {};
        fields = null;
        options = null;
    } else if ('function' == typeof fields) {
        callback = fields;
        fields = null;
        options = null;
    } else if ('function' == typeof options) {
        callback = options;
        options = null;
    }
    model.find(query, fields, options, warpCallback(callback, [model.modelName, 'find', query, fields, options]));
}


/**
 * findOneAndUpdate
 * @type {Function}
 */
exports.findOneAndUpdate = findOneAndUpdate = function (model, query, update, options, callback) {
    if ('function' == typeof options) {
        callback = options;
        options = null;
    }
    model.findOneAndUpdate(query, update, options, warpCallback(callback, [model.modelName, 'findOneAndUpdate', query, update, options]))
}

/**
 * findByIdAndUpdate
 * @type {Function}
 */
exports.findByIdAndUpdate = findByIdAndUpdate = function (model, id, update, options, callback) {
    findOneAndUpdate(model, {_id: id}, update, options, callback)
}

/**
 * findOneAndRemove
 * @type {Function}
 */
exports.findOneAndRemove = findOneAndRemove = function (model, query, options, callback) {
    if ('function' == typeof options) {
        callback = options;
        options = null;
    }
    model.findOneAndRemove(query, options, warpCallback(callback, [model.modelName, 'findOneAndRemove', query, options]))
}

/**
 * remove
 * @type {Function}
 */
exports.remove = remove = function (model, query, callback) {
    model.remove(query, warpCallback(callback, [model.modelName, 'remove', query]))
}

/**
 * save
 * @type {Function}
 */
exports.save = save = function(model, document, callback){
    document = document instanceof model ? document : new model(document);
    document.save(warpCallback(callback, [model.modelName, 'save', document]))
}

exports.create = create = function(model, documents, callback){
    model.create(documents, warpCallback(callback, [model.modelName, 'create', documents]))
}

/**
 * update
 * @type {Function}
 */
exports.update = update = function (model, query, update, options, callback) {
    if ('function' == typeof options) {
        callback = options;
        options = null;
    }
    model.update(query, update, options, warpCallback(callback, [model.modelName, 'update', query, update, options]))
}

/**
 * aggregate
 * @type {Function}
 */
exports.aggregate = aggregate = function (model, options, callback) {
    model.aggregate(options,warpCallback(callback, [model.modelName, 'aggregate', options]))
}


var warpCallback = function(callback, args){
    var time = process.hrtime();
    return function () {
        var diff = process.hrtime(time);
        var ms = diff[0] * 1e3 + diff[1] * 1e-6;
        logger.info('[%sms] %s.%s(%s) %s %s', ms.toFixed(3), args[0], args[1], format(args[2]), format(args[3]), format(args[4]));
        callback.apply(this, arguments);
    }
}

var format = function format(obj){
    if(!obj) return '';
    return util.inspect(obj, false, 10, true).replace(/\n/g, '').replace(/\s{2,}/g, ' ');
}