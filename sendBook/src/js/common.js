var common = {};
$(function() {
  var version = '1.0.0';
  common.baseUrl = '//testapi.chaisenwuli.com/';
  common.prefix = './';
  common.appid = 'wxb34a5e23b1078fad';

  if (location.href.indexOf("h5.test.chaisenwuli.com") !== -1 || location.href.indexOf("h5.test.zongjie.com") !== -1 || location.href.indexOf("tjh5.test.zongjie.com") !== -1 ) {
    common.prefix = "//zongjiewebimg.chaisenwuli.com/test/activitys/groupon/";
  } else if (location.href.indexOf('h5.chaisenwuli.com') !== -1 || location.href.indexOf('h5.zongjie.com') !== -1 || location.href.indexOf('tjh5.zongjie.com') !== -1) {
    common.prefix = "//zongjiewebimg.chaisenwuli.com/activitys/groupon/";
    common.baseUrl = "//api.chaisenwuli.com/";
  }
  var u = navigator.userAgent;
  common.isWeixin = u.toLowerCase().match(/MicroMessenger/i) == "micromessenger";
  common.isPhone = u.indexOf('iPhone') > -1;
  common.isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
  common.isWxApp = function() { return window.__wxjs_environment == 'miniprogram' };
  common.shareUrl = location.origin + "/activitys/groupon/";

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
    $.extend(_data, { source: 4 }, _options.data || {});
    _data.timestamp = new Date().Format();
    _data.sign = getSign(_data);
    _options.data = stringify(_data);
    return $.ajax(_options).done(function(res) {
      setTimeout(function() {
        !isHideLoading && loading.hide();
      }, 800)
      if (res.code == 1) {
        removeLocalStroge('token')
        location.href = './login.html?' + stringify({
          callBackUrl: location.href
        });
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
    return '<div class="share-layer"><img src="' + common.prefix + '/img/icon-arrow.png"></div>';
  }

  common.createQrcode = function() {
    return '<div class="qrcode-layer"><img src="' + common.prefix + '/img/icon-my-course.png"></div>';
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
      confirm.on('click', '.btn-ok', function() {
        confirm.remove();
        dtd.resolve(confirm);
      })
    })
    return dtd;
  }

  function getLocalStroge(key) {
    return localStorage.getItem('activity-' + key + '-' + version);
  }

  function setLocalStroge(key, value) {
    localStorage.setItem('activity-' + key + '-' + version, value);
  }

  function removeLocalStroge(key) {
    localStorage.removeItem('activity-' + key + '-' + version);
  }

  common.verify = {
    phone: /^1\d{10}$/,
    captcha: /^\d{4}$/
  }

  var actions = {
    getCode: function(data) {
      return request({ url: 'user/verifyCode', data: data });
    },
    login: function(data) {
      return request({ url: 'user/login', type: 'post', data: data });
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
      return request({ url: 'wx/createUrlSig', data: { url: location.href.split('#')[0], appid: common.appid }});
    },
    getOpenId: function(data) {
      return request({ url: 'wx/authInfo', data: data });
    },
    getToken:function(data){
      return request({ url: 'user/getToken', data: data });
    },
    getProductDetail: function(data) { // 获取所有商品详情
      return request({ url: 'product/detail', data: data })
    },
    getTeacherInfo: function(teacherId) {
      return request({ url: 'user/teacherInfo', data: { teacherId: teacherId } })
    },
    orderCommit: function(data){
      return request({ url: 'order/create', type:'post', data: data })
    },
    orderPay: function(data) { // 获取支付信息
      return request({ url: 'pay/api/v1/pay', type: 'post', data: data })
    },
    getActivity:function(data){
      return request({ url: 'wxActivity/getActivityInfo', data: data })
    },
    bindUserRelationship:function(data){
      return request({ url: 'wxActivity/bindUserRelationship', data: data })
    },
    modifyActivityStatus:function(data){
      return request({ url: 'wxActivity/modifyActivityStatus', data: data })
    },
    isBuyClass:function(productId){
      return request({ url: 'product/isBuyClass', data: { productId:productId, token: getLocalStroge('token') } })
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

  template.defaults.imports.dateFormatFilter = function(str, format) {
    return new Date(str).Format(format)
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

  common.createRedirectUri = function(type,appid) {
    var redirectUri = location.href.replace(/#.*/, '')
      .replace(/(code|state|t)=[^&]+[&]?/g, '')
      .replace(/&$/, '')
      .replace(/\?$/, '')
      .replace(location.origin, 'http://codeproxy.chaisenwuli.com'),
      baseUrl = '';
      appid = appid || common.appid;
    if(location.href.indexOf('://h5.test.zongjie.com') != -1){
      redirectUri += redirectUri.indexOf('?') == -1 ? '?t=5' : '&t=5';
    }else if(location.href.indexOf('://h5.zongjie.com') != -1){
      redirectUri += redirectUri.indexOf('?') == -1 ? '?t=6' : '&t=6';
    }else if(location.href.indexOf('://tjh5.test.zongjie.com') != -1){
      redirectUri += redirectUri.indexOf('?') == -1 ? '?t=7' : '&t=7';
    }else if(location.href.indexOf('://tjh5.zongjie.com') != -1){
      redirectUri += redirectUri.indexOf('?') == -1 ? '?t=8' : '&t=8';
    }else if (location.href.indexOf('https://h5.chaisenwuli.com') != -1) {
      redirectUri += redirectUri.indexOf('?') == -1 ? '?t=1' : '&t=1';
    } else {
      redirectUri += redirectUri.indexOf('?') == -1 ? '?t=3' : '&t=3';
    }
    redirectUri = encodeURIComponent(redirectUri);
    if (type == 'user') {
      return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid + "&redirect_uri=" + redirectUri + "&response_type=code&scope=snsapi_userinfo&state=null#wechat_redirect";
    }
    return "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid + "&redirect_uri=" + redirectUri + "&response_type=code&scope=snsapi_base&state=null#wechat_redirect";
  }

  common.getOpenId = function(type) {
    var dtd = $.Deferred(),
      _obj = urlGet(),
      baseUrl = common.createRedirectUri(type);
    var openId = getLocalStroge('openId'),
      unionId = getLocalStroge('unionId');
    if (unionId && openId) {
      dtd.resolve(openId, unionId);
    } else if (type == 'base' && openId) {
      dtd.resolve(openId);
    } else if (_obj.code) {
      actions.getOpenId({
        code: _obj.code,
        scope: type == 'base' ? 0 : 1,
        appId: common.appid
      }).done(function(res) {
        if (res.code == 0 && res.data.openId) {
          setLocalStroge('openId', res.data.openId);
          if (res.data.unionId) {
            setLocalStroge('unionId', res.data.unionId);
            dtd.resolve(res.data.openId, res.data.unionId);
          } else {
            dtd.resolve(res.data.openId);
          }
        } else {
          location.replace(baseUrl);
        }
      })
    } else {
      location.replace(baseUrl);
    }
    return dtd;
  }


  common.getSpeacialOpenId = function(type,appid) {
    var dtd = $.Deferred(),
      _obj = urlGet(),
      baseUrl = common.createRedirectUri(type,appid),
      openId = common.getLocalStroge(appid + 'openId'),
      unionId = common.getLocalStroge(appid + 'unionId');
    if (unionId && openId) {
      dtd.resolve(openId, unionId);
    } else if (type == 'base' && openId) {
      dtd.resolve(openId);
    } else if (_obj.code) {
      actions.getOpenId({
        code: _obj.code,
        scope: type == 'base' ? 0 : 1,
        appId: appid
      }).done(function(res) {
        if (res.code == 0 && res.data.openId) {
          setLocalStroge(appid + 'openId', res.data.openId);
          if (res.data.unionId) {
            setLocalStroge(appid + 'unionId', res.data.unionId);
            dtd.resolve(res.data.openId, res.data.unionId);
          } else {
            dtd.resolve(res.data.openId);
          }
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

  common.initialize = function(callBack,type) {
    var params = urlGet();
    common.getOpenId(type).done(function(openId) {
      common.initWeixinConfig().done(function() {
        callBack();
      })
    })
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
    createAlert: createAlert
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
