$(function() {
  var params = common.urlGet();
  var dom = $('#container');
  var activity = null, product = null, address = null, user = null, coupon = null ,qrInfo = null ,payType = 1;

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
              groupId: activity.bookingId || 0,
              gradeId: common.params.gradeId,
              type: common.params.type
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
    $.when(
      common.actions.getUser(),
      common.actions.getAddressList(),
      common.actions.getCouponMatchProduct({
        courseId: product.courseId,
        productId: product.id,
        orderPrice: activity.price
      })).done(function(data1,data2,data3){
      var res1 = data1[0], res2 = data2[0], res3 = data3[0];
      if(res1.code == 0 && res2.code == 0 && res3.code == 0){
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

        if(params.couponId){
          coupon = params.couponId == -1 ? {
            id:0,
            denomination:0,
          } : {
            id: params.couponId,
            thresholdPrice: params.thresholdPrice,
            denomination: params.choosePrice
          }
        }else{
          coupon = res3.data;
        }

        if(isShop){
          activity.infactPrice = common.floatTool.subtract(activity.price,user.couponDiscountPrice);
        }else if(coupon){
          activity.infactPrice =  common.floatTool.subtract(activity.price,coupon.denomination) ;
        }else{
          activity.infactPrice = activity.price;
        }

        activity.infactPrice = activity.infactPrice < 0 ? 0 : activity.infactPrice;
        if(!common.isClient && activity.wechatEnable == 1){
          common.actions.getActivityTeacherWxInfo({
            activityId: activity.wechatId
          }).done(function(data4){
            if(data4.code == 0 && ((isShop && activity.bookingStatus == 1) || activity.bookingStatus == 2)){
              if (data4.data) {
                if (data4.data.tabs.length > 0) {
                  var index = 0
                  if(data4.data.tabs.length > 1){
                    index = parseInt(Math.random()*(data4.data.tabs.length),10);
                  }
                  qrInfo = data4.data.tabs[index]
                }
              }
            }
            var html = template('tpl-main', { activity: activity,
              product: product,
              user: user,
              isShop: isShop,
              address: address,
              isWxApp: common.isWxApp(),
              isClient: common.isClient,
              coupon: coupon,
              qrInfo: qrInfo });
            dom.html(html);
          })
        }else{
          var html = template('tpl-main', { activity: activity,
            product: product,
            user: user,
            isShop: isShop,
            address: address,
            isWxApp: common.isWxApp(),
            isClient: common.isClient,
            coupon: coupon,
            qrInfo: qrInfo });
          dom.html(html);
        }


      }
    })
  }

  function pay() {
    if(common.isWxApp()){
      wx.miniProgram.navigateTo({
        url:'/pages/h5/bridgeView?' + common.stringify({
          groupActivityId: activity.activityId,
          groupBookingId: activity.bookingId || 0,
          expressAddress: address ? address.all : '',
          expressPhone: address ? address.phone : '',
          expressName: address ? address.name : '',
          callBackUrl: common.getHref()
        })
      })
    }else if(common.isClient){
      common.actions.groupActivityPay({
        groupActivityId: activity.activityId,
        groupBookingId: activity.bookingId || 0,
        expressAddress: address ? address.all : '',
        expressPhone: address ? address.phone : '',
        expressName: address ? address.name : '',
        payType: payType,
        userCouponId: coupon ? coupon.id : 0,
        couponDiscountPrice: coupon ? coupon.denomination : 0,
        orderSource: common.isPhone ? 6 : 5
      }).done(function(res) {
        if (res.code == 0) {
          var params = null, config = res.data;
          if(payType == 1){
            params = {
              partnerid:config.partnerId,
              prepayid:config.prepayId,
              noncestr:config.nonceStr,
              timestamp:config.timeStamp,
              packageName:config.packageValue,
              sign:config.sign
            }
          } else {
            params = {
              orderInfo: config,
            }
          }
          bridge.call('callNavPay', { ptype: payType, params:params })
        } else {
          common.toast(res.message);
        }
      })
    }else{
      common.actions.groupActivityPay({
        groupActivityId: activity.activityId,
        groupBookingId: activity.bookingId || 0,
        expressAddress: address ? address.all : '',
        expressPhone: address ? address.phone : '',
        expressName: address ? address.name : '',
        openId: common.getLocalStroge('openId'),
        userCouponId: coupon ? coupon.id : 0,
        couponDiscountPrice: coupon ? coupon.denomination : 0,
        payType: 1,
        orderSource: 3
      }).done(function(res) {
        if (res.code == 0) {
          common.replace('//www.zongjie.com/pay.html',{
            type: 'groupon',
            callBackUrl: location.href,
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            packageValue: res.data.packageValue,
            signType: res.data.signType,
            paySign: res.data.paySign
          })
          // location.replace('//www.zongjie.com/pay.html?' + common.stringify({
          //   type: 'groupon',
          //   callBackUrl: location.href,
          //   timeStamp: res.data.timeStamp,
          //   nonceStr: res.data.nonceStr,
          //   packageValue: res.data.packageValue,
          //   signType: res.data.signType,
          //   paySign: res.data.paySign
          // }));
        } else {
          common.toast(res.message);
        }
      })
    }
  }

  function payResult(res){
    if(res == 1){
      location.reload()
    }else{
      common.toast('支付失败');
    }
  }

  function bindEvent() {
    dom.on('click', '.btn-pay', function(e) {
      if(product.merchandises.length > 0 && !address) {
        return common.toast('请选择地址');
      }
      pay();
    })

    dom.on('click','.go-address',function(){
      var data = $.extend({},params,{
        selectId: address ? address.id : -1 ,
        callBackUrl: './order.html'
      })
      common.go('./address.html',data);
      // location.href = './address.html?' + common.stringify(data);
    })

    dom.on('click','.go-coupon',function(){
      location.href = '/wap/index.html?'
        + common.stringify($.extend({},params,{
          callBackUrl: location.origin + location.pathname,
          type: 'groupon',
          atype: common.params.type
        })) + '#/usecoupons?' + common.stringify({
          courseId: product.courseId,
          productId: product.id,
          couponId: coupon ? coupon.id : -1 })
    })

    dom.on('click','.btn-share',function(){
      if(common.isWxApp()){
        common.toAppShare(activity);
      }else if(common.isClient){
        if(!common.isPhone && dsBridge.call('getVersionCode') < 134){
          common.createAlert('分享请先升级到最新版本 <br/>请进入 <br/>【我的】->【检测更新】升级app').done(function(confirm){
            confirm.remove();
          })
        }else{
          bridge.call('callNavShare',{
            title: '【团购】' + activity.activityTitle,
            link: common.shareUrl + "detail.html?" + common.stringify({
              id: activity.activityId,
              groupId: activity.bookingId || 0,
              gradeId: common.params.gradeId,
              type: common.params.type
            }),
            desc: activity.activityGroupCount + '人成团,各减' + (activity.originalPrice-activity.price) + '元',
            imgUrl: 'https://zongjiewebimg.chaisenwuli.com/activitys/groupon/img/icon-share-icon.png'
          });
        }

      }else{
        var share = common.createShare()
        dom.append(share);
      }
    })

    dom.on('click','.go-my-course',function(){
      if(common.isWxApp()){
        wx.miniProgram.switchTab({
          url: '/pages/mycourse/myCourse'
        })
      }else if(common.isClient){
        if(product.classProducts.length == 1){
          bridge.call('callNavPage', {
            "page": "page_my_course_detail",
            "params": {
              "class_id":product.classProducts[0].id,
              "product_id":product.id,
              "course_id":product.courseId
            }
          });
        }else{
          bridge.call('callNavPage', {page:'page_my_course'});
        }
      }else{
        location.href = location.origin + '/activitys/appDownload/'
      }
    })

    dom.on('click','.qrcode-layer',function(){
      dom.find('.qrcode-layer').remove()
    })

    if(common.isClient){
      bridge.register('payResult',payResult);

      dom.on('click','.pay-method .item',function(){
        payType = $(this).data('id');
        dom.find('.pay-method .item').removeClass('selected');
        $(this).addClass('selected')
      })
    }
    dom.on('click','.qrcode-layer-bg',function(){
      dom.find('.qrcode-layer-bg').remove()
    })
  }

  common.initialize(function(){
    if(!common.getLocalStroge('token')){
      common.tokenExpire();
    }
    renderActivityInfo();
    bindEvent();
  })

});
