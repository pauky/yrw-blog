/**
 * @module table
 */
var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;


/**
 * 标签
 * @type {Schema}
 */
var tag = new Schema({
  name: {type: String, trim: true, required: true},
  enName: {type: String, trim: true, required: true}, // 英文名称，作为url合成部分
  description: {type: String}, // 详细描述
  hotScore: {type: Number, default:0, required: true}, //热度
  deleted: {type: Boolean, default: false, select: false},
  createBy: {type: String, select: false},
  createTime: { type: Date, default: Date.now, required: true},
  lastUpdateBy: {type: String, select: false},
  lastUpdateTime: { type: Date, default: Date.now, required: true},
  __v: { type: Number, select: false}
},{collection: 'tag', read: 'secondaryPreferred'});

// db is global
module.exports = mongoose.model('tag', tag);