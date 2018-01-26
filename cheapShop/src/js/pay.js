$(function() {
  FastClick.attach(document.body);
  function Page() {
    this.$elem = $('#container')
  }

  Page.prototype.configShare = function(){
    var that = this;
    common.initWeixinConfig(function(){
      wx.hideOptionMenu();
      that.pay();
    })
  }
  Page.prototype.startTimer = function(){
    var time = 5,that = this;
    function iteart(){
      if(time <= 0){
        location.replace('./index.html');
      }else{
        that.$elem.text("支付成功!" + time + "s后返回主页");
        time--;
        setTimeout(iteart,1000);
      }
    }
    iteart();
  }

  Page.prototype.pay = function(){
    var _obj = common.urlGet(),that = this;
    common.actions.weixinPay(_obj.id).done(function(res){
      if(res.code == 0){
        wx.chooseWXPay({
          timestamp: res.data.timeStamp,
          nonceStr: res.data.nonceStr,
          package: res.data.packageValue,
          signType: res.data.signType,
          paySign: res.data.paySign,
          success:function(res){
            that.startTimer()
          },
          cancel:function(){
            history.back();
          },
          fail:function(res){
            common.toast('支付失败');
            setTimeout(function(){
              history.back();
            },1000)
          }
        });
      }
    })
  }



  Page.prototype.init = function(){
    var that = this;
    common.getToken(function(token){
      if(token){
        that.configShare();
      }else{
        location.replace('./login.html?' + common.stringify({ callbackUrl: location.href }))
      }
    })

  }

  var page = new Page();
  page.init();

});
