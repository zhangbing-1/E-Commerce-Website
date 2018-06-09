$(function() {
  var dom = $('#container'),androidPath = '';




  function bindEvent() {
    dom.on('click', '.btn', function(e) {
      if(common.isAndroid && common.isWeixin){
        dom.append( common.createShare());

      }else if(common.isAndroid){
        location.href = androidPath;
      }else{
        location.href = '';
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
