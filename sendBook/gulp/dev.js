var gulp = require('gulp');
var del = require('del');

var concat = require('gulp-concat');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var htmlreplace = require('gulp-html-replace');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var imagemin = require('gulp-imagemin');

var config = require('../package.json');
var rename = require("gulp-rename");

var modules = ['index','login','prebind','address'];

var publicPath = '../public/',srcPath = '../src/';

gulp.task('clean', function(cb) {
  return del([publicPath + '**/*'], cb);
});

gulp.task('js:vender', function() {
  return gulp.src(srcPath + 'vender/**/*.js')
    .pipe(concat('vender.js')) // 做一些需要所有文件的操作
    .pipe(rename("vender-" + config.version + ".js"))
    .pipe(gulp.dest(publicPath + 'js/'))
    .pipe(reload({ stream: true }));
});

modules.forEach(key => {
  gulp.task('js:' + key, function() {
    return gulp.src([srcPath + 'js/common.js', srcPath + 'js/' + key + '.js'])
      .pipe(concat(key + '.js')) // 做一些需要所有文件的操作
      .pipe(rename(key + "-" + config.version + ".js"))
      .pipe(gulp.dest(publicPath + 'js/'))
      .pipe(reload({ stream: true }));
  });
})

gulp.task('sass', function() {
  return gulp.src(srcPath + 'scss/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(rename("style-" + config.version + ".css"))
    .pipe(gulp.dest(publicPath + 'css/'))
    .pipe(reload({ stream: true }));
});


modules.forEach(key => {
  gulp.task('html:' + key, function() {
    gulp.src(srcPath + key + '.html')
      .pipe(htmlreplace({
        'css': 'css/style-' + config.version + '.css',
        'js': ['js/vender-' + config.version + '.js', 'js/' + key + '-' + config.version + '.js']
      }))
      .pipe(gulp.dest(publicPath))
      .pipe(reload({ stream: true }));
  });
})

gulp.task('img', function() {
  gulp.src(srcPath + 'img/**/*')
    .pipe(gulp.dest(publicPath + 'img/'))
    .pipe(reload({ stream: true }));
});


var devTask = ['sass', 'js:vender', 'img'];
modules.forEach(key => {
  devTask.push('html:' + key);
  devTask.push('js:' + key);
});

gulp.task('dev', devTask, function() {
  browserSync.init({
    server: {
      baseDir: publicPath, // 启动服务的目录 默认 index.html
      index: 'index.html' // 自定义启动文件名
    },
    notify: false,
    open: 'external', // 决定Browsersync启动时自动打开的网址 external 表示 可外部打开 url, 可以在同一 wifi 下不同终端测试
    port: 3500
  });

  var commonTask = [];
  modules.forEach(key => { commonTask.push('js:' + key) });
  gulp.watch( srcPath + 'js/common.js', commonTask);

  modules.forEach(key => {
    gulp.watch(srcPath + 'js/' + key + '.js', ['js:' + key]);
  });

  modules.forEach(key => {
    gulp.watch(srcPath + key +'.html', ['html:'+key]);
  });

  gulp.watch(srcPath + 'vender/**/*.js', ['js:vender']);
  gulp.watch(srcPath + 'scss/**/*.scss', ['sass']);
  gulp.watch(srcPath + 'img/**/*', ['img']);
});
