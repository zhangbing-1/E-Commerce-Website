$(function() {
  var dom = $('#container'),
    params = common.urlGet(),
    reployScore = 1;

  function renderPage(data){
    dom.find('.answer-teacher-name').text('答疑老师： ' + data.teacherName);
    dom.find('.answer-num').text('答疑数量： ' + data.count);
    reployScore = data.reployScore ? data.reployScore : 1;
    renderStar(data.reployScore ? data.reployScore : 1);
    dom.find('.reployContent').val(data.reployContent);
  }
  function renderStar(index){
    var domStr = '',starStr = '';
    for(var i = 1; i <= 5; i++){
      if(i <= index){
        domStr += '<span class="icon-light" data-index="' + i + '"></span>';
      }else{
        domStr += '<span class="icon-gray" data-index="' + i + '"></span>';
      }
    }
    switch(index){
      case 1:
        starStr = '1分，非常差';
        break;
      case 2:
        starStr = '2分，差';
        break;
      case 3:
        starStr = '3分，一般';
        break;
      case 4:
        starStr = '4分，好';
        break;
      case 5:
        starStr = '5分，非常好';
        break;
    }
    dom.find('.star').html(domStr);
    dom.find('.star-text').html(starStr);
  }

  function bindEvent() {
    dom.on('click','[data-index]',function(){
      var index = $(this).data('index');
      if(reployScore != index){
        renderStar(index);
      }
      reployScore = index;
    })

    dom.on('click','.submit',function(){

    })

    dom.on('click','.complaint',function(){
      location.href = './complain.html?' + common.stringify(params);
    })
  }

  common.actions.getEvaluateDetail(params.id).done(function(res){
    if(res.code == 0){
      renderPage(res.data);
    }
    bindEvent();
  })
});
