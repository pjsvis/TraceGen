
﻿// Ref: https://gist.github.com/spboyer/96339ce687b0c79b8258
var gulp = require('gulp');
var mainBowerFiles = require('main-bower-files');
var $ = require('gulp-load-plugins')({
    lazy: true
});

var client = '';
var layoutSource = 'Views/Shared/';
var targetDir = 'build/lib';

var config = {
    client: client,
    layoutSource: layoutSource,
    index: layoutSource + '_Layout.cshtml',
    css: [
        targetDir + '/**/*.css'
    ],
    js: [
        targetDir + '/**/*.js'
    ]
}


gulp.task('bower', function () {
  return $.bower();
});

gulp.task('default', [], function () {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest("build/lib"));
});

gulp.task('inject', function () {

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css), {
           // ignorePath: 'build'
        }))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.layoutSource));
});
