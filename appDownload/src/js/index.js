$(function() {
  var dom = $('#container'),androidPath = '';
  function bindEvent() {

    if(common.isTJ){
      dom.find('.back').css('display','none')
      dom.find('.back.tj').css('display','block')
    }

    if(common.isPhone && common.isWeixin){
      location.href = common.iosDownloadUrl;
    }else if(common.isPhone){
      location.href = common.isTJ ? 'azjtj://100' : 'aizongjie://100'
    }else if(common.isWeixin){
      common.createShare()
    }else{
      location.href = common.isTJ ? 'azjtj://' : 'aizongjie://'
    }

    dom.on('click', '.btn', function(e) {
      if(common.isPhone){
        location.href = common.iosDownloadUrl;
      }else if(common.isWeixin){ // android 微信
        common.createShare()
      }else{
        location.href = androidPath;
      }
    })
  }

  common.actions.getVersion().done(function(res){
    if(res.code == 0){
      androidPath = res.data.releasePath;
    }
    bindEvent();
  })
});
