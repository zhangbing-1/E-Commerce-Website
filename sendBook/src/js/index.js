$(function() {
  var dom = $('#container'),loadStatus = 'loading',page = 1,pageSize = 5;

  common.initialize(function(){
    common.actions.getToken({
      openId: common.getLocalStroge('openId'),
      unionId: common.getLocalStroge('unionId')
    }).done(function(res){
      if(res.code == 0){
        common.setLocalStroge('token',res.data.token)
      }
    })
    wx.ready(function() {
      wx.showMenuItems({
        menuList: ['menuItem:share:appMessage','menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
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
  },'base')

});
