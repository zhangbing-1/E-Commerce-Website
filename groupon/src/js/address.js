$(function(){
  var token = common.getLocalStroge('token');
  if(!token){
    common.go('./login.html',{
      callBackUrl:location.href
    });
    // location.href = './login.html';
  }
  var dom = $('#container');
  var params = common.urlGet();
  var addressList = [];

  function renderAddressList(){
    $.when(common.actions.getUser(),common.actions.getAddressList())
    .done(function(data1,data2){
      var res1 = data1[0],res2=data2[0];
      if(res1.code == 0 && res2.code == 0){
        addressList = res2.data;
        var html =  template('tpl-list',{user:res1.data,list:res2.data,params: params});
        dom.find('.list').html(html).show();
        dom.find('.address-wrapper').hide();
      }
    })
  }

  function getAddressById(id){
    for(var i = 0; i < addressList.length;i++){
      if(addressList[i].id == id){
        return addressList[i];
      }
    }
    return {id:id};
  }

  function renderAddressWrapper(id){
    var address = getAddressById(id);
    var html = template('tpl-address',address);
    dom.find('.address-wrapper').html(html).show();
    dom.find('.list').hide();
  }

  function deleteAddress(id){
    common.actions.deleteAddress(id).done(function(res){
      if(res.code == 0){
        renderAddressList();
      }
    })
  }

  function setDefaltAddress(id){
    common.actions.editUserInfo({addressId:id}).done(function(res){
      if(res.code == 0){
        renderAddressList();
      }
    })
  }

  function bindEvent(){
    dom.on('click','.btn-edit',function(e){
      e.stopPropagation();
      var id = $(this).closest('.address').data('id');
      renderAddressWrapper(id);
    })

    dom.on('click','.go-select',function(){
      common.go(params.callBackUrl, {
        id: params.id,
        groupId: params.groupId,
        addressId: $(this).data('id'),
      })
      // location.href = params.callBackUrl + '?' + common.stringify($.extend({},{
      //   id: params.id,
      //   groupId: params.groupId,
      //   addressId: $(this).data('id'),
      // }))
    })

    dom.on('click','.btn-add',function(){
      renderAddressWrapper(-1);
    })

    dom.on('click','.btn-delete',function(e){
      e.stopPropagation();
      var id = $(this).closest('.address').data('id');
      common.createConfirm('确定删除吗？').done(function(confirm){
        confirm.remove();
        deleteAddress(id);
      }).fail(function(confirm){
        confirm.remove()
      })
    })

    dom.on('click','.btn-default',function(e){
      e.stopPropagation();
      var id = $(this).closest('.address').data('id');
      setDefaltAddress(id);
    })

    dom.on('click','[name=address]',function(){
      var $this = $(this);
      $this.blur();
      new IosSelect(3, [common.provinceData, common.cityData,common.areaData],{
        title: '邮寄地址',
        itemHeight: 45,
        itemShowCount: 5,
        oneLevelId: $this.data('province'),
        twoLevelId: $this.data('city'),
        threeLevelId: $this.data('area'),
        callback: function (selectOneObj, selectTwoObj, selectThreeObj, a,b,c,d) {  // 用户确认选择后的回调函数
          if(!selectOneObj.dom || !selectTwoObj.dom || !selectThreeObj.dom) return;
          var address = selectOneObj.value + ' ' + selectTwoObj.value + ' ' +  selectThreeObj.value;
          $this.data('province',selectOneObj.id)
            .data('city',selectTwoObj.id)
            .data('area',selectThreeObj.id)
            .val(address)
          common.setLocalStroge('address:province',selectOneObj.id);
          common.setLocalStroge('address:city',selectTwoObj.id);
          common.setLocalStroge('address:area',selectThreeObj.id);
          common.setLocalStroge('address:address',address);
        }
      });
    })

    dom.on('click','.btn-save',function(){
      var id = $(this).data('id');
      var name = $.trim(dom.find('[name=name]').val());
      if (!name) return common.toast('请输入姓名');
      var phone = $.trim(dom.find('[name=phone]').val());
      if (!phone) return common.toast('请输入手机号');
      if (!common.verify.phone.test(phone)) return common.toast('请输入正确的手机号');
      var address = $.trim(dom.find('[name=address]').val());
      if(!address) return common.toast('请选择省市区');

      var detail = $.trim(dom.find('[name=detail]').val());
      if (!detail) return common.toast('请输入街道门牌信息');
      var data = {
        name:name,
        phone:phone,
        detail:detail,
        areaId:dom.find('[name=address]').data('area'),
        cityId:dom.find('[name=address]').data('city'),
        provinceId:dom.find('[name=address]').data('province'),
      };
      var actions = null;
      if(id == -1){
        actions = common.actions.addAddress(data);
      }else{
        data.addressId = id;
        actions = common.actions.updateAddress(data);
      }
      actions.done(function(res){
        if(res.code == 0){
          id == -1 ? common.toast('添加成功') : common.toast('更新成功');
          renderAddressList();
        }
      })
    })

  }

  common.initialize(function(){
    renderAddressList();
    bindEvent();
  })


})
