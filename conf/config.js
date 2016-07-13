/**
 * Author: pauky
 * Date: 2016/3/23
 * Verson: 0.1
 */

var nconf = require('nconf').argv().env();
var node_env = nconf.get('NODE_ENV') || 'dev';

var config = {
  prd: {
    // 生产环境配置
  },
  sit: {
    // 测试环境配置
  },

  dev: {
    // 本地开发环境配置
    siteName: '行之足',
    mongo: {
      connectionStr: "mongodb://blog:abc123@127.0.0.1:27017/blog?autoReconnect=true&bufferMaxEntries=0"
    },
    portalUrl: "http://127.0.0.1:3100",
    portalDomain: "127.0.0.1",
    cookieDomain: "127.0.0.1",
    staticDomain: "http://127.0.0.1:3100/blog/",
    staticRoot: 'D:/pauky/work/yrw-blog-static',// 静态资源路径,个人本地路径
    bindIp: "0.0.0.0",
    httpPort: 3100,
    email: {
      auth: {
        session_secret: 'your session_secret',
        user: 'your email',
        pass: 'your password'
      }
    },
    logStdout: true
  }
}

console.log("server environment: %s", node_env);
config = config[node_env];
config.ENV = node_env;
module.exports = config
