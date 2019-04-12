$(function() {
  var dom = $('#container'),androidPath = '';
  function bindEvent() {

    if(common.isPhone && common.isWeixin){
      location.href = 'https://itunes.apple.com/cn/app/%E7%88%B1%E6%80%BB%E7%BB%93/id1377039393?mt=8';
    }else if(common.isPhone){
      location.href = 'aizongjie://100'
    }else if(common.isWeixin){
      common.createShare()
    }else{
      location.href = 'aizongjie://'
    }

    dom.on('click', '.btn', function(e) {
      if(common.isPhone){
        location.href = 'https://itunes.apple.com/cn/app/%E7%88%B1%E6%80%BB%E7%BB%93/id1377039393?mt=8';
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
