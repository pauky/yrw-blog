/**
 * @module table
 */

var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;
var statusEnum = ['pending', 'online', 'offline', 'deleted'];//草稿/已采纳, 上线, 下线 删除

/**
 * 普通用户实体
 * @type {Schema}
 */
var accountUser = new Schema({
    name: {type: String, trim: true, required: true, unique: true, trim: true}, //姓名
    email: {type: String, trim: true, index: true}, //邮箱
    password: {type: String, select: false}, //密码
    status: {type: String, enum: statusEnum, required: true, default: 'pending'}, //用户状态
    validEmail: {type: Boolean, required: true, default: false}, //是否验证邮箱
    lastLoginTime: {type: Date, default: Date.now, required: true, select: false},
    createTime: {type: Date, default: Date.now, required: true, select: false},
    lastUpdateTime: {type: Date, default: Date.now, required: true, select: false},
    __v: {type: Number, select: false}
}, {collection: 'accountUser', read: 'secondaryPreferred'});

// db is global
module.exports = mongoose.model('accountUser', accountUser);