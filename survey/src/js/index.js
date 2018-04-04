$(function() {
  var token = common.getLocalStroge('token');
  if (token) {
    common.actions.getUser({token:token}).done(res=>{
      if(res.code == 0){
        items.$phone.val(res.data.phone)
      }
    })
  }else{
    location.href = './login.html'
  }

  FastClick.attach(document.body);
  var items = {
    $name: $('[name=name]'),
    $grade: $('[name=grade]'),
    $schoolName: $('[name=schoolName]'),
    $qq: $('[name=qq]'),
    $email: $('[name=email]'),
    $phone: $('[name=phone]'),
    $parentPhone: $('[name=parentPhone]'),
    $cz0sx: $('[name=cz0sx]'),
    $cz0yy: $('[name=cz0yy]'),
    $gz0sx: $('[name=gz0sx]'),
    $gz0wl: $('[name=gz0wl]'),
    $schedule: $('[name=schedule]')
  };

  /**
   *
   *  { type: 'notNull', msg: '姓名不能为空' },
    { type: 'length', min: 0, max: 20, msg: '姓名不能为空' },
    { type: 'size', min: 0, max: 20, msg: '姓名不能为空' },
    { type: 'regex', regex: /^1\d{10}/, msg: '' },
    { type: 'fun', fun: function() {} }
    verify : [init|success|error]
   *
   */

  items.$name.data('rule', [
    { type: 'notNull', msg: '姓名不能为空，请输入' },
    { type: 'length', min: 2, max: 20, msg: '姓名长度为2到20个' }
  ])

  items.$grade.data('rule', [
    { type: 'notNull', msg: '请选择年级' }
  ])

  items.$schoolName.data('rule', [
    { type: 'notNull', msg: '学校不能为空，请输入' }
  ])

  items.$qq.data('rule', [
    { type: 'notNull', msg: 'qq号不能为空，请输入' },
    { type: 'regex', regex: /[1-9]\d{4,14}/, msg: 'qq号格式不正确' }

  ])

  items.$email.data('rule', [
    { type: 'notNull', msg: '邮箱不能为空，请输入' },
    { type: 'regex', regex: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, msg: '邮箱格式不正确' }
  ])

  items.$phone.data('rule', [
    { type: 'notNull', msg: '你的手机号不能为空，请输入' },
    { type: 'regex', regex: /^1\d{10}/, msg: '你的手机号格式不正确' }
  ])

  items.$parentPhone.data('rule', [
    { type: 'notNull', msg: '家长手机号不能为空，请输入' },
    { type: 'regex', regex: /^1\d{10}/, msg: '家长手机号格式不正确' },
    {
      type: 'fun',
      fun: function(value) {
        var phone = $.trim(items.$phone.val());
        if (phone == value) {
          return { verify: false, msg: "家长手机号不能和学生手机号相同" }
        } else {
          return { verify: true, msg: "" }
        }
      }
    }
  ])

  items.$cz0sx.data('rule', [
    { type: 'notNull', msg: '初中平均数学成绩不能为空，请输入' },
    { type: 'regex', regex: /^\d{1,3}(\.\d+)?[\(（]\d{1,3}[\)）]$/, msg: '初中平均数学成绩格式不正确' }
  ])

  items.$cz0yy.data('rule', [
    { type: 'notNull', msg: '初中平均英语成绩不能为空，请输入' },
    { type: 'regex', regex: /^\d{1,3}(\.\d+)?[\(（]\d{1,3}[\)）]$/, msg: '初中平均英语成绩格式不正确' }
  ])

  items.$gz0sx.data('rule', [
    { type: 'notNull', msg: '高中平均数学成绩不能为空，请输入' },
    { type: 'regex', regex: /^\d{1,3}(\.\d+)?[\(（]\d{1,3}[\)）]$/, msg: '高中平均数学成绩格式不正确' }
  ])

  items.$gz0wl.data('rule', [
    { type: 'notNull', msg: '高中平均物理成绩不能为空，请输入' },
    { type: 'regex', regex: /^\d{1,3}(\.\d+)?[\(（]\d{1,3}[\)）]$/, msg: '高中平均物理成绩格式不正确' }
  ])

  items.$schedule.data('rule', [
    { type: 'notNull', msg: '目前学校进度不能为空，请输入' },
    { type: 'length', min: 1, max: 50, msg: '学校进度长度为1到50个' }
  ])

  function validate(list, value) {
    for (var i = 0; i < list.length; i++) {
      var verify = list[i];
      switch (verify.type) {
        case 'notNull':
          if (!value) return { verify: false, msg: verify.msg }
          break;
        case 'length':
          if (value.length > verify.max && value.length < verify.min) return { verify: false, msg: verify.msg }
          break;
        case 'size':
          if (value > verify.max && value < verify.min) return { verify: false, msg: verify.msg }
          break;
        case 'regex':
          if (!verify.regex.test(value)) return { verify: false, msg: verify.msg }
          break;
        case 'fun':
          var result = verify.fun(value)
          if (!result.verify) return result;
          break;
      }
    }
    return { verify: true };
  }

  function Change(event) {
    var $target = $(event.target)
    if (event.type == 'focus') {
      var groups = $target.closest('.form-group');
      groups.removeClass('error');
      groups.find('.msg').text('');
    } else if (event.type == 'blur') {
      checkItem($target);
    }
  }

  function checkItem(dom, list, value) {
    var list = dom.data('rule'),
      value = $.trim(dom.val());
    var result = validate(list, value);
    var groups = dom.closest('.form-group');
    if (!result.verify) {
      groups.addClass('error');
      groups.find('.msg').text(result.msg)
    } else {
      groups.removeClass('error');
      groups.find('.msg').text('')
    }
    return value;
  }

  function Submit(event) {
    var list = ['name', 'grade', 'schoolName', 'qq', 'email', 'phone', 'parentPhone', 'cz0sx', 'cz0yy', 'gz0sx', 'gz0wl', 'schedule'];
    var data = {};
    var submit = $('[name=submit]');
    for (var i = 0; i < list.length; i++) {
      var key = list[i];
      data[key] = checkItem(items['$' + key]);
    }
    var error = $('.form-group.error');
    if (error.length > 0) {
      return $('body').animate({ scrollTop: error.offset().top }, 800);
    }
    submit.addClass('disabled')
    data.type = 'CZWQ';
    data.token = token;
    data.avgScores = ['cz0sx:' + data.cz0sx, 'cz0yy:' + data.cz0yy, 'gz0sx:' + data.gz0sx, 'gz0wl:' + data.gz0wl].join('||');
    data.linkRecord = 1;
    data.remark = '';
    common.actions.commonSurvey(data).done(function(res) {
      if (res.code == 0) {
        $('.container').hide();
        $('.success-msg').show();
      } else {
        submit.removeClass('disabled');
        common.toast(res.message);
      }
    })
  }

  $('[name=submit]').on('click', Submit);
  $('input').on('focus blur', Change);
  $('select').on('focus blur', Change);
});
