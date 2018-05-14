$(function() {
  var dom = $('#container'),_obj = common.urlGet();

  function bindUserRelationship() {
    common.actions.bindUserRelationship({
      sourceOpenId: _obj.sourceOpenId,
      unionId: common.getLocalStroge('unionId'),
      activityId: _obj.activityId
    })
  }

  common.initialize(function(){
    bindUserRelationship();
    // wx.ready(function() {
    //   wx.showMenuItems({
    //     menuList: ['menuItem:share:appMessage','menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
    //   });
    //   var wxData = {
    //     title: '【团购】好课成团立享优惠',
    //     link: common.shareUrl,
    //     desc: '2人成团，即可立享优惠,24小时内，拼团失败，全额原路退回',
    //     imgUrl: 'https://zongjiewebimg.chaisenwuli.com/activitys/groupon/img/icon-share-icon.png'
    //   }
    //   wx.onMenuShareAppMessage(wxData);
    //   wx.onMenuShareTimeline(wxData);
    // })
  },'info')

});
