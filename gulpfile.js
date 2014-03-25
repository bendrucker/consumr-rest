'use strict';

var gulp    = require('gulp');
var plugins = require('gulp-load-plugins')();

var files = {
  src: 'src/*.js',
  test: 'test/**/*.js'
};

files.all = [files.src, files.test];

gulp.task('lint', function () {
  return gulp.src(files.all)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'));
});