$(function() {
  var _obj = common.urlGet();
  if(!_obj.appid || !_obj.courseId || !_obj.productId){
    alert('购买参数有误')
    return
  }
  if(_obj.appid == common.appid){
    location.href = location.origin + '/wap/#/detail/'+_obj.courseId +'/' + _obj.productId
    return
  }
  common.getSpeacialOpenId('user',_obj.appid).done(function() {
    let unionId = common.getLocalStroge(_obj.appid + 'unionId')
    location.href = location.origin + '/wap/#/detail/'+_obj.courseId +'/' + _obj.productId + '?wechatMark=' + unionId
  })
});
