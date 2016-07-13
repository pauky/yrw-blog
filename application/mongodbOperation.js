var logger = require("../logger").getLogger(module);
var util = require('util');

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
 */
exports.mongoQueryPage = mongoQueryPage = function *(model, query, fields, options) {
    return yield {
        total: count(model, query),
        data: find(model, query, fields, options)
    };
};

/**
 * count
 * @type {Function}
 */
exports.count = count = function *(model, query) {
    var data = yield model.count(query);
    dbLog([model.modelName, 'count', query]);
    return data;
};

/**
 * findOne
 * @type {Function}
 */
exports.findOne = findOne = function *(model, query, fields, options) {
    var data = yield model.findOne(query, fields, options);
    dbLog([model.modelName, 'findOne', query, fields, options]);
    return data;
};

/**
 * findById
 * @type {Function}
 */
exports.findById = findById = function *(model, id, fields, options) {
    return yield findOne(model, {_id: id}, fields, options)
};

/**
 * find
 * @type {Function}
 */
exports.find = find = function *(model, query, fields, options) {
    var data = yield model.find(query, fields, options);
    dbLog([model.modelName, 'find', query, fields, options]);
    return data;
};


/**
 * findOneAndUpdate
 * @type {Function}
 */
exports.findOneAndUpdate = findOneAndUpdate = function *(model, query, update, options) {
    var data = yield model.findOneAndUpdate(query, update, options);
    dbLog([model.modelName, 'findOneAndUpdate', query, update, options]);
    return data;
};

/**
 * findByIdAndUpdate
 * @type {Function}
 */
exports.findByIdAndUpdate = findByIdAndUpdate = function *(model, id, update, options) {
    return yield findOneAndUpdate(model, {_id: id}, update, options);
};

/**
 * findOneAndRemove
 * @type {Function}
 */
exports.findOneAndRemove = findOneAndRemove = function *(model, query, options) {
    var data = yield model.findOneAndRemove(query, options);
    dbLog([model.modelName, 'findOneAndRemove', query, options]);
    return data;
};

/**
 * remove
 * @type {Function}
 */
exports.remove = remove = function *(model, query) {
    var data = yield model.remove(query);
    dbLog([model.modelName, 'remove', query]);
    return data;
};

/**
 * save
 * @type {Function}
 */
exports.save = save = function *(model, document, callback){
    document = document instanceof model ? document : new model(document);
    var data = yield document.save();
    dbLog([model.modelName, 'save', document]);
    return data;
};

/**
 * create
 * @type {Function}
 */
exports.create = create = function *(model, documents){
    var data = yield model.create(documents);
    dbLog([model.modelName, 'create', documents]);
    return data;
};

/**
 * update
 * @type {Function}
 */
exports.update = update = function *(model, query, update, options) {
    var data = yield model.update(query, update, options);
    dbLog([model.modelName, 'update', query, update, options]);
    return data;
};

/**
 * aggregate
 * @type {Function}
 */
exports.aggregate = aggregate = function *(model, options) {
    var data = yield model.aggregate(options);
    dbLog([model.modelName, 'aggregate', options]);
    return data;
};


/**
 * 格式化
 * @param obj
 * @returns {*}
 */
var format = function format(obj){
    if(!obj) return '';
    return util.inspect(obj, false, 10, true).replace(/\n/g, '').replace(/\s{2,}/g, ' ');
};

/**
 * 打印mongodb操作日志
 */
var dbLog = function (args) {
    var time = process.hrtime();
    var diff = process.hrtime(time);
    var ms = diff[0] * 1e3 + diff[1] * 1e-6;
    logger.info('[%sms] %s.%s(%s) %s %s', ms.toFixed(3), args[0], args[1], format(args[2]), format(args[3]), format(args[4]));
};