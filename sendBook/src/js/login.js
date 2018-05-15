$(function() {
  FastClick.attach(document.body);
  function Page() {
    this.$elem = $('#container')
  }

  Page.prototype.startTimer = function(){
    var time = 90,that = this;
    function iteart(){
      if(time <= 0){
        that.$elem.find('.btn-code').removeClass('disabled').text('获取验证码')
      }else{
        that.$elem.find('.btn-code').text( time + '秒后重新发送')
        time--;
        setTimeout(iteart,1000);
      }
    }
    iteart();
  }

  Page.prototype.bindEvent = function(){
    var that = this, _obj = common.urlGet();

    that.$elem.on('click','.btn-code',function(){
      var phone = $.trim(that.$elem.find('input[name=phone]').val());
      if(!phone) return common.toast('请输入手机号');
      if(!common.verify.phone.test(phone)) return common.toast('请输入正确的手机号');
      that.$elem.find('.btn-code').addClass('disabled');
      common.actions.getCode({phone:phone}).done(function(res){
        if(res.code == 0){
          that.startTimer();
        }else{
          that.$elem.find('.btn-code').removeClass('disabled');
        }
      })
    })

    that.$elem.on('click','.btn-login',function(){
      var phone = $.trim(that.$elem.find('input[name=phone]').val());
      if(!phone) return common.toast('请输入手机号');
      if(!common.verify.phone.test(phone)) return common.toast('请输入正确的手机号');
      var code = $.trim(that.$elem.find('input[name=code]').val());
      if(!common.verify.captcha.test(code)) return common.toast('请输入正确的4位数字验证码');
      that.$elem.find('.btn-login').addClass('disabled');
      common.actions.login({
        phone:phone,
        code:code,
        openId:common.getLocalStroge('openId')||'',
        unionId:common.getLocalStroge('unionId')||''
      }).done(function(res){
        that.$elem.find('.btn-login').removeClass('disabled');
        if(res.code == 0){
          common.setLocalStroge('token',res.data.token);
          location.replace(_obj.callBackUrl || './index.html');
        }else{
          common.toast(res.message);
        }
      })
    })
  }

  Page.prototype.init = function(){
    var that = this;
    that.bindEvent();
  }

  common.initialize(function(){
    var page = new Page();
    page.init();
  })
});
