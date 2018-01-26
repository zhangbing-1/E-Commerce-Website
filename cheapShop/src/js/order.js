$(function() {
  FastClick.attach(document.body);

  function Page() {
    this.$elem = $('#container')
    this.product = 8;
  }

  Page.prototype.configShare = function() {
    common.initWeixinShare()
  }

  Page.prototype.getActivityStatus = function(callback){
    var that = this;
    return common.actions.getActivityStatus().done(function(res){
      if(res.code == 0){
        if(res.data.status == 0){
          that.$elem.find('.btn-pay').addClass('disabled').text('活动已结束');
        }else{
          callback();
        }
      }
    })
  }

  Page.prototype.getUserInfo = function() {
    var that = this;
    return common.actions.getUserByToken().done(function(res) {
      if (res.code == 0) {
        var user = res.data;
        that.$elem.find('[name=name]').val(user.name || common.getLocalStroge('address:name'));
        that.$elem.find('[name=phone]').val(user.phone);
        that.$elem.find('[name=address]')
          .data('province',common.getLocalStroge('address:province'))
          .data('city',common.getLocalStroge('address:city'))
          .data('area',common.getLocalStroge('address:area')).val(common.getLocalStroge('address:address'));
        that.address = common.getLocalStroge('address:address');
        that.$elem.find('[name=detail]').val(common.getLocalStroge('address:detail'))
      }
    })
  }

  Page.prototype.getOrderStatus = function() {
    var that = this;
    return common.actions.getOrderStatus().done(function(res) {
      if (res.code == 0) {
        if (res.data.status == 2) {
          that.$elem.find('.btn-pay').addClass('disabled').text('已购买');
        }
      }
    })
  }
  Page.prototype.getForwardStatus = function() {
    var that = this;
    return common.actions.getForwardStatus().done(function(res) {
      if (res.code == 0) {
        that.isShare = res.data.status == 1;
        that.$elem.find('.price-number').text(res.data.status == 0 ? '9' : '1');
      }
    })
  }
  Page.prototype.bindEvent = function() {
    var that = this,
      _obj = common.urlGet();

    that.$elem.on('click', '.redio', function() {
      var $this = $(this);
      if ($this.hasClass('check')) {
        return;
      }
      that.$elem.find('.redio.check').removeClass('check');
      $this.addClass('check');
      that.product = $this.data('id');
    })

    that.$elem.on('click','[name=address]',function(){
      var $this = $(this);
      new IosSelect(3, [common.provinceData, common.cityData,common.areaData],{
        title: '邮寄地址',
        itemHeight: 45,
        itemShowCount: 5,
        oneLevelId: $this.data('province'),
        twoLevelId: $this.data('city'),
        threeLevelId: $this.data('area'),
        callback: function (selectOneObj, selectTwoObj, selectThreeObj) {  // 用户确认选择后的回调函数
          that.address = selectOneObj.value + ' ' + selectTwoObj.value + ' ' +  selectThreeObj.value;
          $this.data('province',selectOneObj.id)
            .data('city',selectTwoObj.id)
            .data('area',selectThreeObj.id)
            .val(that.address)
          common.setLocalStroge('address:province',selectOneObj.id);
          common.setLocalStroge('address:city',selectTwoObj.id);
          common.setLocalStroge('address:area',selectThreeObj.id);
          common.setLocalStroge('address:address',that.address);
        }
      });
    })


    that.$elem.on('click', '.btn-pay', function() {
      var name = $.trim(that.$elem.find('[name=name]').val());
      if (!name) return common.toast('请输入姓名');
      var phone = $.trim(that.$elem.find('[name=phone]').val());
      if (!phone) return common.toast('请输入手机号');
      if (!common.verify.phone.test(phone)) return common.toast('请输入正确的手机号');
      if(!that.address) return common.toast('请选择省市区');
      var detail = $.trim(that.$elem.find('[name=detail]').val());
      if (!detail) return common.toast('请输入街道门牌信息');
      var address = that.address + detail;
      common.setLocalStroge('address:name',name);
      common.setLocalStroge('address:detail',detail);
      common.actions.commitOrder({
        expressAddress: address,
        expressPhone: phone,
        name: name,
        product: that.product,
        amount:  that.isShare ? 1 : 9,
        token: common.getLocalStroge('token'),
        openId: common.getLocalStroge('openId')
      }).done(function(res){
        if(res.code == 0){
          location.href = './pay.html?' + common.stringify({
            callbackUrl:'./index.html',
            id: res.data.orderId
          })
        }
      })
    })
  }
  Page.prototype.init = function() {
    var that = this;
    this.configShare();
    this.getActivityStatus(function(){
      common.getToken(function(token) {
        if (token) {
          $.when(that.getOrderStatus(), that.getForwardStatus(), that.getUserInfo())
        } else {
          location.replace('./login.html?' + common.stringify({ callbackUrl: location.href }))
        }
      })
    })
    this.bindEvent();
  }

  var page = new Page();
  page.init();

});
