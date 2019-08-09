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

var buildPath = '../build/',
  srcPath = '../src/';
var isDev = process.argv[6] == 'dev';
var cdnHost = isDev ? '//zongjiewebimg.chaisenwuli.com/activitys/single/' : '//zongjiewebimg.chaisenwuli.com/test/activitys/single/';

gulp.task('clean', function(cb) {
  del([buildPath + '**/*'], cb);
});

var htmlmin = require('gulp-htmlmin');
var htmlOptions = {
  removeComments: true, //清除HTML注释
  collapseWhitespace: true, //压缩HTML
  removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
};

gulp.task('html', function() {
  gulp.src(srcPath + '*.html')
    .pipe(urlPrefixer.html({
      prefix: cdnHost
    }))
    .pipe(gulpif(isDev, htmlmin(htmlOptions)))
    .pipe(gulp.dest(buildPath));
})

gulp.task('css', function() {
  gulp.src(srcPath + 'css/*.css')
    .pipe(gulp.dest(buildPath + 'css/'));
})

gulp.task('js', function() {
  gulp.src(srcPath + 'js/*.js')
    .pipe(gulp.dest(buildPath + 'js/'));
})

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

gulp.task('build', ['html', 'img', 'css', 'js']);
