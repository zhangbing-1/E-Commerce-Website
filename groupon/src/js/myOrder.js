$(function() {
  var dom = $('#container'),loadStatus = 'loading',page = 1,pageSize = 5;

  if(!common.getLocalStroge('token')){
    location.href = './login.html?' + common.stringify({
      callBackUrl:location.href
    })
  }

  function renderList() {
    common.actions.getMyOrder({
      page:page,
      pageSize:pageSize
    }).done(function(res) {
      if (res.code == 0) {
        if(page == 1){
          var html = template('tpl-main', { list: res.data });
          dom.html(html);
        }else if(page > 1){
          var html = template('tpl-list', { list: res.data });
          dom.find('.list').append(html);
        }

        if(res.data.length < pageSize){
          loadStatus = 'end';
          dom.find('.loadMore').remove()
        }else{
          loadStatus = '';
        }

      }
    })
  }

  function loadMore(){
    if (loadStatus == 'loading') return;
    if (loadStatus == 'end') return;
    loadStatus = 'loading';
    page++;
    renderList();
  }

  function bindEvent() {
    dom.on('click', '.link', function(e) {
      location.href = $(this).data('link')
    })

    new auiScroll({ listen: true, distance: 100 }, function(res) {
      if (res.isToBottom) {
        loadMore();
      }
    })
  }

  common.initialize(function(){
    renderList();
    bindEvent();
  })
});
