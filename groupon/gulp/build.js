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
var imagemin = require('gulp-imagemin');
var gulpif = require('gulp-if');
var gutil = require('gulp-util')

var config = require('../package.json');
var rename = require("gulp-rename");
var urlPrefixer = require('gulp-url-prefixer');

var modules = ['index', 'login'];
var buildPath = '../build/',
  srcPath = '../src/';
var isDev = process.argv[6] == 'dev';
var cdnHost = isDev ? '//zongjiewebimg.chaisenwuli.com/activitys/groupon/' : '//zongjiewebimg.chaisenwuli.com/test/activitys/groupon/';

gulp.task('clean', function(cb) {
  del([buildPath + '**/*'], cb);
});

var htmlmin = require('gulp-htmlmin');
var htmlOptions = {
  removeComments: true, //清除HTML注释
  collapseWhitespace: true, //压缩HTML
  removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
};

modules.forEach(key => {
  gulp.task('html:' + key, function() {
    gulp.src(srcPath + key + '.html')
      .pipe(htmlreplace({
        'css': 'css/style-' + config.version + '.css',
        'js': ['js/vender-' + config.version + '.js', 'js/' + key + '-' + config.version + '.js']
      }))
      .pipe(urlPrefixer.html({
        prefix: cdnHost
      }))
      .pipe(gulpif(isDev,htmlmin(htmlOptions)))
      .pipe(gulp.dest(buildPath));
  });
})

modules.forEach(key => {
  gulp.task('js:' + key, function() {
    gulp.src([srcPath + 'js/common.js', srcPath + 'js/' + key + '.js'])
      .pipe(concat(key + '.js'))
      .pipe(gulpif(isDev,uglify().on('error',function(err){
        gutil.log(err);
        this.emit('end');
      })))
      .pipe(rename(key + "-" + config.version + ".js"))
      .pipe(gulp.dest(buildPath + 'js/'))
  });
})

gulp.task('css', function() {
  gulp.src(srcPath + 'scss/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulpif(isDev,minifycss()))
    .pipe(rename("style-" + config.version + ".css"))
    .pipe(gulp.dest(buildPath + 'css/'));
});

gulp.task('js:vender', function() {
  gulp.src(srcPath + 'vender/**/*.js')
    .pipe(concat('vender.js'))
    .pipe(gulpif(isDev,uglify()))
    .pipe(rename("vender-" + config.version + ".js"))
    .pipe(gulp.dest(buildPath + "js/"))
});

gulp.task('img', function() {
  gulp.src(srcPath + 'img/**/*')
    .pipe(imagemin({
      optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
      multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest(buildPath + 'img/'))
});

var buildTask = ['css', 'img', 'js:vender'];
modules.forEach(key => {
  buildTask.push('html:' + key);
  buildTask.push('js:' + key);
});
gulp.task('build', buildTask);
