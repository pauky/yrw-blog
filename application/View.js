/**  优先判断 redirect参数, 再判断resolved参数,然后才是渲染name模板
 * jade模板
 * @param name
 * @param data
 * @param redirect
 * @param resolved
 * @constructor
 */
'use strict';
class View {
  constructor(name, data, redirect, resolved) {
    this.name = name;
    this.data = data;
    this.redirect = redirect;
    this.resolved =  resolved || false;
  }
}
module.exports = View;