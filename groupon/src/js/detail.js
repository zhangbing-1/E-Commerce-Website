$(function() {
  var params = common.urlGet();
  var dom = $('#container');
  var activity = null, product = null, bigCourse = null, isBuy = false, player = null, isOldUser = false, isBuyProducts = false;
  function checkIsOldUser(){
    if(common.getLocalStroge('token')){
       common.actions.isOldUser().done(function(res){ //新用户为 1
        if(res.code == 0 && res.data == 1){
          isOldUser = true;
        }else if(res.code == 0 && res.data == 0){
          isOldUser = false;
        }
      })
    }
  }

  function checkBuyProducts(activity){
    if(common.getLocalStroge('token')){
      var isProductAction = null;
      if(common.onlyShopProductOnce.indexOf(activity.productId) != -1){ //
        isProductAction = common.actions.isBuyProducts({productIds:common.onlyShopProductOnce.join(',')})
      }else if(common.onlyShopProductOnce2.indexOf(activity.productId) != -1){
        isProductAction = common.actions.isBuyProducts({productIds:common.onlyShopProductOnce2.join(',')})
      }
      if(isProductAction){
        isProductAction.done(function(res){
          if(res.code == 0 && res.data == 1){
            isBuyProducts = true;
          }else if(res.code == 0 && res.data == 0){
            isBuyProducts = false;
          }
        })
      }
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
        if(res.data.activityId == 0){
          dom.html('<div class="activity-null">活动不存在</div>');
          return;
        }

        renderProductDetail(res.data);
        checkBuyProducts(res.data);
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
              groupId: activity.bookingId || 0,
              gradeId: common.params.gradeId,
              type: common.params.type
            }),
            desc: activity.activityGroupCount + '人成团，各减' + (activity.originalPrice-activity.price) + '元',
            imgUrl: [474,476].indexOf(activity.productId) != -1 ? 'https://zongjiewebimg.chaisenwuli.com/othercloud/icon-share-1001.png' : 'https://zongjiewebimg.chaisenwuli.com/activitys/groupon/img/icon-share-icon.png'
          };
          wx.onMenuShareAppMessage(wxData);
          wx.onMenuShareTimeline(wxData);
        })
      }
    })
  }
  function isBuyProduct(productId) {
    common.actions.isBuyClass(productId).done(function(res) {
      bigCourse = res.data;
      isBuy = bigCourse.isBuy
      // if(bigCourse.isBuy){//已经购买

      // }
      if(bigCourse.bigCourseShowMessage){
        var string = bigCourse.bigCourseShowMessage.replace('\n','<br/>');
        var stringArray = string.split('$')
        bigCourse.stringArray = stringArray;
      }
    })
  }
  function renderProductDetail(activity) {
    isBuyProduct(activity.productId)
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
    common.actions.getActivityList({
      gradeId: common.params.gradeId,
      type: common.params.type,
      page: 1,
      pageSize: 5
    }).done(function(res){
      if(res.code == 0){
        var isMore = res.data.length > 1;
        var html = template('tpl-main', { activity: activity, product: product, isShop: isShop, isMore:isMore, isBuy:isBuy });
        dom.html(html);
        renderToFreeCourse();
        startCountDown();

        if(product.titleVideoUrl && product.titleVideoThumburl ){
          player = new TcPlayer('video', {
            mp4: product.titleVideoUrl, //请替换成实际可用的播放地址
            autoplay: false,      //iOS下safari浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
            coverpic: {
              "style": "stretch",
              "src": product.titleVideoThumburl
            },
            x5_type: 'h5',
            width : $(window).width(),//视频的显示宽度，请尽量使用视频分辨率宽度
            height : $(window).width() / 16 * 9,//视频的显示高度，请尽量使用视频分辨率高度
            systemFullscreen: true
          });
        }
      }
    })
  }

  function getOldCoupon(){
    if(common.getLocalStroge('token')){
      common.actions.getIsGiveCoupon().done(function(res){
        if(res.code == 0 && res.data == 1){
          common.actions.getIsReceiveCoupon().done(function(res){
            if(res.code == 0 && res.data == 0 && dom.find('.banner-get-coupon').length == 0){
              dom.prepend(common.createGetCoupon());
            }
          })
        }
      })
    }
  }

  function renderToFreeCourse(){
    if(!common.isClient && dom.find('.free-course').length == 0){
      dom.prepend(common.createToFreeCourse());
    }
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
  function pay(){
    if(iosPhonePay()){
      return;
    }
    if (common.getLocalStroge('token')) {
      common.go('./order.html',{
        id : activity.activityId,
        groupId : activity.bookingId || 0,
      })
      // location.href = './order.html?' +  common.stringify({
      //   id : activity.activityId,
      //   groupId : activity.bookingId || 0,
      // })
    }else{
      common.tokenExpire();
    }
  }
  function bindEvent() {
    dom.on('click','.video-container-cover',function(e){
      if(common.isClient){
        var version = bridge.call("getVersionCode");
        if ((common.isPhone &&  version > 154) || (common.isAndroid && version > 152)) {
          bridge.call('callNavPage', {page:'play_landscape_video',params:{url:  product.titleVideoUrl}});
        } else  {
          dom.find('.video-container-cover').remove()
          player.play()
        }
      }else{
        dom.find('.video-container-cover').remove()
        player.play()
      }
    })

    dom.on('click', '.group-pay', function(e) {
      if(isOldUser && common.oldUserNoShopProducts.indexOf(product.id) != -1){ // 老用户不能购买
        common.createAlert('本活动仅限新用户参加').done(function(confirm){
          confirm.remove();
        })
        return
      }
      if(isBuyProducts){
        common.createAlert('此类物品仅限团购一次').done(function(confirm){
          confirm.remove();
        })
        return
      }
      if(bigCourse.bigCourseShowMessage != null){
        var $html = $(template('tpl-big-course',{showBigCourseToast:true,buyBigCourse:bigCourse}));
        dom.append($html)
        return
      }
      pay()
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
      common.go('./index.html')
      // location.href = './index.html';
    })

    dom.on('click','.go-order',function(){
      common.go('./order.html',{
        id : activity.activityId
      })
      // location.href = './order.html?' + common.stringify({
      //   id : activity.activityId
      // })
    })

    dom.on('click','.go-share',function(){
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
            imgUrl: [474,476].indexOf(activity.productId) != -1 ? 'https://zongjiewebimg.chaisenwuli.com/othercloud/icon-share-1001.png' : 'https://zongjiewebimg.chaisenwuli.com/activitys/groupon/img/icon-share-icon.png'
          });
        }

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
        location.href = location.origin + '/activitys/appDownload/'
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

    dom.on('click','.banner-get-coupon',function(e){
      location.href = location.origin + '/wap/#/givecoupons';
    })

    dom.on('click','.free-course',function(e){
      location.href = location.origin + '/wap/#/';
    })
    dom.on('click','.big-course-mask',function(e){
      console.log('click')
      dom.find('.big-course-mask').remove()
    })
    dom.on('click','.bigcourse-buy',function(e){
      pay()
      dom.find('.big-course-mask').remove()
    })

    dom.on('click','.bigcourse-see',function(e){
      dom.find('.big-course-mask').remove()
      if(common.isClient){
        var href = location.origin + '/wap/#/detail' + bigCourse.bigCourseUrl;
        bridge.call('openNewLink', href);
      }else{
        location.href = location.origin + '/wap/#/detail' + bigCourse.bigCourseUrl;
      }
    })

    if(common.isClient){
      bridge.register('payResult',payResult);
    }
  }

  common.initialize(function(){
    checkIsOldUser();
    renderActivityInfo();
    bindEvent();
  })

});
