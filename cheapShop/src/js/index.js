$(function() {
  FastClick.attach(document.body);
  function Page() {
    this.$elem = $('#container')
  }

  Page.prototype.configShare = function(){
    var that = this;
    common.initWeixinShare({
      success: function(res){
        that.doForward();
      }
    })
  }

  Page.prototype.getOrderStatus = function(){
    var that = this;
    return common.actions.getOrderStatus().done(function(res){
      if(res.code == 0){
        if(res.data.status ==  2){
          that.$elem.find('.price').remove();
          var text = '已购买 ';
          if(res.data.product){
            text += res.data.product == 8 ? '八年级讲义2本+原创文章1本' : '九年级讲义2本+原创文章1本';
          }
          that.$elem.find('.btn-shop').css({'width':'100%'}).addClass('disabled').text(text);
          that.$elem.find('.share-arrow').remove();
          that.$elem.find('.share-text').remove();
        }
      }
    })
  }

  Page.prototype.getActivityStatus = function(callback){
    var that = this;
    return common.actions.getActivityStatus().done(function(res){
      if(res.code == 0){
        if(res.data.status == 0){
          that.$elem.find('.price').remove();
          that.$elem.find('.btn-shop').css({'width':'100%'}).addClass('disabled').text('活动已结束');
          that.$elem.find('.share-arrow').remove();
          that.$elem.find('.share-text').remove();
        }else{
          callback();
        }
      }
    })
  }

  Page.prototype.getForwardStatus = function(){
    var that = this;
    return common.actions.getForwardStatus().done(function(res){
      if(res.code == 0){
        that.isShare = res.data.status == 1;
        that.$elem.find('.price-number').text(that.isShare ? '1' : '9');
        if(that.isShare){
          that.$elem.find('.share-arrow').remove();
          that.$elem.find('.share-text').remove();
        }
      }
    })
  }

  Page.prototype.doForward = function(){
    var that = this;
    if(that.isShare) return common.toast('分享成功');
    common.actions.doForward().done(function(res){
      if(res.code == 0){
        common.toast('分享成功');
        that.$elem.find('.price-number').text('1');
        that.$elem.find('.share-arrow').remove();
        that.$elem.find('.share-text').remove();
      }
    })
  }

  Page.prototype.bindEvent = function(){
    var that = this;
    that.$elem.on('click','.btn-shop',function(){
      if(that.token){
        location.href = './order.html';
      }else{
        location.href = './login.html?'+common.stringify({callbackUrl:'./order.html'});
      }
    })
  }

  Page.prototype.init = function(){
    var that = this;
    this.configShare();
    this.getActivityStatus(function(){
      common.getToken(function(token){
        if(token){
          that.token = token;
          $.when(that.getOrderStatus(),that.getForwardStatus()).then(function(){
            that.bindEvent();
          })
        }else{
          that.getForwardStatus().done(function(){
            that.bindEvent();
          })
        }
      })
    });
  }

  var page = new Page();
  page.init();

});
