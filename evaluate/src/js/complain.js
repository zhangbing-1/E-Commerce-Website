$(function() {
  var dom = $('#container'),
    params = common.urlGet(),
    reployScore = 1;

  function renderPage(data){

  }

  function bindEvent() {
    dom.on('click','.select',function(){
      dom.find('.select').removeClass('current');
      $(this).addClass('current');
    })

    dom.on('click','.submit',function(){

    })
  }

  common.actions.getEvaluateDetail(params.id).done(function(res){
    if(res.code == 0){
      renderPage(res.data);
    }
    bindEvent();
  })
});
