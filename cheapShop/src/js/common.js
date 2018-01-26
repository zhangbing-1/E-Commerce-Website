var common = {};
$(function() {
  var version = '1.0.3';
  common.baseUrl = 'http://www.chaisenwuli.com/zjwh5/';
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
  function getSign(param){
    var NOISE = 'Daf24Ed57Da77D6Ef1855A709dE946';
    var paramStr = [],paramStrSorted = [];
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
      _options = {}
      _data = {};
    !isHideLoading && loading.show();
    $.extend(_options, {
      type: "GET",
      dataType: 'json',
      timeout: 10000,
    }, options)
    _options.type = _options.type.toUpperCase();
    _options.url = '//api.chaisenwuli.com/' + _options.url;
    $.extend(_data, _options.data || {});
    _data.timestamp = new Date().Format();
    _data.sign = getSign(_data);
    _options.data = stringify(_data);


    return $.ajax(_options)
      .done(function(res) {
        !isHideLoading && loading.hide();
        if(res.code == 1){
          removeLocalStroge('token');
          location.replace('./login.html?' + common.stringify({callbackUrl:location.href}));
        }else if (res.code !== 0 && !isHideToast) {
          common.toast(res.message);
        }
      }).fail(function() {
        !isHideLoading && loading.hide();
        !isHideToast && common.toast('网络异常,请刷新重试');
      });
  }

  function Loading() {
    this.elem = $('<div class="loading-layer"><div class="loading-inner"><img src="images/loading.png" /></div></div>');
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

  function createToast(text) {
    var toast = $('<div class="container-toast">' + text + '</div>');
    toast.appendTo('body').fadeIn('fast', function() {
      setTimeout(function() {
        toast.fadeOut('fast', function() { toast.remove() });
      }, 3000)
    });
  }

  function createLoading() {
    return new Loading();
  }

  function getLocalStroge(key) {
    return localStorage.getItem('onToThree-' + key + '-' + version);
  }

  function setLocalStroge(key, value) {
    localStorage.setItem('onToThree-' + key + '-' + version, value);
  }

  function removeLocalStroge(key){
    localStorage.removeItem('onToThree-' + key + '-' + version);
  }

  var actions = {
    getJsConfig: function() {
      return request({ url: 'wx/createUrlSig', data:{url:location.href.split('#')[0]}});
    },
    getOpenId: function(code) {
      return request({ url: 'wx/authInfo', data: { code: code } });
    },
    getTokenByOpenId: function(openId) {
      return request({ url: 'user/getToken', data: { openId: openId } }, false, true);
    },
    getCode: function(phone) {
      return request({ url: 'user/verifyCode', data: { phone: phone } })
    },
    login: function(phone, code, openId) {
      return request({ url: 'user/loginWx', type: 'post', data: { phone: phone, code: code, openId: openId } })
    },
    getForwardStatus:function() {
      return request({ url: 'activity/forwardStatus', data: { openId: getLocalStroge('openId') } })
    },
    getOrderStatus:function(token) {
      return request({ url: 'activity/getStatus', data: { token: getLocalStroge('token') } })
    },
    doForward:function() {
      return request({ url: 'activity/forward', type: 'post', data: { openId: getLocalStroge('openId') } })
    },
    getUserByToken:function() {
      return request({ url: 'user/studentInfo', data: { token: getLocalStroge('token') } })
    },
    commitOrder:function(data) {
      return request({ url: 'activity/submit', type: 'post', data: data })
    },
    weixinPay:function(orderId){
      return request({ url: 'pay/wexin', type: 'post', data: {orderId:orderId, token:getLocalStroge('token')}})
    },
    getAreaList:function(type,parentId){
       return request({ url: 'area/select', data: {type:type, parentId: parentId}},true,true)
    },
    getActivityStatus:function(){
      return request({ url: 'activity/activityStatus'})
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
  var jsApiList = [ 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'translateVoice', 'startRecord', 'stopRecord', 'onRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'];
  common.initWeixinShare = function(callback) {
    wxData = {
      title: "柴森物理，寒春网课讲义一元购",
      link: common.baseUrl  + "activitys/cheapShop/index.html",
      desc: "柴森老师，独家讲义，一元包邮三本，仅限10000本",
      imgUrl: common.baseUrl + "activitys/cheapShop/images/icon-share.png"
    };
    actions.getJsConfig().done(function(res) {
      if (res.code == 0) {
        var config = res.data;
        config.jsApiList = jsApiList;
        wx.config(config);
        wx.ready(function() {
          wx.onMenuShareAppMessage(wxData);
          wx.onMenuShareTimeline($.extend({},wxData,callback || {}));
          wx.onMenuShareQQ(wxData);
        });
      }
    })
  }
  common.initWeixinConfig = function(callback) {
    actions.getJsConfig().done(function(res) {
      if (res.code == 0) {
        var config = res.data;
        config.jsApiList = jsApiList;
        wx.config(config);
        wx.ready(callback);
      }
    })
  }

  function getOpenId(callback) {
    var redirectUri = encodeURIComponent(location.href.replace(/#.*/, '').replace(/(code|state)=[^&]+[&]?/g, '').replace(/&$/, '')),
      _obj = urlGet();
    var baseUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2aca7a726735fd56&redirect_uri=" + redirectUri + "&response_type=code&scope=snsapi_base&state=null#wechat_redirect";
    var openId = getLocalStroge('openId');
    if (openId) {
      callback(openId);
    } else if (_obj.code) {
      actions.getOpenId(_obj.code).done(function(res) {
        if (res.code == 0) {
          setLocalStroge('openId', res.data.openId || '');
          callback(res.data.openId);
        } else {
          location.replace(baseUrl);
        }
      })
    } else {
      location.replace(baseUrl);
    }
  }

  function getTokenByOpenId(openId, callback) {
    actions.getTokenByOpenId(openId).done(function(res) {
      if (res.code == 0) {
        setLocalStroge('token', res.data.token || '');
        callback(res.data.token);
      } else {
        callback('');
      }
    })
  }

  common.getToken = function(callback) {
    var openId = getLocalStroge('openId'),
      token = getLocalStroge('token');
    if (token) {
      callback(token);
    } else if (openId) {
      getTokenByOpenId(openId, callback);
    } else {
      getOpenId(function(openId) {
        getTokenByOpenId(openId, callback);
      })
    }
  }

  common.verify = {
    phone: /^1\d{10}$/,
    captcha: /^\d{4}$/
  }

  function createAreaList(list){
    var arr = [];
    for (var i = 0; i < list.length; i++) {
        arr.push({id:list[i].id, value:list[i].name});
    }
    return arr;
  }

  common.provinceData = function(callback){
    actions.getAreaList(1,0).done(function(res){
      if(res.code == 0){
        callback(createAreaList(res.data))
      }
    });
  }
  common.cityData = function(province,callback){
    actions.getAreaList(2,province).done(function(res){
      if(res.code == 0){
        callback(createAreaList(res.data))
      }
    });
  }
  common.areaData = function(province,city,callback){
    actions.getAreaList(3,city).done(function(res){
      if(res.code == 0){
        callback(createAreaList(res.data))
      }
    });
  }



  $.extend(common, {
    version: version,
    actions: actions,
    getLocalStroge: getLocalStroge,
    setLocalStroge: setLocalStroge,
    removeLocalStroge:removeLocalStroge,
    loading: createLoading,
    toast: createToast,
    urlGet: urlGet,
    stringify: stringify,
  }, true);
})
