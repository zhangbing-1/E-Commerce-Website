var common = {};
$(function() {
  var version = '1.0.0';
  common.baseUrl = '//testapi.chaisenwuli.com/';
  common.prefix = './';
  if (location.href.indexOf("h5.test.chaisenwuli.com") !== -1) {
    common.prefix = "//zongjiewebimg.chaisenwuli.com/test/activitys/survey/";
  } else if(location.href.indexOf('h5.chaisenwuli.com') !== -1) {
    common.prefix = "//zongjiewebimg.chaisenwuli.com/activitys/survey/";
    common.baseUrl = "//api.chaisenwuli.com/";
  }
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
      !isHideLoading && loading.hide();
      if (res.code == 1) {
        removeLocalStroge('token')
        location.href = './login.html';
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
    commonSurvey: function(data) {
      return request({ url: 'user/addQuestionnaire', type: 'post', data: data });
    },
    getUser: function(data){
      return request({ url: 'user/userInfo', data: data });
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
  }, true);
});
