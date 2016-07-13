var util = require('util');
var imgUrlReg = new RegExp(require('../conf/config').uploadImageDomain);//只有阿里云的图片服务器才可以做动态压缩
var URL = require("url");
// 过滤器
module.exports = {
    // 格式化时间日期
    // #{filter.fmtDateTime("2014-5-25 14:2:6", "yyyy年M月d日 hh:mm:ss")}  => 2014年5月25日 14:02:06
    // fmtDateTime("2014-5-5", "yyyy年MM月dd日")  => 2014年05月05日
    fmtDateTime: function (str, format) {
        format = format || "yyyy年M月d日 hh:mm:ss";
        var _date = new Date(str);
        var o = {
            "M+": _date.getMonth() + 1, //month
            "d+": _date.getDate(), //day
            "h+": _date.getHours(), //hour
            "m+": _date.getMinutes(), //minute
            "s+": _date.getSeconds(), //second
            "q+": Math.floor((_date.getMonth() + 3) / 3), //quarter
            "S": _date.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (_date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    },

    // 距离现在时间
    distDateBeforeNow: function (targetDate, normal, nowDate) {
        nowDate = new Date(nowDate || new Date());
        targetDate = new Date(targetDate || nowDate);
        var _distTime = (nowDate - targetDate) / 1000,
            _s = 1,
            _m = 60 * _s,
            _h = 60 * _m,
            _d = 24 * _h;
        var distDay = parseInt(_distTime / _d);
        var distHour = parseInt(_distTime / _h - distDay * 24);
        var distMinute = parseInt(_distTime / _m - (distHour * 60 + distDay * 60 * 24));
        var _wrap = function (str) {
            return ["<span class='time'>", str, "</span>"].join("");
        };
        if (distDay > 0) {
            if (normal) {
                return this.fmtDateTime(targetDate, "yyyy-M-d");
            } else {
                return _wrap(targetDate.getDate()) + this.fmtDateTime(targetDate, "yyyy-M");
            }
        } else if (distHour > 0) {
            return _wrap(distHour) + "小时 前";
        }
        if (distMinute > 0) {
            return _wrap(distMinute) + "分钟 前";
        } else {
            return '最新';
        }
    },

    // 距离现在时间(给v3搜索用)
    distDateBeforeNowForSearch: function (targetDate, nowDate) {
        nowDate = new Date(nowDate || new Date());
        targetDate = new Date(targetDate || nowDate);
        var _distTime = (nowDate - targetDate) / 1000,
          _s = 1,
          _m = 60 * _s,
          _h = 60 * _m,
          _d = 24 * _h;
        var distDay = parseInt(_distTime / _d);
        var distHour = parseInt(_distTime / _h - distDay * 24);
        var distMinute = parseInt(_distTime / _m - (distHour * 60 + distDay * 60 * 24));
        var _wrap = function (str) {
            return ["<span class='time-top'>", str, "</span>"].join("");
        };
        if (distDay > 0) {
            return _wrap(targetDate.getDate()) + '<span class="time-bottom">'+this.fmtDateTime(targetDate, "yyyy-M")+'</span>';
        } else if (distHour > 0) {
            return _wrap(distHour) + '<span class="time-bottom">小时前</span>';
        }
        if (distMinute > 0) {
            return _wrap(distMinute) + '<span class="time-bottom">分钟前</span>';
        } else {
            return '<span class="time-bottom">最新</span>';
        }
    },

	// 距离现在时间505
	distDateBeforeNowFive: function (targetDate, nowDate) {
		nowDate = new Date(nowDate || new Date());
		targetDate = new Date(targetDate || nowDate);
		var _distTime = (nowDate - targetDate) / 1000,
			_s = 1,
			_m = 60 * _s,
			_h = 60 * _m,
			_d = 24 * _h;
		var distDay = parseInt(_distTime / _d);
		var distHour = parseInt(_distTime / _h - distDay * 24);
		var distMinute = parseInt(_distTime / _m - (distHour * 60 + distDay * 60 * 24));
		var _wrap = function (str) {
			return ["<span class='time'>", str, "</span>"].join("");
		};
		if (distDay > 0) {
			return _wrap(this.fmtDateTime(targetDate, "yyyy-MM-dd"));
		} else if (distHour > 0) {
			return _wrap(distHour) + "小时 前";
		}
		if (distMinute > 0) {
			return _wrap(distMinute) + "分钟 前";
		} else {
			return '最新';
		}
	},

    /**
     * 返回对应压缩的图片地址, 如果不能压缩的图片将返回原图地址
     * @param imgUrl  原图地址
     * @param width   期望宽度
     * @param height  期望高度
     * @param e  0: 短边优先,默认值为1(长边优先)
     */
    getImgCompressUrl: function (imgUrl, width, height, e) {
        if(typeof e == 'undefined') e = 1;
        if (!imgUrlReg.test(imgUrl)) return imgUrl;
        return util.format('%s@%dw_%dh_%de_0c_100q_1wh.jpg', imgUrl, width, height, e);
    },

    /**
     *
     * @param imgUrl  http://img.pintu360.com/other/20150518/5e1ca8c9-55e4-46f5-b50a-e143df4c60dd.jpg
     * @param style @!headline
     * @returns {String} http://img.pintu360.com/other/20150518/5e1ca8c9-55e4-46f5-b50a-e143df4c60dd.jpg@!headline
     */
    getImgCompressUrlByStyle: function (imgUrl, style) {
        if (!imgUrl || !imgUrlReg.test(imgUrl)) return imgUrl;
        return util.format('%s%s', imgUrl, style);
    },
    // 是否url
    hostname: function (str) {
        return URL.parse(str).hostname;
    },

    // 限制字数
    limitWords: function (str, len, postFix) {
        if (typeof str == "undefined") {
            return '';
        }
        str = str.replace(/[\n\r]/g, "");
        len = len || str.length;
        postFix = postFix || '...';
        len = len >= 0 ? len : str.length + len;
        var _str = str.slice(0, len);
        if (_str == str) {
            return str;
        }
        return _str + postFix;
    },

    // 返回文章类型
    articleType: function (str) {
        var _arr = ["快讯", "观点", "案例", "盘点", "品见"];
        var _arrType = ['news', 'view', 'case', 'summary', 'eveluation'];
        return _arrType[_arr.indexOf(str)] || "";
    },

    // 返回文章类型
    tagType: function (str) {
	      str = str || "";
        var _arr = ['company', 'celebrity', 'industry', 'other'];
        var _arrType = ["企业", "人物", "行业", "论"];
        return _arrType[_arr.indexOf(str)] || "";
    }
}