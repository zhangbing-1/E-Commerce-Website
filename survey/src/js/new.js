$(function() {
  var token = common.isClient ? bridge.call('getToken') : common.getLocalStroge('token');
  common.actions.getUser({ token: token }).done(function(res) {
      if (res.code == 0) {
      }
    })
  if (!token) {
    common.tokenExpire();
  }

  FastClick.attach(document.body);
  var items = {
    $name: $('[name=name]'),
    $sex: $('[name=sex]'),
    $grade: $('[name=grade]'),
    $gradeOther: $('[name=gradeOther]'),
    $schoolName: $('[name=schoolName]'),
    $residence: $('[name=residence]'),
    $mathScore: $('[name=mathScore]'),
    $physicScore: $('[name=physicScore]'),
    $schedule: $('[name=schedule]')
  };

  var $gradeOther = $('.grade-other');

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
    { type: 'regex', regex: /^[\u4e00-\u9fa5 ]{2,20}$/, msg: '姓名长度为2到20个汉字' }
  ])

  items.$sex.data('rule', [{
    type: 'fun',
    fun: function(value) {
      if (value <= 0) {
        return { verify: false, msg: "请选择性别" }
      } else {
        return { verify: true, msg: "" }
      }
    }
  }])

  items.$grade.data('rule', [{
    type: 'fun',
    fun: function(value) {
      if (value < 0) {
        return { verify: false, msg: "请选择年级" }
      } else {
        return { verify: true, msg: "" }
      }
    }
  }])

  items.$gradeOther.data('rule', [
    { type: 'notNull', msg: '你的具体年级不能为空，请输入' },
    { type: 'length', min: 1, max: 20, msg: '年级长度为20个字以内' }
  ])

  items.$schoolName.data('rule', [
    { type: 'notNull', msg: '学校不能为空，请输入' }
  ])

  items.$residence.data('rule', [{
    type: 'fun',
    fun: function(value) {
      if (value ==  -1) {
        return { verify: false, msg: "请选择是否住校" }
      } else {
        return { verify: true, msg: "" }
      }
    }
  }])

  items.$mathScore.data('rule', [
    { type: 'notNull', msg: '最近一次数学成绩不能为空，请输入' },
    { type: 'regex', regex: /^\d{1,3}(\.\d+)?[\(（]\d{1,3}[\)）]$/, msg: '最近一次数学成绩格式不正确' }
  ])

  items.$physicScore.data('rule', [
    { type: 'notNull', msg: '最近一次物理成绩不能为空，请输入' },
    { type: 'regex', regex: /^\d{1,3}(\.\d+)?[\(（]\d{1,3}[\)）]$/, msg: '最近一次物理成绩格式不正确' }
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
          if (value.length > verify.max || value.length < verify.min) return { verify: false, msg: verify.msg }
          break;
        case 'size':
          if (value > verify.max || value < verify.min) return { verify: false, msg: verify.msg }
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

  function checkItem(dom) {
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

  function gradeChange(event) {
    var value = event.target.value;
    if (value == 0) {
      $gradeOther.show();
      items.$gradeOther.focus();
    } else {
      $gradeOther.hide();
    }
  }

  function Submit(event) {
    var list = ['name', 'sex','grade', 'gradeOther', 'schoolName', 'residence', 'mathScore', 'physicScore', 'schedule'];
    var data = {};
    var submit = $('[name=submit]');
    for (var i = 0; i < list.length; i++) {
      var key = list[i];
      if (key == 'gradeOther' && $.trim(items.$grade.val()) != 0) continue;
      data[key] = checkItem(items['$' + key]);
    }
    var error = $('.form-group.error');
    if (error.length > 0) {
      return $('body').animate({ scrollTop: error.offset().top }, 800);
    }
    submit.addClass('disabled')
    data.token = token;

    common.actions.commonNewSurvey(data).done(function(res) {
      if (res.code == 0) {
        $('.container').hide();
        $('.success-msg').show();
      } else {
        submit.removeClass('disabled');
        common.toast(res.message);
      }
    })
  }
  $gradeOther.hide();
  $('[name=submit]').on('click', Submit);
  $('input').on('focus blur', Change);
  $('select').on('focus blur', Change);
  $('[name=grade]').on('change', gradeChange);
});
