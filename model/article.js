/**
 * @module table
 */
var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;

var statusEnum = ['pending', 'online', 'offline', 'deleted'];//草稿/已采纳, 上线, 下线 删除
var typeEnum = ['tech', 'life'];//技术，生活杂记
var referenceEnum = ['offSite', 'original'];//文章来源, 站外, 原创
/**
 * 文章
 * @type {Schema}
 */
var article = new Schema({
    order: {type: String, required: true, unique: true},
    title: {type: String, trim: true, required: true},
    subtitle: {type: String, trim: true},//副标题
    content: {type: String, required: true},
    contentMd: {type: String, required: true}, // 文章markdown源码
    type: {type: String, enum: typeEnum}, // 文章类型
    reference: {type: String, enum: referenceEnum, default: 'original'},//文章来源, 站外, 原创
    author: {type: String}, //作者
    tags: {type: [String]}, //标签
    offSiteName: {type: String}, //站外名字
    offSiteUrl: {type: String}, //站外网址
    hotScore: {type: Number, default: 0, required: true}, //热度
    status: {type: String, enum: statusEnum, required: true, default: 'pending'}, //文章状态
    onlineTime: {type: Date},
    createBy: {type: String, select: false},
    createTime: {type: Date, default: Date.now, required: true},
    lastUpdateBy: {type: String, select: false},
    lastUpdateTime: {type: Date, default: Date.now, required: true},
    mysqlId:{ type: Number},
    __v: {type: Number, select: false}
}, {collection: 'article', read: 'secondaryPreferred'});

// db is global
module.exports = mongoose.model('article', article);