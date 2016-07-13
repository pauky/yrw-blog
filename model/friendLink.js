/**
 * @module table
 */

var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;
var statusEnum = ['online', 'offline', 'deleted'];//上线, 下线, 删除

/**
 * 友情链接
 * @type {Schema}
 */
var friendLink = new Schema({
  name: {type: String, trim: true, required: true},
  link: {type: String, trim: true, required: true}, // 网址链接
  status: {type: String, enum: statusEnum, required: true, default: 'online'}, // 状态
  createBy: {type: String, select: false},
  createTime: { type: Date, default: Date.now, required: true},
  lastUpdateBy: {type: String, select: false},
  lastUpdateTime: { type: Date, default: Date.now, required: true},
  __v: { type: Number, select: false}
},{collection: 'friendLink', read: 'secondaryPreferred'});

// db is global
module.exports.model = mongoose.model('friendLink', friendLink);
module.exports.statusEnum = statusEnum;
