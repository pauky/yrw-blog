/**
 * @module comment 评论
 */
var Exception = require("../application/Exception");
var Promise = require("promise");
var async = require("async");
var _ = require("underscore");
var config = require("../conf/config");
var comment = require('../model/comment');
var article = require('../model/article');
var mongodbOperation = require("../application/mongodbOperation");
var View = require("../application/View");

/**
 * comment(评论字段):
 * ```
 * {
 *     userId: {type: String, required: true}, //评论人
 *     content: {type: String, required: true}, //评论内容
 *     replyTo: {type: String, required: true},//回复别人的评论, 评论的ID
 *     floorNum: {type: Number, default: 0, required: true},// 楼层
 *     agreeNum: {type: Number, default: 0}, //支持次数
 *     disagreeNum: {type: Number, default: 0}, //反对次数
 *     createBy: {type: String, select: false},
 *     createTime: { type: Date, default: Date.now, required: true},
 *     lastUpdateBy: {type: String, select: false},
 *     lastUpdateTime: { type: Date, default: Date.now, required: true},
 * }
 * ```
 */
exports.COMMENT = function () {
};

/**
 * opinion(评论点赞):
 * ```
 * {
 *   userId: {type: String},//点赞人
 *   sourceType: {type: String, enum: sourceTypeEnum, required: true},,//点赞类型,['article', 'comment'];文章, 评论
 *   sourceId: {type: String, required: true},//点赞对象ID
 *   type: {type: String, enum: typeEnum, required: true}, //[-1, 1]; -1: 反对, 1: 支持
 *   createTime: { type: Date, default: Date.now, required: true},
 * }
 * ```
 */
exports.OPINION = function () {
};
var randomUserName = ['马云?','马化腾?','李开复?','姚劲波?','雕爷?','马佳佳?','李彦宏?','徐小平?','郎咸平?','乔布斯?','董明珠?','雷军?','丁磊?','张朝阳?','江南春?','李想?','李彦宏?','刘强东?','陈春花?','薛蛮子?'];

/**
 * 评论文章
 * URL: `/api/comment/addArticleComment`
 * Examples:
 * ```
 * {
 *  articleId: 'articleId',
 *  content: '评论内容',
 *  replyCommantId: '回复另一条评论的ID' //如果是回复别的评论,请给予此字段
 * }
 * ```
 * Result:
 * ```
 *  {
 *    "error":false,
 *    "result": {
 *         userId: {type: String, required: true}, //评论人
 *         content: {type: String, required: true}, //评论内容
 *         replyTo: {type: String, required: true},//回复别人的评论, 评论的ID
 *         floorNum: {type: Number, default: 0, required: true},// 楼层
 *         agreeNum: {type: Number, default: 0}, //支持次数
 *         disagreeNum: {type: Number, default: 0}, //反对次数
 *         createBy: {type: String, select: false},
 *         createTime: { type: Date, default: Date.now, required: true},
 *         lastUpdateBy: {type: String, select: false},
 *         lastUpdateTime: { type: Date, default: Date.now, required: true},
 *    }
 *  }
 * ```
 * @param {String} articleId 文章ID
 * @param {String} content 评论内容
 * @param {String} replyCommentId 回复评论的ID
 */
