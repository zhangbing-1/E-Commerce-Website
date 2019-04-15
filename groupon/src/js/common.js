var common = {};
$(function() {
  var params = $.extend({type: 1, gradeId: 0},urlGet());
  if(typeof params.atype != 'undefined'){
    params.type = params.atype;
  }
  var version = '1.0.0';
  common.baseUrl = '//testapi.chaisenwuli.com/';
  common.prefix = './';
  if (location.href.indexOf("h5.test.chaisenwuli.com") !== -1) {
    common.prefix = "//zongjiewebimg.chaisenwuli.com/test/activitys/groupon/";
  } else if (location.href.indexOf('h5.chaisenwuli.com') !== -1) {
    common.prefix = "//zongjiewebimg.chaisenwuli.com/activitys/groupon/";
    common.baseUrl = "//api.chaisenwuli.com/";
  }
  var u = navigator.userAgent;
  common.isWeixin = u.toLowerCase().match(/MicroMessenger/i) == "micromessenger";
  common.isPhone = u.indexOf('iPhone') > -1;
  common.isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
  common.isWxApp = function() { return window.__wxjs_environment == 'miniprogram' };
  common.shareUrl = location.origin + "/activitys/groupon/";
  common.isClient = u.toLowerCase().match(/zongjie/i) == "zongjie" || (common.isPhone && bridge.hasNativeMethod('getVersionCode') == 1);

  common.oldUserNoShopProducts = [427,428,429,430,431,432,433,434,435,436,474,476,481,482,457];
  common.onlyShopProductOnce = [427,428,429,430,431,432,433,434,435,436];
  common.onlyShopProductOnce2 = [474,476,481,482,457];

  Date.prototype.Format = function(fmt) {
    fmt = fmt || 'yyyy-MM-dd hh:mm:ss';
    var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }

  function getSign(param) {
    var NOISE = 'Daf24Ed57Da77D6Ef1855A709dE946';
    var paramStr = [],
      paramStrSorted = [];
    for (var n in param) {
      paramStr.push(n);
    }
    paramStr = paramStr.sort();
    $(paramStr).each(function(index) {
      paramStrSorted.push(this + param[this]);
    });
    paramStrSorted.push(NOISE);
    return $.md5(paramStrSorted.join(''));
  }

  function stringify(params) {
    var paramStr = [];
    for (key in params) {
      paramStr.push(key + "=" + encodeURIComponent(params[key]));
    }
    return paramStr.join('&');
  }

  function getInterfaceSource() {
    if (common.isClient) {
      return common.isPhone ? 7 : 6;
    } else if (common.isWeixin) {
      return 4;
    } else {
      return common.isPhone ? 3 : 2;
    }
  }

  function request(options, isHideLoading, isHideToast) {
    var loading = common.loading(),
      _options = {},
      _data = {};
    !isHideLoading && loading.show();
    $.extend(_options, {
      type: "GET",
      dataType: 'json',
      timeout: 10000
    }, options)
    _options.type = _options.type.toUpperCase();
    _options.url = common.baseUrl + _options.url;
    $.extend(_data, { source: getInterfaceSource() }, _options.data || {});

    if (!_data.token && getLocalStroge('token')) {
      _data.token = getLocalStroge('token');
    }
    if (!_data.openId && getLocalStroge('openId')) {
      _data.openId = getLocalStroge('openId');
    }
    if (!_data.unionId && getLocalStroge('unionId')) {
      _data.unionId = getLocalStroge('unionId');
    }
    _data.timestamp = new Date().Format();
    _data.pageFrom = 4;
    _data.sign = getSign(_data);
    _options.data = stringify(_data);
    return $.ajax(_options).done(function(res) {
      setTimeout(function() {
        !isHideLoading && loading.hide();
      }, 500)

      if (res.code == 1) {
        removeLocalStroge('token')
        setTimeout(common.tokenExpire, 300)
      }
    }).fail(function() {
      !isHideLoading && loading.hide();
      !isHideToast && common.toast('网络异常,请刷新重试');
    });
  }

  function Loading() {
    this.elem = $('<div class="loading-layer"><div class="loading-inner"><img src="' + common.prefix + 'img/loading.png" /></div></div>');
  }

  Loading.prototype.show = function() {
    this.elem.appendTo('body').fadeIn('fast');
  }
  Loading.prototype.hide = function() {
    var that = this;
    this.elem.fadeOut('fast', function() {
      that.elem.remove();
    });
  }

  common.tokenExpire = function() {
    removeLocalStroge('token')
    if (common.isWxApp()) {
      wx.miniProgram.navigateTo({
        url: '/pages/login/wxLogin?' + common.stringify({
          callBackUrl: common.getHref()
        })
      })
    } else if (common.isClient) {
      bridge.call('tokenExpire');
    } else {
      common.go('./login.html',{
        callBackUrl: location.href
      })
      // location.href = './login.html?' + stringify({
      //   callBackUrl: location.href
      // });
    }
  }

  common.getHref = function() {
    return location.href.replace(/(token|a)=[^&]+[&]?/g, '').replace(/&$/, '').replace(/\?$/, '');
  }

  function createToast(text) {
    var toast = $('<div class="container-toast">' + text + '</div>');
    toast.appendTo('body').fadeIn('fast', function() {
      setTimeout(function() {
        toast.fadeOut('fast', function() { toast.remove() });
      }, 3000)
    });
  }

  common.createShare = function() {
    return '<div class="share-layer"><img src="' + common.prefix + '/img/icon-arrow-1.png"></div>';
  }

  common.createQrcode = function() {
    return '<div class="qrcode-layer"><img src="' + common.prefix + '/img/icon-my-course2.png"></div>';
  }

  common.createGetCoupon = function(){
    return '<div class="banner-get-coupon"><img src="' + common.prefix + 'img/icon-noice.png" /><span class="content">老用户专属100元优惠券</span><span class="btn-get-coupon">领取</span></div>'
  }

  common.createToFreeCourse = function(){
    return '<div class="free-course">更多课程</div>';
  }

  function createLoading() {
    return new Loading();
  }

  function createConfirm(title) {
    var dtd = $.Deferred();
    var confirm = $('<div class="confirm-layer"><div class="confirm-inner"><div class="title">' + title + '</div><div class="btns"><div class="btn-cancle">取消</div><div class="btn-ok">确定</div></div></div></div>')
    confirm.appendTo('body').fadeIn('fast', function() {
      confirm.on('click', '.btn-cancle', function() {
        dtd.reject(confirm);
      })
      confirm.on('click', '.btn-ok', function() {
        dtd.resolve(confirm);
      })
    })
    return dtd;
  }

  function createAlert(title) {
    var dtd = $.Deferred();
    var confirm = $('<div class="confirm-layer"><div class="confirm-inner"><div class="title">' + title + '</div><div class="btns"><div class="btn-ok">确定</div></div></div></div>')
    confirm.appendTo('body').fadeIn('fast', function() {
      confirm.on('click', '.btn-cancle', function() {
        dtd.reject(confirm);
      })
      confirm.on('click', '.btn-ok', function() {
        dtd.resolve(confirm);
      })
    })
    return dtd;
  }

  function getLocalStroge(key) {
    return localStorage.getItem(key);
  }

  function setLocalStroge(key, value) {
    localStorage.setItem(key, value);
  }

  function removeLocalStroge(key) {
    localStorage.removeItem(key);
  }

  common.verify = {
    phone: /^1\d{10}$/,
    captcha: /^\d{4}$/
  }

  var actions = {
    getCode: function(data) {
      return request({ url: 'user/verifyCode', data: data });
    },
    getToken: function(data) {
      return request({ url: 'user/getToken' })
    },
    login: function(data) {
      return request({ url: 'user/login', type: 'post', data: data });
    },
    getActivityList: function(data) {
      return request({ url: 'group/activity/list', data: data }, data.page != 1);
    },
    getActivityInfo: function(data) {
      return request({ url: 'group/activity/groupbookingInfo', data: data })
    },
    groupActivityPay: function(data) {
      data.token = getLocalStroge('token');
      return request({ url: 'group/activity/pay', type: "POST", data: data });
    },
    getUser: function() {
      return request({ url: 'user/userInfo', data: { token: getLocalStroge('token') } });
    },
    editUserInfo: function(user) {
      user.token = getLocalStroge('token');
      return request({ url: 'user/userUploadInfo', type: 'POST', data: user })
    },
    getAddressList: function() {
      return request({ url: 'user/addressList', data: { token: getLocalStroge('token') } })
    },
    deleteAddress: function(addressId) {
      return request({ url: 'user/deleteAddress', type: 'POST', data: { token: getLocalStroge('token'), addressId: addressId } })
    },
    addAddress: function(address) {
      address.token = getLocalStroge('token');
      return request({ url: '/user/addAddress', type: 'POST', data: address })
    },
    updateAddress: function(address) {
      address.token = getLocalStroge('token');
      return request({ url: 'user/updateAddress', type: 'POST', data: address })
    },
    getAreaList: function(type, parentId) {
      return request({ url: 'area/select', data: { type: type, parentId: parentId, token: getLocalStroge('token') } })
    },
    getWxConfig: function() {
      return request({ url: 'wx/createUrlSig', data: { url: location.href.split('#')[0] } });
    },
    getOpenId: function(data) {
      return request({ url: 'wx/authInfo', data: data });
    },
    getProductDetail: function(data) { // 获取所有商品详情
      return request({ url: 'product/detail', data: data })
    },
    getTeacherInfo: function(teacherId) {
      return request({ url: 'user/teacherInfo', data: { teacherId: teacherId } })
    },
    getMyOrder: function(data) {
      data.token = getLocalStroge('token');
      return request({ url: 'group/activity/groupbooingInfoList', data: data }, data.page != 1)
    },
    getOrderInfo: function(data) {
      data.token = getLocalStroge('token');
      return request({ url: 'group/activity/groupbookingInfo', data: data })
    },
    getPoster: function(data) {
      return request({ url: 'activity/getPoster', data:data })
    },
    getCouponMatchProduct: function(data) {
      return request({ url: 'coupon/optimalMatch', data:data  })
    },
    getCouponProductSuitList: function(data) {
      return request({ url: 'coupon/availablePayList', data:data })
    },
    getIsGiveCoupon:function(data){
      return request({ url: 'coupon/showCoupon', data:data })
    },
    getIsReceiveCoupon: function(data){
      return request({ url: 'coupon/isReceive', data:data })
    },
    getActivityTeacherWxInfo: function(data){
      data.token = getLocalStroge('token');
      return request({ url: 'activity/api/v1/wechat/code', type: "POST", data: data });
    },
    submitActivityTeacherCodeLink: function(data){
      data.token = getLocalStroge('token');
      return request({ url: 'activity/api/v1/wechat/code/link', type: "POST", data: data });
    },
    isBuyClass: function(productId){
      return request({ url: 'product/isBuyClass', data: { productId:productId, token: getLocalStroge('token') } });
    },
    isBuyProducts:function(data){
      return request({ url: 'activity/api/v1/isBuySpecialProduct', data: data });
    },
    isOldUser:function(data){
      return request({ url: 'activity/api/v1/checkUser', data:data })
    },
    getPreferentialList:function(){
      return request({ url: 'preferential/list' });
    }
  }

  function urlGet() {
    var args = {};
    var query = location.search.substring(1);
    var pairs = query.split("&");
    for (var i = 0; i < pairs.length; i++) {
      var pos = pairs[i].indexOf('=');
      if (pos == -1) continue;
      var argname = pairs[i].substring(0, pos);
      var value = pairs[i].substring(pos + 1);
      value = decodeURIComponent(value);
      args[argname] = value;
    }
    return args;
  }

  template.defaults.imports.remainingTimeFilter = function(time) {
    var days = Math.floor(time / (60 * 60 * 24));
    var hours = Math.floor((time - days * 60 * 60 * 24) / (60 * 60));
    var minute = Math.floor((time - days * 60 * 60 * 24 - hours * 60 * 60) / 60);
    var second = Math.floor((time - days * 60 * 60 * 24 - hours * 60 * 60 - minute * 60));
    if (days > 0) {
      return days + '天' + hours + '小时' + minute + '分钟';
    } else if (hours > 0) {
      return hours + '小时' + minute + '分钟';
    } else if (minute > 0) {
      return minute + '分钟';
    } else {
      return second + '秒';
    }
  }

  template.defaults.imports.dateFormatFilter = function(str, format) {
    return new Date(str).Format(format)
  }

  template.defaults.imports.weekFilter = function(str, format) {
    return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date(str).getDay()]
  }

  template.defaults.imports.bookStatusFilter = function(status) {
    return ["", "等待成团", "已成团", "拼团成功"][status]
  }

  function createAreaList(list) {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
      arr.push({ id: list[i].id, value: list[i].name });
    }
    return arr;
  }

  common.provinceData = function(callback) {
    actions.getAreaList(1, 0).done(function(res) {
      if (res.code == 0) {
        callback(createAreaList(res.data))
      }
    });
  }
  common.cityData = function(province, callback) {
    actions.getAreaList(2, province).done(function(res) {
      if (res.code == 0) {
        callback(createAreaList(res.data))
      }
    });
  }
  common.areaData = function(province, city, callback) {
    actions.getAreaList(3, city).done(function(res) {
      if (res.code == 0) {
        callback(createAreaList(res.data))
      }
    });
  }

  common.getOpenId = function() {
    var dtd = $.Deferred();
    var appid = 'wxb34a5e23b1078fad';
    var redirectUri = location.href.replace(/#.*/, '')
      .replace(/(code|state|t)=[^&]+[&]?/g, '')
      .replace(/&$/, '')
      .replace(/\?$/, '')
      .replace(location.origin, 'http://codeproxy.chaisenwuli.com'),
      _obj = urlGet();
    if (location.href.indexOf('h5.test.chaisenwuli.com') != -1) {
      redirectUri += redirectUri.indexOf('?') == -1 ? '?t=3' : '&t=3';
    } else {
      redirectUri += redirectUri.indexOf('?') == -1 ? '?t=1' : '&t=1';
    }
    redirectUri = encodeURIComponent(redirectUri);
    var baseUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid + "&redirect_uri=" + redirectUri + "&response_type=code&scope=snsapi_userinfo&state=null#wechat_redirect";

    var openId = getLocalStroge('openId'),
      unionId = getLocalStroge('unionId');
    if (openId && unionId) {
      dtd.resolve(openId, unionId);
    } else if (_obj.code) {
      actions.getOpenId({
        code: _obj.code,
        scope: 1,
        appId: appid,
      }).done(function(res) {
        if (res.code == 0 && res.data.openId) {
          setLocalStroge('openId', res.data.openId || '');
          setLocalStroge('unionId', res.data.unionId || '');
          dtd.resolve(res.data.openId, res.data.unionId);
        } else {
          location.replace(baseUrl);
        }
      })
    } else {
      location.replace(baseUrl);
    }
    return dtd;
  }

  var jsApiList = ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'translateVoice', 'startRecord', 'stopRecord', 'onRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'];
  common.initWeixinConfig = function() {
    var dtd = $.Deferred();
    actions.getWxConfig().done(function(res) {
      if (res.code == 0) {
        var config = res.data;
        config.jsApiList = jsApiList;
        wx.config(config);
        wx.ready(function() {
          wx.hideAllNonBaseMenuItem();
        })
        dtd.resolve();
      } else {
        dtd.reject();
      }
    })
    return dtd;
  }

  common.initialize = function(callBack) {
    var params = urlGet();
    setTimeout(function() {
      if (common.isWxApp()) {
        if (params.token) common.setLocalStroge('token', params.token)
        callBack();
      } else if (common.isClient) {
        common.setLocalStroge('token', bridge.call('getToken'))
        callBack();
      } else {
        common.getOpenId().done(function(openId) {
          common.initWeixinConfig().done(function() {
            actions.getToken().done(function(res) {
              if (res.code == 0 && res.data.token) {
                common.setLocalStroge('token', res.data.token)
              }
              callBack();
            })
          })
        })
      }
    }, 500)
  }

  common.toAppShare = function(activity) {
    var reqContent = common.shareUrl + "detail.html?" + common.stringify({
      id: activity.activityId,
      groupId: activity.bookingId || 0,
      gradeId: common.params.gradeId,
      type: common.params.type
    })
    var timeSlot = new Date(activity.activityStartTime).Format('MM月dd日') + '-' + new Date(activity.activityEndTime).Format('MM月dd日');
    common.actions.getPoster({ bizId: activity.activityId, reqContent: reqContent }).done(function(res) {
      if (res.code == 0) {
        wx.miniProgram.navigateTo({
          url: '/pages/h5/shareImageView?' + common.stringify({
            id: activity.activityId,
            bookingId: activity.bookingId,
            title: activity.activityTitle,
            timeSlot: '拼团活动' + timeSlot,
            desc: activity.activityGroupCount + '人成团,每人' + activity.price + '元',
            shareTitle: '【团购】' + activity.activityTitle,
            shareDesc: activity.activityGroupCount + '人成团,每人' + activity.price + '元',
            shareImg: '',
            img: res.data,
            callBackUrl: common.getHref()
          }),
        })
      }
    })
  }

  common.createToUrl = function(url,data){
    return url + '?' + stringify($.extend({
      gradeId: params.gradeId,
      type: params.type
    }, data || {}));
  }

  common.go = function(url,data){
    location.href = common.createToUrl(url,data);
  }

  common.replace = function(url,data){
    location.replace(common.createToUrl(url,data));
  }

  function floatTool() {

    function isInteger(obj) {
      return Math.floor(obj) === obj
    }

    function toInteger(floatNum) {
      var ret = { times: 1, num: 0 }
      if (isInteger(floatNum)) {
        ret.num = floatNum
        return ret
      }

      var strfi = floatNum + ''
      var dotPos = strfi.indexOf('.')
      var len = strfi.substr(dotPos + 1).length
      var times = Math.pow(10, len)
      var intNum = parseInt(floatNum * times + 0.5, 10)
      ret.times = times
      ret.num = intNum

      return ret
    }

    function operation(a, b, op) {
      var o1 = toInteger(a)
      var o2 = toInteger(b)
      var n1 = o1.num
      var n2 = o2.num
      var t1 = o1.times
      var t2 = o2.times
      var max = t1 > t2 ? t1 : t2
      var result = null
      switch (op) {
        case 'add':
          if (t1 === t2) { // 两个小数位数相同
            result = n1 + n2
          } else if (t1 > t2) { // o1 小数位 大于 o2
            result = n1 + n2 * (t1 / t2)
          } else { // o1 小数位 小于 o2
            result = n1 * (t2 / t1) + n2
          }
          return result / max
        case 'subtract':
          if (t1 === t2) {
            result = n1 - n2
          } else if (t1 > t2) {
            result = n1 - n2 * (t1 / t2)
          } else {
            result = n1 * (t2 / t1) - n2
          }
          return result / max
        case 'multiply':
          result = (n1 * n2) / (t1 * t2)
          return result
        case 'divide':
          return result = function() {
            var r1 = n1 / n2
            var r2 = t2 / t1
            return operation(r1, r2, 'multiply')
          }()
      }
    }

    function add(a, b) {
      return operation(a, b, 'add')
    }

    function subtract(a, b) {
      return operation(a, b, 'subtract')
    }

    function multiply(a, b) {
      return operation(a, b, 'multiply')
    }

    function divide(a, b) {
      return operation(a, b, 'divide')
    }
    // exports
    return {
      add: add,
      subtract: subtract,
      multiply: multiply,
      divide: divide
    }
  }

  $.extend(common, {
    version: version,
    actions: actions,
    getLocalStroge: getLocalStroge,
    setLocalStroge: setLocalStroge,
    removeLocalStroge: removeLocalStroge,
    loading: createLoading,
    toast: createToast,
    urlGet: urlGet,
    stringify: stringify,
    createConfirm: createConfirm,
    createAlert: createAlert,
    floatTool: floatTool(),
    params: params
  }, true);
});

