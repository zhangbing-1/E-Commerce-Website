$(function() {
  var dom = $('#container'),_obj = common.urlGet();
  if(_obj.activityId < 23){
    $('#backimg').attr('src','https://zongjiewebimg.chaisenwuli.com/othercloud/prebind-back.jpg');
  }else if(_obj.activityId > 120){
    $('#backimg').attr('src',' https://adminpic.chaisenwuli.com/activity/mp/prebind-back-' + _obj.activityId + '.jpg');
  }else{
    $('#backimg').attr('src','https://zongjiewebimg.chaisenwuli.com/othercloud/prebind-back-' + _obj.activityId + '.jpg');
  }

  function bindUserRelationship(unionId) {
    common.actions.bindUserRelationship({
      sourceOpenId: _obj.sourceOpenId,
      unionId: unionId,
      activityId: _obj.activityId
    })
  }


  if(_obj.appid && _obj.appid != common.appid){
    common.getSpeacialOpenId('user',_obj.appid).done(function(openId) {
      common.initWeixinConfig().done(function() {
        bindUserRelationship(common.getLocalStroge(_obj.appid + 'unionId'));
      })
    })
  }else{
    common.initialize(function(){
      bindUserRelationship(common.getLocalStroge('unionId'));
    },'user')
  }




});
