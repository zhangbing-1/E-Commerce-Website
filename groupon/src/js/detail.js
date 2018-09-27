$(function() {
  var params = common.urlGet();
  var dom = $('#container');
  var activity = null, product = null;

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
        if(res.data.activityId == 0){
          dom.html('<div class="activity-null">活动不存在</div>');
          return;
        }

        renderProductDetail(res.data);
        activity = res.data;

        if(activity.activityRemainingTime <= 0 ){
          activity.activityStatus = 2;
        }

        if(activity.remainingTime <= 0 && activity.bookingStatus == 1){
          activity.bookingStatus = 3;
        }

        activity.surplusUser = new Array(activity.leftCount);
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
          };
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

    product.timeSlot = end && start ? (start.Format("yyyy年MM月dd日") + "-" + end.Format("yyyy年MM月dd日")) : '';
    product.names = names.slice(0, 2).join(',');

    // 活动：0-创建 1-开始 2-结束
    // 拼团单：0-创建 1-拼团中 2-拼团成功 3-拼团失败
    // 用户支付状态：0-支付中 1-支付失败 2-支付成功 3-已退款 4-退款失败
    // activity.activityStatus = 1;
    // activity.bookingStatus = 3;

    if (common.getLocalStroge('token')) {
      common.actions.getUser().done(function(res) {
        if(res.code == 0){
          var isShop = false;
          if(activity.bookingUsers){
            for(var i = 0; i < activity.bookingUsers.length; i++){
              if(activity.bookingUsers[i].userId == res.data.id) isShop = true;
            }
          }
          getActivityList(activity,product,isShop);
        }
      })
    } else {
      getActivityList(activity,product,false);
    }
  }

  function getActivityList(activity,product,isShop){
    common.actions.getActivityList(1).done(function(res){
      if(res.code == 0){
        var isMore = res.data.length > 1;
        var html = template('tpl-main', { activity: activity, product: product, isShop: isShop, isMore:isMore });
        dom.html(html);
        startCountDown();
      }
    })
  }

  function startCountDown(){
    if(activity.activityStatus == 2) return;

    if(activity.bookingStatus == 1){
      countDown(activity.remainingTime);
    }else{
      countDown(activity.activityRemainingTime);
    }

    function countDown(time){
      var days = Math.floor(time / (60 * 60 * 24));
      var hours = Math.floor((time - days * 60 * 60 * 24) / (60 * 60));
      var minute = Math.floor((time - days * 60 * 60 * 24 - hours * 60 * 60) / 60);
      var second = Math.floor((time - days * 60 * 60 * 24 - hours * 60 * 60 - minute * 60));
      dom.find('.time-box').html(' <span>'+days+'</span>天<span>'+hours+'</span>时<span>'+minute+'</span>分<span>'+second+'</span>秒')
      setTimeout(function(){
        if(time > 0){
          countDown(--time);
        }else{
          renderActivityInfo();
        }
      },1000)
    }
  }

  function pay(id,groupId) {
    if(common.isWxApp()){
      wx.miniProgram.navigateTo({
        url:'/pages/h5/bridgeView?' + common.stringify({
          groupActivityId: id,
          groupBookingId: groupId,
          expressAddress: '',
          expressPhone: '',
          expressName: '',
          callBackUrl: common.shareUrl + "detail.html?id=" + id + "&groupId=" + groupId
        })
      })
    }else if(common.isClient){
      var payType = 1;
      common.actions.groupActivityPay({
        groupActivityId: id,
        groupBookingId: groupId,
        expressAddress: '',
        expressPhone: '',
        expressName: '',
        payType: 1,
        orderSource: 5
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
        groupActivityId: id,
        groupBookingId: groupId,
        expressAddress: '',
        expressPhone: '',
        expressName: '',
        openId: common.getLocalStroge('openId'),
        payType: 1,
        orderSource: 3
      }).done(function(res) {
        if (res.code == 0) {
          location.replace('//www.zongjie.com/pay.html?' + common.stringify({
            type: 'groupon',
            callBackUrl: common.shareUrl + "detail.html?id=" + id +"&groupId=" + groupId,
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

  function payResult(res){
    if(res == 1){
      location.reload()
    }else{
      common.toast('支付失败');
    }
  }

  function iosPhonePay(){
    if(common.isPhone && common.isWxApp()){
      var html = template('tpl-ios-guide',{ isGroup:params.groupId && params.groupId != 0 && activity.bookingStatus == 1,
        url: 'https://h5.chaisenwuli.com/activitys/groupon/detail.html?id=' + params.id +'&groupId=' + params.groupId||0 });
      dom.html(html);
      var clipboard = new ClipboardJS('.btn-copy');
      clipboard.on('success', function(e) {
        $('.copy-message').show();
        setTimeout(function(){
          $('.copy-message').hide();
        },2000)
      })
      return true;
    }
    return false;
  }

  function bindEvent() {
    dom.on('click', '.group-pay', function(e) {
      if(iosPhonePay()){
        return;
      }
      if (common.getLocalStroge('token')) {
        if(product.merchandises.length > 0 || common.isClient){
          location.href = './order.html?' +  common.stringify({
            id : activity.activityId,
            groupId : activity.bookingId || 0,
          })
        }else{
          pay(activity.activityId,activity.bookingId || 0);
        }
      }else{
        common.tokenExpire();
      }
    })

    dom.on('click','.group-repay',function(){
      if(iosPhonePay()){
        return;
      }
      location.replace('./detail.html?' +  common.stringify({
        id : activity.activityId,
        groupId : 0,
      }));
    })

    dom.on('click','.btn-message',function(){
      var $html = $(template('tpl-rule',{}));
      dom.append($html)
    })

    dom.on('click','.go-list',function(){
      if(iosPhonePay()){
        return;
      }
      location.href = './index.html';
    })

    dom.on('click','.go-order',function(){
      location.href = './order.html?' + common.stringify({
        id : activity.activityId
      })
    })

    dom.on('click','.go-share',function(){
      if(common.isWxApp()){
        common.toAppShare(activity);
      }else if(common.isClient){
        bridge.call('callNavShare',{
          title: '【团购】' + activity.activityTitle,
          link: common.shareUrl + "detail.html?" + common.stringify({
            id: activity.activityId,
            groupId: activity.bookingId || 0
          }),
          desc: activity.activityGroupCount + '人成团,各减' + (activity.originalPrice-activity.price) + '元',
          imgUrl: 'https://zongjiewebimg.chaisenwuli.com/activitys/groupon/img/icon-share-icon.png'
        });
      }else{
        var share = common.createShare()
        dom.append(share);
      }
    })

    dom.on('click','.btn-close',function(){
      $($(this).data('target')).remove();
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
        var qrcode = common.createQrcode()
        dom.append(qrcode);
      }
    })

    dom.on('click','.share-layer',function(){
      dom.find('.share-layer').remove()
    })

    dom.on('click','.qrcode-layer',function(){
      dom.find('.qrcode-layer').remove()
    })

    dom.on('click', '.tab', function(e) {
      if ($(this).hasClass('current')) return;
      var target = $(this).data('target');
      dom.find('.tab').removeClass('current');
      dom.find('.tab-container').hide();
      $(this).addClass('current');
      dom.find(target).show();
    })

    if(common.isClient){
      bridge.register('payResult',payResult);
    }
  }

  common.initialize(function(){
    renderActivityInfo();
    bindEvent();
  })

});
