
'use strict';

var gulp = require('gulp');

var concat = require('gulp-concat');
var clean = require('gulp-clean');

// JS检查，压缩，合并
var jsLint = require('gulp-jslint');
var uglify = require('gulp-uglify');

// CSS编译，资源，兼容性，压缩
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

// 静态文件打包合并
var webpack = require('gulp-webpack');

// MD5戳
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var runSequence = require('run-sequence');

var config = require('./webpack.config');



/*============ develop =============*/
gulp.task('watch', function() {
  gulp.watch(['./src/css/*.css','./src/css/*.scss'], ['css']);
  gulp.watch('./src/js/*.js', ['js']);
});

gulp.task('js', function() {
  gulp.src('./src/js')
    .pipe(jsLint())
    .pipe(webpack(config))
    .pipe(gulp.dest('./build'));
});

gulp.task('css', function() {
  gulp.src(['./src/css/*.css','./src/css/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(concat('app.css'))
    .pipe(sass().on('error',sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build'));
});



/*============ publish =============*/

gulp.task('publish-js', function() {
  return gulp.src(['./src/js'])
    .pipe(webpack(config))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('./build'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./build/rev/js'));
});

gulp.task('publish-css', function() {
  return  gulp.src(['./src/css/*.css','./src/css/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(concat('app.css'))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(rev()) // todo: 未能正确识别资源地图
    .pipe(gulp.dest('./build'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('./build/rev/css'));
});

gulp.task('publish-html', function() {
  return gulp.src(['./build/rev/**/*.json', './*/*.html','./index.html'])
    .pipe(revCollector({
      dirReplacements: {
        'build/': ''
      }
    }))
    .pipe(gulp.dest('./build/'));
});

gulp.task('publish', function(callback) {
  gulp.src(['./build/'])
  .pipe(clean());

  runSequence(
    ['publish-css', 'publish-js'],
    'publish-html',
    callback);
});
