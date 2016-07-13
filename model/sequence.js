/**
 * @module table
 */

var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

/**
 * 自增序列号生成
 * @type {Schema}
 */
var sequence = new Schema({
    sequenceNum: {type: Number, required: true}, //唯一序列生成器
    __v: {type: Number, select: false}
}, {collection: 'sequence', read: 'secondaryPreferred'});

// db is global
module.exports.sequence = mongoose.model('sequence', sequence);
