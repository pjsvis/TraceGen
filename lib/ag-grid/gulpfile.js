var gulp = require('gulp');
var path = require('path');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var foreach = require('gulp-foreach');
var rename = require("gulp-rename");
var stylus = require('gulp-stylus');
var buffer = require('vinyl-buffer');
var nib = require('nib');
var gulpTypescript = require('gulp-typescript');
var typescript = require('typescript');
var sourcemaps = require('gulp-sourcemaps');
var header = require('gulp-header');
var merge = require('merge2');
var pkg = require('./package.json');
var tsd = require('gulp-tsd');

//var headerTemplate = '// Angular Grid\n// Written by Niall Crosby\n// www.angulargrid.com\n\n// Version 1.10.1\n\n';
var headerTemplate = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

<<<<<<< HEAD
var dtsHeaderTemplate =
    '// Type definitions for <%= pkg.name %> v<%= pkg.version %>\n' +
    '// Project: <%= pkg.homepage %>\n' +
    '// Definitions by: Niall Crosby <https://github.com/ceolter/>\n' +
    '// Definitions: https://github.com/borisyankov/DefinitelyTyped\n';

gulp.task('default', ['watch']);
gulp.task('release', ['copyToDocs-release']);

gulp.task('webpack-all', ['webpack','webpack-minify','webpack-noStyle','webpack-minify-noStyle'], tscTask);

gulp.task('tsc', ['cleanDist','cleanDocs'], tscTask);

gulp.task('webpack-minify-noStyle', ['tsc','stylus'], webpackTask.bind(null, true, false));
gulp.task('webpack-noStyle', ['tsc','stylus'], webpackTask.bind(null, false, false));
gulp.task('webpack-minify', ['tsc','stylus'], webpackTask.bind(null, true, true));
gulp.task('webpack', ['tsc','stylus'], webpackTask.bind(null, false, true));

gulp.task('copyToDocs-dev', ['webpack'], copyToDocsTask);
gulp.task('copyToDocs-release', ['webpack-all'], copyToDocsTask);

gulp.task('watch', ['copyToDocs-dev'], watchTask);
//gulp.task('tsd', tsdTask);
gulp.task('stylus', ['cleanDist','cleanDocs'], stylusTask);
gulp.task('cleanDist', cleanDist);
gulp.task('cleanDocs', cleanDocs);

function cleanDist() {
    return gulp
        .src('dist', {read: false})
        .pipe(clean());
}

function cleanDocs() {
    return gulp
        .src('docs/dist', {read: false})
        .pipe(clean());
}

//function tsdTask(callback) {
//    tsd({
//        command: 'reinstall',
//        config: './tsd.json'
//    }, callback);
//}

//function tsTestTask() {
//    return gulp.src('./spec/**/*.js')
//        .pipe(jasmine({
//            verbose: false
//        }));
//}
=======
gulp.task('default', ['stylus', 'tsd', 'debug-build', 'watch']);
gulp.task('release', ['stylus', 'tsd', 'ts-release']);

// Build
gulp.task('debug-build', ['stylus', 'ts-debug']);
gulp.task('stylus', stylusTask);
gulp.task('ts-debug', tsDebugTask);
gulp.task('ts-release', tsReleaseTask);

// Watch
gulp.task('watch', watchTask);

gulp.task('tsd', function (callback) {
    tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});
>>>>>>> 5c9374a07c80de015dbc49de547c1699293134f6

gulp.task('es6', function (callback) {
    var tsResult = gulp
        .src('src/es6/**/*.ts')
        .pipe(sourcemaps.init()) // for sourcemaps only
        .pipe(gulpTypescript({
            typescript: typescript,
            noImplicitAny: true,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            target: 'es5',
            module: 'commonjs'
        }));

    return tsResult.js
        .pipe(sourcemaps.write()) // for sourcemaps only
        .pipe(gulp.dest('./docs/dist'));
});