exports.addArticleComment = function (articleId, content, replyCommentId, req, res) {
    var user = req.session.user;
    if(!articleId) return Exception.throwException(Exception.Exceptions.NeedParameter,{msg: "[articleId] is required"});
    if(!content) return Exception.throwException(Exception.Exceptions.NeedParameter,{msg: '[content] is required'});
    if((req.session.commentCap || 0) >= 3 && !req.geetest){
        return Exception.throwException(Exception.Exceptions.NeedCaptcha);//评论第三次开始需要输入验证码;
    }
    var remap = {commentator: 10, articleAuthor: 10}; //评论者第一次评论+10, 合作投稿的文章+10
    return new Promise(function (resolve, reject) {
        async.auto({
            checkArticle: function (callback) {
                mongodbOperation.findById(article, articleId, '_id reference author commentNum', callback)
            },
            checkReplyComment: function (callback) {
                if (!replyCommentId) return callback()
                mongodbOperation.findById(comment, replyCommentId, '_id userId', callback)
            },
            addComment: ['checkArticle', 'checkReplyComment', function (callback, results) {
                if (!results.checkArticle) return callback();//文章不存在
                if (replyCommentId && !results.checkReplyComment) return callback();//回复的评论不存在
                var c;
                if(user){
                    c = new comment({
                        sourceType: 'article',
                        userId: user._id,
                        sourceId: articleId,
                        content: content,
                        replyTo: replyCommentId,//回复别人的评论, 评论的ID
                        floorNum: results.checkArticle.commentNum + 1,
                        agreeNum: 0, //支持次数
                        disagreeNum: 0, //反对次数
                        createBy: user._id,
                        createTime: new Date(),
                        lastUpdateBy: user._id,
                        lastUpdateTime: new Date()
                    });
                } else {//匿名评论
                    var userName = _.sample(randomUserName);
                    c = new comment({
                        sourceType: 'article',
                        userInfo: {
                            name: userName,
                            avatar: 'http://img.pintu360.com/default/avatar_anonymous.png'
                        },
                        sourceId: articleId,
                        content: content,
                        replyTo: replyCommentId,//回复别人的评论, 评论的ID
                        floorNum: results.checkArticle.commentNum + 1,
                        agreeNum: 0, //支持次数
                        disagreeNum: 0, //反对次数
                        createTime: new Date(),
                        lastUpdateTime: new Date()
                    });
                }
                mongodbOperation.save(comment, c, function (err) {
                    if (err) {
                        return callback(err)
                    }
                    callback(null, c);
                })
            }],
            incCommentNumber: ['addComment', function (callback, results) {
                if (!results.addComment) return callback();//评论没保存成功
                mongodbOperation.update(article, {_id: articleId}, {$inc: {commentNum: 1}}, callback);//增长评论数量
            }],
            checkAddedReputation: ['addComment', function(callback, results){//第一次评论文章加声望
                if(!user) return callback();
                mongodbOperation.count(reputation, {userId: user._id, type: 'comment', sourceId: articleId}, callback)
            }],
            addHonour: ['checkAddedReputation', function(callback, results){
                if(!user || results.checkAddedReputation != 0) return callback();
                mongodbOperation.findOneAndUpdate(namecard, {userId: user._id}, {$addToSet: {honour: 'commentator'}, $inc: {reputation: remap.commentator}}, {select: '_id userId'}, callback)
            }],
            addReputationDetail: ['addHonour', function(callback, results){
                if(!results.addHonour) return callback();
                var re = new reputation({userId: results.addHonour.userId, type: 'comment', sourceId: articleId, num: remap.commentator, createTime: new Date()});
                mongodbOperation.save(reputation, re, callback)
            }],
            getCoContributor: ['checkAddedReputation', function(callback, results){
                if(!user || results.checkAddedReputation != 0 || results.checkArticle.reference != 'coContribute' || !results.checkArticle.author) return callback(); //登陆用户, 第一次评论,原创文章 给作者加声望
                mongodbOperation.findOneAndUpdate(namecard, {_id: results.checkArticle.author}, {$inc: {reputation: remap.articleAuthor}}, {new: true, select: '_id userId'}, callback)
            }],
            addCoContributorReputationDetail: ['getCoContributor', function(callback, results){
                if(!results.getCoContributor) return callback();
                var re = new reputation({userId: results.getCoContributor.userId, type: 'contributeComment', sourceId: articleId, num: remap.articleAuthor, createTime: new Date()});
                mongodbOperation.save(reputation, re, callback)
            }],
            findArticleAuthor: ['checkArticle', function (callback, results){
                if(!results.checkArticle.author) return callback();
                mongodbOperation.findOne(namecard, {_id: results.checkArticle.author, status: 'online'}, '_id userId', callback)
            }],
            addArticleAuthorMessageAndReplyCommentMessage: ['addComment', 'findArticleAuthor', 'checkReplyComment', function(callback, results){//给文章作者增加未读消息推送,或者给回复者
                var messages = [];
                if(results.findArticleAuthor && results.addComment && (!user || results.findArticleAuthor.userId != user._id.toString())){//评论文章
                    var m = {
                        userId: results.findArticleAuthor.userId,//消息接收人
                        sourceId: results.addComment._id,
                        type: 'commentArticle', //消息类型
                        articleId: results.addComment.sourceId, //文章ID, 评论, 点赞有此字段
                        read: false,
                        createTime: new Date(),
                        lastUpdateTime: new Date()
                    }
                    if(user){
                        m.operationUserId = user._id;
                    } else {
                        m.operationUserInfo = results.addComment.userInfo
                    }
                    messages.push(m)
                }
                if(results.checkReplyComment && results.checkReplyComment.userId && results.addComment && (!user || results.checkReplyComment.userId != user._id.toString())){//回复评论
                    var m = {
                        userId: results.checkReplyComment.userId,//消息接收人
                        sourceId: results.addComment._id,
                        type: 'replyComment', //消息类型
                        articleId: results.addComment.sourceId, //文章ID, 评论, 点赞有此字段
                        commentId: results.addComment._id,
                        read: false,
                        createTime: new Date(),
                        lastUpdateTime: new Date()
                    }
                    if(user){
                        m.operationUserId = user._id;
                    } else {
                        m.operationUserInfo = results.addComment.userInfo
                    }
                    messages.push(m)
                }
                if(messages.length == 0) return callback();
                mongodbOperation.create(message, messages, callback);
            }],
            commentPinAndFamCompute: ['addComment', function(callback, results){
                if(!user || !results.addComment) return callback();
                pinDoRepuCompute.commentArticleCompute(articleId, user._id, callback)
            }]
        }, function (err, results) {
            var commentCap =  req.session.commentCap || 0;
            req.session.commentCap = ++commentCap;
            if (err) reject(err);
            if(results.addComment){
                results.addComment = results.addComment.toJSON();
                if(user){
                    results.addComment.userInfo = {
                        _id: user._id,
                        name: user.namecard.name,
                        userId: user.namecard.userId,
                        avatar: user.namecard.avatar
                    };
                }
            }
            resolve({comment: results.addComment, rule: results.commentPinAndFamCompute});
        })
    })
}

