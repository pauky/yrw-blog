/**
 * @module table
 */

var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;
var typeEnum = ['article'];//文章评论

/**
 * 文章评论
 * @type {Schema}
 */
var comment = new Schema({
    userId: {type: String}, //评论人
    sourceType: {type: String, enum: typeEnum, required: true},
    sourceId: {type: String, required: true},//评论对象ID
    content: {type: String, required: true}, //评论内容
    replyTo: {type: String},//回复别人的评论, 评论的ID
    floorNum: {type: Number, default: 0, required: true},// 楼层
    deleted: {type: Boolean, default: false}, //是否已经删除
    createBy: {type: String, select: false},
    createTime: {type: Date, default: Date.now, required: true},
    lastUpdateBy: {type: String, select: false},
    lastUpdateTime: {type: Date, default: Date.now, required: true},
    __v: {type: Number, select: false}
}, {collection: 'comment', read: 'secondaryPreferred'});

// db is global
module.exports = mongoose.model('comment', comment);