// does TS compiling, sourcemaps = yes, minification = no, distFolder = no
function tsDebugTask() {

    var tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(sourcemaps.init()) // for sourcemaps only
        .pipe(gulpTypescript({
            typescript: typescript,
            noImplicitAny: true,
            //experimentalDecorators: true,
            //emitDecoratorMetadata: true,
            target: 'es5',
            //module: 'commonjs',
            out: 'angular-grid.js'
        }));

    return tsResult.js
        .pipe(sourcemaps.write()) // for sourcemaps only
        .pipe(rename('angular-grid.js'))
        .pipe(gulp.dest('./docs/dist'));

}

// does TS compiling, sourcemaps = no, minification = yes, distFolder = yes
function tsReleaseTask() {
    var tsResult = gulp
        .src('src/ts/**/*.ts')
        .pipe(gulpTypescript({
            typescript: typescript,
            noImplicitAny: true,
            //experimentalDecorators: true,
            //emitDecoratorMetadata: true,
            target: 'es5',
            //module: 'commonjs',
            declarationFiles: true,
            out: 'angular-grid.js'
        }));

    return merge([
        tsResult.dts.pipe(gulp.dest('dist')),
        tsResult.js
            .pipe(rename('angular-grid.js'))
            .pipe(header(headerTemplate, { pkg : pkg }))
<<<<<<< HEAD
            .pipe(gulp.dest('dist/lib'))
    ])
}

function webpackTask(minify, styles) {

    var plugins = [];
    if (minify) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}));
    }
    var mainFile = styles ? './main-with-styles.js' : './main.js';

    var fileName = 'ag-grid';
    fileName += minify ? '.min' : '';
    fileName += styles ? '' : '.noStyle';
    fileName += '.js';

    return gulp.src('src/entry.js')
        .pipe(webpackStream({
            entry: {
                main: mainFile
            },
            output: {
                path: path.join(__dirname, "dist"),
                filename: fileName,
                library: ["agGrid"],
                libraryTarget: "umd"
            },
            //devtool: 'inline-source-map',
            module: {
                loaders: [
                    { test: /\.css$/, loader: "style-loader!css-loader" }
                ]
            },
            plugins: plugins
        }))
        .pipe(header(bundleTemplate, { pkg : pkg }))
        .pipe(gulp.dest('./dist/'));
=======
            .pipe(gulp.dest('./dist'))
            .pipe(gulp.dest('./docs/dist'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(rename('angular-grid.min.js'))
            .pipe(gulp.dest('./dist'))
            .pipe(gulp.dest('./docs/dist'))
    ]);
>>>>>>> 5c9374a07c80de015dbc49de547c1699293134f6
}

function stylusTask() {

    // Uncompressed
    gulp.src('./src/styles/*.styl')
        .pipe(foreach(function(stream, file) {
            return stream
                .pipe(stylus({
                    use: nib(),
                    compress: false
                }))
                .pipe(gulp.dest('./docs/dist/'))
                .pipe(gulp.dest('./dist/'));
        }));

    // Compressed
    return gulp.src('./src/styles/*.styl')
        .pipe(foreach(function(stream, file) {
            return stream
                .pipe(stylus({
                    use: nib(),
                    compress: true
                }))
                .pipe(rename((function() {
                    var name = path.basename(file.path);
                    var dot = name.indexOf('.');
                    name = name.substring(0, dot) + '.min.css';
                    return name;
                })()))
                .pipe(gulp.dest('./dist/'))
                .pipe(gulp.dest('./docs/dist/'));
        }));
}

function watchTask() {
<<<<<<< HEAD
    gulp.watch('./src/ts/**/*', ['copyToDocs-dev']);
    gulp.watch('./src/styles/**/*', ['copyToDocs-dev']);
=======
    gulp.watch('./src/ts/**/*', ['ts-debug']);
    gulp.watch('./src/styles/**/*', ['stylus']);
>>>>>>> 5c9374a07c80de015dbc49de547c1699293134f6
}
