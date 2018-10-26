$(function() {
  var dom = $('#container'),
    loadStatus = 'loading',
    page = 1,
    pageSize = 5;
  function renderList(isOrder) {
    common.actions.getActivityList({
      gradeId: common.params.gradeId,
      type: common.params.type,
      page:page,
      pageSize:pageSize
    }).done(function(res) {
      if (res.code == 0) {
        if(page == 1){
          var html = template('tpl-main', { list: res.data });
          dom.html(html);
          renderGetCoupon();
          renderToFreeCourse();
        }else if(page > 1){
          var html = template('tpl-list', { list: res.data });
          dom.find('.list').append(html);
        }

        if(res.data.length < pageSize){
          loadStatus = 'end';
          dom.find('.loadMore').remove()
        }else{
          loadStatus = '';
        }
      }
    })
  }

  function renderGetCoupon(){
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
      dom.append(common.createToFreeCourse());
    }
  }

  function loadMore(){
    if (loadStatus == 'loading') return;
    if (loadStatus == 'end') return;
    loadStatus = 'loading';
    page++;
    renderList();
  }

  function bindEvent() {
    dom.on('click', '.link', function(e) {
      common.go('./detail.html',{
        id:$(this).data('id')
      })
      // location.href = './detail.html?id=' + common.stringify({
      //   id:$(this).data('id'),
      //   type: common.params.type,
      //   gradeId: common.params.gradeId
      // });
    })

    dom.on('click','.banner-get-coupon',function(e){
      location.href = location.origin + '/wap/#/givecoupons';
    })

    dom.on('click','.free-course',function(e){
      location.href = location.origin + '/wap/#/';
    })

    new auiScroll({ listen: true, distance: 100 }, function(res) {
      if (res.isToBottom) {
        loadMore();
      }
    })
  }

  common.initialize(function(){
    renderList();
    bindEvent();
    wx.ready(function() {
      wx.showMenuItems({
        menuList: ['menuItem:share:appMessage','menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
      });
      var wxData = {
        title: '【团购】好课成团立享优惠',
        link: common.shareUrl + 'index.html?' + common.stringify({
          gradeId: common.params.gradeId,
          type: common.params.type
        }),
        desc: '参与拼团，即可立享优惠，24小时内，拼团失败，全额原路退回',
        imgUrl: 'https://zongjiewebimg.chaisenwuli.com/activitys/groupon/img/icon-share-icon.png'
      }
      wx.onMenuShareAppMessage(wxData);
      wx.onMenuShareTimeline(wxData);
    })
  })

});
