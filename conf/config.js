/**
 * Author: pauky
 * Date: 2016/3/23
 * Verson: 0.1
 */

var nconf = require('nconf').argv().env();
var node_env = nconf.get('NODE_ENV') || 'dev';

var config = {
  prd: {
    siteName: '行之足',
    mongo: {
      connectionStr: 'mongodb://blog:xingzhizuadmin%^&*@112.74.211.18:27017/blog?autoReconnect=true&bufferMaxEntries=0'
    },
    portalUrl: "https://www.yangrunwei.com",
    portalDomain: "www.yangrunwei.com",
    cookieDomain: "www.yangrunwei.com",
    staticDomain: "https://static.yangrunwei.com/blog/",
    bindIp: '0.0.0.0',
    httpPort: 3100,
    uploadImageDomain: "https://img.yangrunwei.com/",
    uploadFileDomain: 'http://file.yangrunwei.com/',
    email: {
      auth: {
        session_secret: 'yangrunwei-love-blog!@#',
        user: 'glowrypauky@163.com',
        pass: 'glowrypauky918'
      }
    },
    logStdout: false
  },
  sit: {
    siteName: '行之足',
    mongo: {
      connectionStr: "mongodb://blog:abc123@192.168.1.101:27017/blog?autoReconnect=true&bufferMaxEntries=0"
    },
    portalUrl: "http://sit.yangrunwei.com",
    portalDomain: "sit.yangrunwei.com",
    cookieDomain: "sit.yangrunwei.com",
    staticDomain: "http://sit.static.yangrunwei.com/blog/",
    bindIp: '0.0.0.0',
    httpPort: 3100,
    uploadImageDomain: "http://img.yangrunwei.com/",
    uploadFileDomain: 'http://file.yangrunwei.com/',
    email: {
      auth: {
        session_secret: 'yangrunwei-love-blog!@#',
        user: 'glowrypauky@163.com',
        pass: 'glowrypauky918'
      }
    },
    logStdout: false
  },

  dev: {
    siteName: '行之足',
    mongo: {
      connectionStr: "mongodb://blog:abc123@127.0.0.1:27017/blog?autoReconnect=true&bufferMaxEntries=0"
      //connectionStr: "mongodb://blog:abc123@192.168.1.101:27017/blog?autoReconnect=true&bufferMaxEntries=0"
    },
    portalUrl: "http://127.0.0.1:3100",
    portalDomain: "127.0.0.1",
    cookieDomain: "127.0.0.1",
    staticDomain: "http://127.0.0.1:3100/blog/",
    //staticRoot: 'E:/workspace/static/blog-portal-static',// 静态资源路径,个人本地路径(宿舍)
    staticRoot: 'D:/pauky/work/blog-portal-static',// 静态资源路径,个人本地路径(办公室)
    bindIp: "0.0.0.0",
    httpPort: 3100,
    uploadImageDomain: "http://img.yangrunwei.com/",
    uploadFileDomain: 'http://file.yangrunwei.com/',
    email: {
      auth: {
        session_secret: 'yangrunwei-love-blog!@#',
        user: 'glowrypauky@163.com',
        pass: 'glowrypauky918'
      }
    },
    logStdout: true
  }
}

console.log("server environment: %s", node_env);
config = config[node_env];
config.ENV = node_env;
module.exports = config