(function(window) {
  'use strict';
  var isToBottom = false,
    isMoved = false;
  var auiScroll = function(params, callback) {
    this.extend(this.params, params);
    this._init(params, callback);
  }
  auiScroll.prototype = {
    params: {
      listren: false,
      distance: 100
    },
    _init: function(params, callback) {
      var self = this;
      if (self.params.listen) {
        document.body.addEventListener("touchmove", function(e) {
          self.scroll(callback);
        });
        document.body.addEventListener("touchend", function(e) {
          self.scroll(callback);
        });
      }
      window.onscroll = function() {
        self.scroll(callback);
      }
    },
    scroll: function(callback) {
      var self = this;
      var clientHeight = document.documentElement.scrollTop === 0 ? document.body.clientHeight : document.documentElement.clientHeight;
      var scrollTop = document.documentElement.scrollTop === 0 ? document.body.scrollTop : document.documentElement.scrollTop;
      var scrollHeight = document.documentElement.scrollTop === 0 ? document.body.scrollHeight : document.documentElement.scrollHeight;

      if (scrollHeight - scrollTop - self.params.distance <= window.innerHeight) {
        isToBottom = true;
        if (isToBottom) {
          callback({
            "scrollTop": scrollTop,
            "isToBottom": true
          })
        }
      } else {
        isToBottom = false;
        callback({
          "scrollTop": scrollTop,
          "isToBottom": false
        })
      }
    },
    extend: function(a, b) {
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    }
  }
  window.auiScroll = auiScroll;
})(window);
