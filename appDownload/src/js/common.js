var common = {};
$(function() {
  var version = '1.0.0';
  common.baseUrl = '//testapi.chaisenwuli.com/';
  common.prefix = './';
  if (location.href.indexOf("h5.test.chaisenwuli.com") !== -1) {
    common.prefix = "//zongjiewebimg.chaisenwuli.com/test/activitys/appDownload/";
  }else if (location.href.indexOf('h5.chaisenwuli.com') !== -1) {
    common.prefix = "//zongjiewebimg.chaisenwuli.com/activitys/appDownload/";
    common.baseUrl = "//api.chaisenwuli.com/";
  }
  var u = navigator.userAgent;
  common.isWeixin = u.toLowerCase().match(/MicroMessenger/i) == "micromessenger";
  common.isPhone = u.indexOf('iPhone') > -1;
  common.isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
  common.isWxApp = function(){ return window.__wxjs_environment == 'miniprogram' };
  common.shareUrl = location.origin + "/activitys/appDownload/";

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
      setTimeout(function(){
        !isHideLoading && loading.hide();
      },500)

      if (res.code == 1) {
        removeLocalStroge('token')
        setTimeout(function(){
          if(common.isWxApp()){
            wx.miniProgram.navigateTo({
              url:'/pages/login/wxLogin?' + common.stringify({
                callBackUrl: common.getHref()
              })
            })
          }else{
            location.href = './login.html?' + stringify({
              callBackUrl:location.href
            });
          }
        },300)
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

  common.getHref = function(){
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

  common.createShare = function(){
    var dtd = $.Deferred();
    var share = $('<div class="share-layer"><span>点击右上角按钮，<br/>选择浏览器打开</span><img src="' + common.prefix + '/img/icon-arrow.png"></div>')
    share.appendTo('body').fadeIn('fast', function() {
      share.on('click', function() {
        dtd.resolve(confirm);
        share.remove()
      })
    })
    return dtd
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

  function getLocalStroge(key) {
    return localStorage.getItem('activity-' + key + '-' + version);
  }

  function setLocalStroge(key, value) {
    localStorage.setItem('activity-' + key + '-' + version, value);
  }

  function removeLocalStroge(key) {
    localStorage.removeItem('activity-' + key + '-' + version);
  }

  var actions = {
    getVersion: function(){
      return request({ url: 'app/api/v1/version', type:'POST' })
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

  template.defaults.imports.dateFormatFilter = function(str,format) {
    return new Date(str).Format(format)
  }

  template.defaults.imports.weekFilter = function(str,format) {
    return ["周日","周一","周二","周三","周四","周五","周六"][new Date(str).getDay()]
  }

  template.defaults.imports.bookStatusFilter = function(status) {
    return ["","等待成团","已成团","拼团成功"][status]
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
    createConfirm: createConfirm
  }, true);
});
