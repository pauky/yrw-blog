/**
 * @module table
 */
var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

var statusEnum = ['unavailable', 'available', 'deleted'];//用户状态,刚注册处于不可用,用户审核成功处于可用状态, 用户可以被删除
/**
 * 普通用户实体
 * @type {Schema}
 */
var adminUser = new Schema({
    name: {type: String, trim: true, required: true, unique: true, trim: true}, //姓名
    account: {type: String, trim: true, required: true, unique: true, trim: true}, //邮箱
    password: {type: String, select: false}, //密码
    status: {type: String, enum: statusEnum, default: 'unavailable', required: true}, //用户状态
    createTime: { type: Date, default: Date.now, required: true, select: false},
    lastUpdateTime: { type: Date, default: Date.now, required: true, select: false},
    __v: { type: Number, select: false}
},{collection: 'adminUser', read: 'secondaryPreferred'});

// db is global
module.exports = mongoose.model('adminUser', adminUser);