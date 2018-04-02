var gulp = require('gulp');
var del = require('del');

var concat = require('gulp-concat');
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var htmlreplace = require('gulp-html-replace');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var imagemin = require('gulp-imagemin');

var config = require('./package.json');
var rename = require("gulp-rename");


var modules = ['index','order','login','pay','main'];

// =================   build =================
var buildPath = 'build/activitys/cheapShop/'
gulp.task('clean', function(cb) {
  del(['build/**/*'], cb);
});

var htmlmin = require('gulp-htmlmin');
var htmlOptions = {
    removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    minifyJS: true, //压缩页面JS
    minifyCSS: true //压缩页面CSS
  };

modules.forEach(key =>{
  gulp.task('html:'+ key +'Build', function() {
    gulp.src('src/'+ key +'.html')
      .pipe(htmlreplace({
        'css': 'css/style-' + config.version  + '.css',
        'js': ['js/vender-' + config.version  + '.js','js/'+ key +'-' + config.version  + '.js']
      }))
      .pipe(htmlmin(htmlOptions))
      .pipe(gulp.dest(buildPath));
  });
})

modules.forEach(key =>{
  gulp.task('js:' + key + 'Build', function() {
    gulp.src(['src/js/common.js','src/js/' + key + '.js'])
      .pipe(concat(key + '.js'))
      .pipe(uglify())
      .pipe(rename(key + "-" + config.version  + ".js"))
      .pipe(gulp.dest(buildPath + 'js/'))
  });
})

gulp.task('css', function() {
  sass('src/scss/style.scss')
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(minifycss())
    .pipe(rename("style-" + config.version  + ".css"))
    .pipe(gulp.dest(buildPath  + 'css/'));
});

gulp.task('js:venderBuild', function() {
  gulp.src('src/vender/**/*.js')
    .pipe(concat('vender.js'))
    .pipe(uglify())
    .pipe(rename("vender-" + config.version  + ".js"))
    .pipe(gulp.dest(buildPath + "js/"))
});

gulp.task('image', function() {
  gulp.src('src/images/**/*')
    .pipe(imagemin({
      optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
      progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
      interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
      multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
    }))
    .pipe(gulp.dest(buildPath + 'images/'))
});
gulp.task('zip', function() {
  gulp.src('build/**/*')
    .pipe(zip('release-' + config.version + '.zip'))
    .pipe(gulp.dest('/Users/chengyongliu/Desktop/kalaku/'))
});

var buildTask = ['css', 'image', 'js:venderBuild'];
modules.forEach(key =>{
  buildTask.push('html:' + key + 'Build');
  buildTask.push('js:' + key + 'Build');
});
gulp.task('build', buildTask);





// =================   src  ================= --------------------------------------------------------------
var publicPath = 'public/zjwh5/activitys/cheapShop/'
gulp.task('clean:dev', function(cb) {
  return del(['public/**/*'], cb);
});

gulp.task('js:vender', function() {
  return gulp.src('src/vender/**/*.js')
    .pipe(concat('vender.js')) // 做一些需要所有文件的操作
    .pipe(rename("vender-" + config.version  + ".js"))
    .pipe(gulp.dest(publicPath + 'js/'))
    .pipe(reload({ stream: true }));
});

modules.forEach(key =>{
  gulp.task('js:' + key, function() {
    return gulp.src(['src/js/common.js','src/js/' + key + '.js'])
      .pipe(concat(key + '.js')) // 做一些需要所有文件的操作
      .pipe(rename(key + "-" + config.version  + ".js"))
      .pipe(gulp.dest(publicPath + 'js/'))
      .pipe(reload({ stream: true }));
  });
})

gulp.task('sass:dev', function() {
  return sass('src/scss/style.scss', { style: "expanded" })
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(rename("style-" + config.version  + ".css"))
    .pipe(gulp.dest(publicPath + 'css/'))
    .pipe(reload({ stream: true }));
});

modules.forEach(key =>{
  gulp.task('html:' + key, function() {
    gulp.src('src/' + key + '.html')
      .pipe(htmlreplace({
        'css': 'css/style-' + config.version  + '.css',
        'js': ['js/vender-' + config.version  + '.js','js/' + key + '-' + config.version  + '.js']
      }))
      .pipe(gulp.dest(publicPath))
      .pipe(reload({ stream: true }));
  });
})

gulp.task('image:dev', function() {
  gulp.src('src/images/**/*')
    .pipe(gulp.dest(publicPath + 'images/'))
    .pipe(reload({ stream: true }));
});


var devTask = ['sass:dev', 'js:vender', 'image:dev'];
modules.forEach(key =>{
  devTask.push('html:' + key );
  devTask.push('js:' + key );
});

gulp.task('dev', devTask, function() {
  browserSync.init({
    server: {
      baseDir: './public', // 启动服务的目录 默认 index.html
      index: 'index.html' // 自定义启动文件名
    },
    notify: false,
    open: 'external', // 决定Browsersync启动时自动打开的网址 external 表示 可外部打开 url, 可以在同一 wifi 下不同终端测试
    port: 3500
  });

  var commonTask = [];
  modules.forEach(key =>{ commonTask.push('js:' + key)});
  gulp.watch('src/js/common.js', commonTask);

  modules.forEach(key =>{
    gulp.watch('src/js/'+ key +'.js', ['js:' + key]);
  });

  var htmlTask = [];
  modules.forEach(key =>{ htmlTask.push('html:' + key)});
  gulp.watch('src/**/*.html', htmlTask);

  gulp.watch('src/vender/**/*.js', ['js:vender']);
  gulp.watch('src/scss/**/*.scss', ['sass:dev']);
  gulp.watch('src/images/**/*', ['image:dev']);

});
