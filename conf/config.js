/**
 * 配置
 */

var nconf = require('nconf').argv().env();
var node_env = nconf.get('NODE_ENV') || 'dev';

var config = {
    prd: {
        // 生产环境下的配置
    },
    sit: {
        // 测试环境下的配置
    },

    dev: {
        // 本地开发环境下的配置

        siteName: '行之足',
        mongo: {
            connectionStr: "mongodb://blog:abc123@127.0.0.1:27017/blog?autoReconnect=true&bufferMaxEntries=0"
        },
        portalUrl: "http://127.0.0.1:3100",
        portalDomain: "127.0.0.1",
        cookieDomain: "127.0.0.1",
        staticDomain: "http://127.0.0.1:3100/blog/",
        staticRoot: 'D:/pauky/work/blog-portal-static',// 静态资源路径,个人本地路径(办公室)
        bindIp: "0.0.0.0",
        httpPort: 3100,
        email: {
            auth: {
                session_secret: 'your session_secret',
                user: 'your email',
                pass: 'your password'
            }
        },
        logStdout: true // 是否开启日志存储
    }
};

console.log("server environment: %s", node_env);
config = config[node_env];
config.ENV = node_env;
module.exports = config;
