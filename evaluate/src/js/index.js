$(function() {
  FastClick.attach(document.body);
  var token = common.isClient ? bridge.call('getToken') : common.getLocalStroge('');
  if(token){
    common.setLocalStroge("token",token)
  }else{
    common.tokenExpire();
  }

  var dom = $('#container'),
    params = common.urlGet(),
    reployScore = 0,
    lable = '答题数不一致',
    isComplete = false;

  function renderPage(data){
    dom.find('.answer-teacher-name').text('答疑老师： ' + data.teacherName);
    lable = data.reployLabel ? data.reployLabel : lable;
    $(".select:contains(" + lable + ")").addClass('current');
    dom.find('.answer-num').text('答疑数量： ' + data.count);
    reployScore = data.reployScore;
    if(reployScore == 1){
      dom.find('.select-group').show();
      dom.find('.reployContent').attr('placeholder','详细描述你所遇到的问题，不超过200字')
    }
    renderStar(reployScore);
    dom.find('.reployContent').val(data.reployContent);
    if(data.reployContent){
      dom.find('.submit').hide();
      dom.find('.reployContent').prop('readonly', true)
      dom.find('.status').show();
      isComplete = true;
    }
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
      default:
        break;
    }
    dom.find('.star').html(domStr);
    dom.find('.star-text').html(starStr);
  }

  function bindEvent() {
    dom.on('click','[data-index]',function(){
      if(isComplete) return;
      var index = $(this).data('index');
      if(reployScore != index){
        renderStar(index);
      }
      reployScore = index;

      if(index == 1){
        dom.find('.select-group').show();
        dom.find('.reployContent').attr('placeholder','详细描述你所遇到的问题，不超过200字')
      }else{
        dom.find('.select-group').hide();
        dom.find('.reployContent').attr('placeholder','问题解决了吗？说说你的感受吧')
      }
    })

    dom.on('click','.select',function(){
      if(isComplete) return;
      dom.find('.select').removeClass('current');
      $(this).addClass('current');
      lable = $(this).text();
    })

    dom.on('click','.close',function(){
      dom.find('.success-wrapper').hide();
    })

    dom.on('click','.submit',function(){
      if(isComplete) return common.toast('已经提交过');
      if(reployScore == 0){
         return common.toast('请选择星级');
      }
      var content = dom.find('.reployContent').val();
      // if(!content){
      //   return common.toast(reployScore == 1 ? '请输入你的问题' : '请输入你的感受');
      // }
      if(content.length > 200){
        return common.toast('内容不能超过200字');
      }
      common.actions.commitEvaluate({
        id: params.id,
        score: reployScore,
        type: reployScore == 1 ? 2 : 1,
        content : content,
        label: reployScore == 1 ? lable : ''
      }).done(function(res){
        if(res.code == 0){
          dom.find('.success-wrapper').show();
          init();
        }
      })
    })
  }
  function init(){
    common.actions.getEvaluateDetail(params.id).done(function(res){
      if(res.code == 0){
        renderPage(res.data);
      }
      bindEvent();
    })
  }
  init();
});
