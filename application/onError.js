/*
* 重置koa内置的error监听
* */
'use strict';
var onError = function (app) {
  app.context.onerror = function (err) {
    if (null == err) return;

    if (!(err instanceof Error)) err = new Error('non-error thrown: ' + err);

    return this.app.emit('error', err, this);
  }
};
module.exports = onError;