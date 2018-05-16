$(function() {
  var dom = $('#container'),
    product = null,
    activity = null,
    addressList = [],
    address = null,
    user = null,
    token = common.getLocalStroge('token'),
    _obj = common.urlGet();

  /**
   * [initialize description]
   * @return {[type]} [description]
   * 1. 获取openID
   * 2. 登录  活动
   *
   */
  function renderPage(){
    getProduct();
    var isStop = false;
    var startTime = new Date(activity.mpActivityInfo.begintime),
      endTime = new Date(activity.mpActivityInfo.endtime),
      nowTime = new Date(activity.today);
    isStop = nowTime.getTime() >= startTime.getTime() && nowTime.getTime() <= endTime.getTime();
    isStop = activity.mpActivityInfo.productnum == activity.mpActivityInfo.receivenum;
    var html = template('tpl-index',{activity:activity,address:address,isStop:isStop})
    dom.find('.body').html(html);
  }

  function initialize() {
    if (token) { // 获取活动 地址
      $.when(getActivity(),getAddressList(), getUser()).done(function(res1, res2, res3) {
        if (user && addressList.length > 0) {
          address = getAddress(_obj.addressId || user.addressid, addressList);
        }
        renderPage();
      })
    } else { // 获取活动
      getActivity().done(function(res) {
        if (res.code == 0) {
          renderPage();
        }
      });
    }
  }

  function getProduct(){
    return common.actions.getProductDetail({
      courseId: 0,
      productId: activity.mpActivityInfo.productid
    }).done(function(res){
      if(res.code == 0){
        product = res.data
      }
    })
  }

  function getActivity() {
    return common.actions.getActivity({
      openId: _obj.sourceOpenId,
      activityId: _obj.activityId
    }).done(function(res) {
      if (res.code == 0) {
        activity = res.data
      }
    })
  }

  function getUser() {
    return common.actions.getUser().done(function(res) {
      if (res.code == 0) {
        user = res.data;
      }
    })
  }

  function getAddressList() {
    return common.actions.getAddressList().done(function(res) {
      if (res.code == 0) {
        addressList = res.data || [];
      }
    })
  }

  function getAddress(id, addressList) {
    for (var i = 0; i < addressList.length; i++) {
      if (addressList[i].id == id) return addressList[i];
    }
    return addressList[0]
  }

  function getBooks() {
    common.actions.orderCommit({
      token:token,
      courseId: product.courseId,
      productId: product.id,
      price: product.price,
      expressAddress: address.all,
      expressName: address.name,
      expressPhone: address.phone,
      orderType:3
    }).done(function(res) {
      if(res.code == 0){
        var orderId = res.data.orderId;
        common.actions.orderPay({
          token:token,
          orderId:res.data.orderId,
          openId: common.getLocalStroge('openId'),
          orderSource:3,
          payType: 1,
          successUrl:''
        }).done(function(res2){
          if(res2.code == 0){
            modifyActivityStatus(_obj.sourceOpenId,_obj.activityId,orderId)
          }
        })
      }else if(res.code == 36){
        modifyActivityStatus(_obj.sourceOpenId,_obj.activityId)
      }
    })
  }

  function bindEvent() {
    dom.on('click', '.go-address', function() {
      if (token) {
        location.href = './address.html?' + common.stringify({
          callBackUrl:'./index.html',
          activityId: _obj.activityId,
          sourceOpenId:_obj.sourceOpenId,
          selectId: address ? address.id : -1
        })
      } else {
        location.href = './login.html?' + common.stringify({
          callBackUrl: location.href
        })
      }
    })

    dom.on('click', '.btn-get', function() {
      if (token) {
        if (!address) return common.toast('请选择地址');
        getBooks();
      } else {
        location.href = './login.html?' + common.stringify({
          callBackUrl: location.href
        })
      }
    })

    dom.on('click','.btn-unfinished',function(){
      common.toast('还差' + (activity.mpActivityInfo.limitnum - activity.wechatUserInfoLists.length) + '人即可领书');
    })

    dom.on('click','.btn-order',function(){
      location.href = (location.origin.indexOf('h5.chaisenwuli.com') != -1 ? '//www.zongjie.com' : '//www.test.chaisenwuli.com') + '/setting/orders'
    })
  }

  function modifyActivityStatus(openId, activityId, orderId) {
    common.actions.modifyActivityStatus({
      openId: openId,
      activityId: activityId,
    }).done(function(res){
      if(res.code == 0){
        common.createAlert('领取成功');
        initialize();
      }
    })
  }

  common.initialize(function() {
    common.actions.getToken({
      openId: common.getLocalStroge('openId'),
      unionId: common.getLocalStroge('unionId') || ''
    }).done(function(res) {
      if (res.code == 0 && res.data.token) {
        token = res.data.token;
        common.setLocalStroge('token', res.data.token)
      }
      initialize();
    })

    bindEvent();
    wx.ready(function() {
      wx.showMenuItems({
        menuList: ['menuItem:share:appMessage', 'menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
      });
      var wxData = {
        title: '【团购】好课成团立享优惠',
        link: common.shareUrl,
        desc: '2人成团，即可立享优惠,24小时内，拼团失败，全额原路退回',
        imgUrl: 'https://zongjiewebimg.chaisenwuli.com/activitys/groupon/img/icon-share-icon.png'
      }
      wx.onMenuShareAppMessage(wxData);
      wx.onMenuShareTimeline(wxData);
    })
  }, 'user')
});
