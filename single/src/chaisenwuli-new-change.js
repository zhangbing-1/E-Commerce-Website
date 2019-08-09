const btn = document.querySelector('.copy-btn');
btn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.setAttribute('readonly', 'readonly');
  input.setAttribute('value', 'chaisen456');
  document.body.appendChild(input);
  // input.setSelectionRange(0, 9999);
  input.select();
  if (document.execCommand('copy')) {
    document.execCommand('copy');
    console.log('复制成功');
  }
  document.body.removeChild(input);
})

console.log("window.innerWidth: " +  window.innerWidth)
if (window.innerWidth < 500) {
  document.querySelector('.top-banner').src = './img/student_early_love_banner_h5.png';
} else  {
  document.querySelector('.top-banner').src = './img/student_early_love_banner_web.png';
}

document.querySelector('.desc-3').innerHTML = 'chaisen456';


