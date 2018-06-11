$(function() {
  var dom = $('#container'),androidPath = '';
  function bindEvent() {
    dom.on('click', '.btn', function(e) {
      if(common.isAndroid && common.isWeixin){
        dom.append(common.createShare());
      }else if(common.isAndroid){
        location.href = androidPath;
      }else{
        location.href = 'https://itunes.apple.com/cn/app/%E7%88%B1%E6%80%BB%E7%BB%93/id1377039393?mt=8';
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