/**
 *  获取文章更多评论
 *  URL: `/api/comment/getArticleComment`
 * @param articleId
 * @param skip
 * @param limit
 * @param req
 * @param res
 * @returns {*|exports|module.exports}
 */
exports.getArticleComment = function(articleId, skip, limit, req, res){
    skip = parseInt(skip) || 0;
    limit = parseInt(limit) || 20;
    if(!articleId) return Exception.throwException(Exception.Exceptions.NeedParameter,{msg: '[articleId] is required'});
    return new Promise(function (resolve, reject) {
        async.auto({
            getComment: function (callback) {//相关评论
                mongodbOperation.find(comment, {sourceId: articleId, sourceType: 'article', deleted: false}, null, {skip: skip, limit: limit, sort: {createTime: 'desc'}}, callback);
            },
            getUsersInfo: ['getComment', function(callback, results){
                var userIds = _.compact(_.pluck(results.getComment, 'userId'));
                if(_.size(userIds) == 0) return callback();
                mongodbOperation.find(namecard, {userId: {$in: userIds}}, '_id name userId avatar', callback)
            }]
        }, function(err, results){
            if(err) return reject(err)
            var resultComments = [];
            _.each(results.getComment, function(c){
                var c = c.toJSON();
                if(!c.userInfo){
                    var userInfo = _.find(results.getUsersInfo, function(u){ return c.userId == u.userId});//找出发表评论的用户信息
                    if(userInfo) c.userInfo = userInfo.toJSON();
                }
                //if(c.deleted){
                //    c.content = '评论已删除';
                //    if(c.userInfo) c.userInfo.name = '评论已删除';//已删除的评论人的名字也要更改.
                //}
                resultComments.push(c);
            })
            //resolve(resultComments);
            resolve(new View('partials/article-comments', {comments: resultComments}));
        })
    })
}
/**
 * 删除评论, 删除成功返回true, 删除失败返回false
 * URL: `/api/comment/deleteComment`
 * Examples:
 * ```
 * {
 *  commentId: 'commentId'
 * }
 * ```
 * Result:
 * ```
 *  {
 *    "error":false,
 *    "result": true
 *  }
 * ```
 * @param commentId 评论ID
 * @param req
 */
exports.deleteComment = function(commentId, req) {
    var user = req.session.user;
    if (!user) return Exception.throwException(Exception.Exceptions.NeedLogin);
    if(!commentId) return Exception.throwException(Exception.Exceptions.NeedParameter,{msg: '[commentId] is required'});
    return new Promise(function (resolve, reject) {
        async.auto({
            deleteComment: function(callback){
                mongodbOperation.findOneAndUpdate(comment, {_id: commentId, userId: user._id}, {deleted: true, lastUpdateBy: user._id, lastUpdateTime: new Date()}, {new: true, select: '_id sourceType sourceId'}, callback)
            },
            incCommentNumber: ['deleteComment', function (callback, results) {
                if(!results.deleteComment || results.deleteComment.sourceType != 'article') return callback();
                mongodbOperation.update(article, {_id: results.deleteComment.sourceId}, {$inc: {commentNum: -1}}, callback);
            }]
        }, function(err, results){
            if(err) reject(err);
            resolve(results.deleteComment ? true: false);
        })
    })
}