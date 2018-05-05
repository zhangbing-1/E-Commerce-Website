$(function() {
  var params = common.urlGet();
  var dom = $('#container');
  var activity = null, product = null, address = null, user = null;

  if(!common.getLocalStroge('token')){
    if(common.isWxApp){
      wx.miniProgram.navigateTo({
        url:'/pages/login/wxLogin?' + common.stringify({
          callBackUrl: location.href
        })
      })
    }else{
      location.href = './login.html?' + common.stringify({
        callBackUrl:location.href
      })
    }
  }

  function renderActivityInfo() {
    var data = {
      groupActivityId: params.id,
      groupBookingId: params.groupId || 0,
    };
    if (common.getLocalStroge('token')) {
      data.token = common.getLocalStroge('token');
    }
    common.actions.getActivityInfo(data).done(function(res) {
      if (res.code == 0) {
        renderProductDetail(res.data);
        activity = res.data;
        wx.ready(function() {
          wx.showMenuItems({
            menuList: ['menuItem:share:appMessage','menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
          });
          var wxData = {
            title: '【团购】' + activity.activityTitle,
            link: common.shareUrl + "detail.html?" + common.stringify({
              id: activity.activityId,
              groupId: activity.bookingId || 0
            }),
            desc: activity.activityGroupCount + '人成团,各减' + (activity.originalPrice-activity.price) + '元',
            imgUrl: 'https://zongjiewebimg.chaisenwuli.com/activitys/groupon/img/icon-share-icon.png'
          }
          wx.onMenuShareAppMessage(wxData);
          wx.onMenuShareTimeline(wxData);
        })
      }
    })
  }

  function renderProductDetail(activity) {
    common.actions.getProductDetail({
      courseId: activity.courseId,
      productId: activity.productId
    }).done(function(res) {
      if (res.code == 0) {
        renderPeriodTeacher(activity, res.data)
        product = res.data;
      }
    })
  }

  function renderPeriodTeacher(activity, product) {
    var teacherIds = [],
      teachers = [],
      actions = [];
    for (var i = 0; i < product.classProducts.length; i++) {
      var classes = product.classProducts[i];
      for (var j = 0; j < classes.periodList.length; j++) {
        var period = classes.periodList[j];
        if ($.inArray(period.teacherId, teacherIds) == -1) {
          teacherIds.push(period.teacherId);
        }
      }
    }
    for (var i = 0; i < teacherIds.length; i++) {
      actions.push(common.actions.getTeacherInfo(teacherIds[i])
        .done(function(res) {
          if (res.code == 0) {
            teachers.push(res.data);
          }
        }))
    }
    $.when.apply($, actions).done(function() {
      formatProductData(activity, product, teachers);
    });
  }

  function getTeacherById(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id == id) return list[i];
    }
    return {}
  }

  function getAddress(id,addressList){
    for (var i = 0; i < addressList.length; i++) {
      if (addressList[i].id == id) return addressList[i];
    }
    return addressList[0]
  }

  function formatProductData(activity, product, teachers) {
    product.descriptionList = product.description.split(';');
    var start = null,
      end = null,
      names = [];
    for (var i = 0; i < product.classProducts.length; i++) {
      var classes = product.classProducts[i];
      for (var j = 0; j < classes.periodList.length; j++) {
        var period = classes.periodList[j],
          beginTime = new Date(period.beginTime),
          endTime = new Date(period.endTime);

        if (!start) {
          start = beginTime;
        } else {
          start = beginTime.getTime() < start.getTime() ? beginTime : start;
        }

        if (!end) {
          end = endTime;
        } else {
          end = endTime.getTime() > end.getTime() ? endTime : end;
        }
        period.teacher = getTeacherById(teachers, period.teacherId);
        if ($.inArray(period.teacher.name, names) == -1) {
          names.push(period.teacher.name);
        }
      }
    }

    product.timeSlot = end && start ? (start.Format("MM月dd日") + "-" + end.Format("MM月dd日")) : '';
    product.names = names.slice(0, 2).join(',');

    // 活动：0-创建 1-开始 2-结束
    // 拼团单：0-创建 1-拼团中 2-拼团成功 3-拼团失败
    // 用户支付状态：0-支付中 1-支付失败 2-支付成功 3-已退款 4-退款失败
    // activity.activityStatus = 1;
    // activity.bookingStatus = 3;
    $.when(common.actions.getUser(),common.actions.getAddressList()).done(function(data1,data2){
      var res1 = data1[0], res2 = data2[0];
      if(res1.code == 0 && res2.code == 0){
        var isShop = false;
        if(activity.bookingUsers){
          for(var i = 0; i < activity.bookingUsers.length; i++){
            if(activity.bookingUsers[i].userId == res1.data.id){
              isShop = true;
              user = activity.bookingUsers[i];
            }
          }
        }
        if(res2.data && res2.data.length > 0){
          address = getAddress(params.addressId||res1.data.addressid,res2.data);
        }
        var html = template('tpl-main', { activity: activity, product: product, user: user, isShop: isShop ,address: address});
        dom.html(html);
      }
    })
  }

  function pay() {
    if(common.isWxApp){
      wx.miniProgram.navigateTo({
        url:'/pages/h5/bridgeView?' + common.stringify({
          groupActivityId: activity.activityId,
          groupBookingId: activity.bookingId || 0,
          expressAddress: address.all,
          expressPhone: address.phone,
          expressName: address.name,
          callBackUrl:location.href
        })
      })
    }else{
      common.actions.groupActivityPay({
        groupActivityId: activity.activityId,
        groupBookingId: activity.bookingId || 0,
        expressAddress: address.all,
        expressPhone: address.phone,
        expressName: address.name,
        openId: common.getLocalStroge('openId'),
        payType: 1,
        orderSource: 3
      }).done(function(res) {
        if (res.code == 0) {
          location.replace('//www.zongjie.com/pay.html?' + common.stringify({
            type: 'groupon',
            callBackUrl: location.href,
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            packageValue: res.data.packageValue,
            signType: res.data.signType,
            paySign: res.data.paySign
          }));
        } else {
          common.toast(res.message);
        }
      })
    }
  }

  function bindEvent() {
    dom.on('click', '.btn-pay', function(e) {
      if(!address) common.toast('请选择地址');
      pay();
    })

    dom.on('click','.go-address',function(){
      var data = $.extend({},params,{
        selectId: address ? address.id : -1 ,
        callBackUrl: './order.html'
      })
      location.href = './address.html?' + common.stringify(data);
    })

    dom.on('click','.btn-share',function(){
      if(common.isWxApp){
        var timeSlot = new Date(activity.activityStartTime).Format('MM月dd日') + '-' + new Date(activity.activityEndTime).Format('MM月dd日');
        wx.miniProgram.navigateTo({
          url:'/pages/h5/shareView?' + common.stringify({
            id: activity.activityId,
            bookingId: activity.bookingId,
            title: activity.activityTitle,
            timeSlot: timeSlot,
            desc: activity.activityGroupCount + '人成团,各减' + (activity.originalPrice-activity.price) + '元',
            shareTitle: '【团购】' + activity.activityTitle,
            shareDesc: activity.activityGroupCount + '人成团,各减' + (activity.originalPrice-activity.price) + '元',
            shareImg: '',
            callBackUrl:location.href
          }),
        })
      }else{
        var share = common.createShare()
        dom.append(share);
      }
    })

    dom.on('click','.go-my-course',function(){
      if(common.isWxApp){
        wx.miniProgram.switchTab({
          url: '/pages/mycourse/myCourse'
        })
      }else{
        var qrcode = common.createQrcode()
        dom.append(qrcode);
      }
    })

    dom.on('click','.qrcode-layer',function(){
      dom.find('.qrcode-layer').remove()
    })

  }

  common.initialize(function(){
    renderActivityInfo();
    bindEvent();
  })

});
