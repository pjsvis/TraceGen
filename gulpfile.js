///<reference path="typings/tsd.d.ts"/>
var addStream = require('add-stream');
var gulp = require('gulp');
var del = require('del');
var glob = require('glob')
var nodemon = require('gulp-nodemon');
var inject = require('gulp-inject');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var cssNano = require('gulp-cssnano');
var rename = require('gulp-rename');
var sourceMaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
var uglify = require('gulp-uglify')

// TODO: Replace with less
//var sass = require('gulp-sass');
var path = require('path');
var wiredep = require('wiredep').stream;
var _ = require('lodash');

// Use var to hold src path glob
var tsSrc = ['src/app.ts', 'src/**/*.ts'];
var tsJsSrc = ['src/app.ts', 'src/**/*.ts', 'src/**/*.js'];

// Lint to keep us in line
gulp.task('lint', function () {
    return gulp.src(['src/**/*.ts'])
        .pipe(tslint())
        .pipe(tslint.report('default'));
});

// Clean out any js file generated locally by ts
// NOTE: Get a list of *.ts files and convert the ext to js and js.map
// then delete the list
var filter = function (file) {
    return file.replace(/.ts$/, '.js');
};

var filterMap = function (file) {
    return file.replace(/.ts$/, '.js.map');
};

gulp.task('clean', function () {
    return glob('./src/**/*.ts', function (err, files) {
        del(files.map(filter));
        del(files.map(filterMap));
    })
})

// Compile typescript files in place and add sourcemaps
gulp.task('compile', function () {

    return gulp.src(['./src/app.ts', './src/**/*.ts'])
        .pipe(addStream.obj(prepareTemplates()))
        .pipe(sourceMaps.init())
        .pipe(ts({
            noImplicitAny: true,
            suppressImplicitAnyIndexErrors: true
            //allowJs: true,
            //out: 'app.js'
        }))
        .pipe(gulp.dest('./src/**/*.*'))
    //.pipe(rename('app.min.js'))
    //.pipe(uglify())   // Don't uglify just yet
        .pipe(sourceMaps.write('.'))
    //.pipe(gulp.dest('dist'));
});
// Concatenate & minify Typescript
// NOTE: we must have app.ts here with the angular setter
gulp.task('scripts', function () {

    return gulp.src(['./src/app.ts', './src/**/*.ts'])
        .pipe(addStream.obj(prepareTemplates()))
        .pipe(sourceMaps.init())
        .pipe(ts({
            noImplicitAny: true,
            suppressImplicitAnyIndexErrors: true,
            allowJs: true,
            out: 'app.js'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(rename('app.min.js'))
    //.pipe(uglify())   // Don't uglify just yet
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('templates', function () {
    // we get a conflict with the < % = var % > syntax for $templateCache
    // template header, so we'll just encode values to keep yo happy
    var encodedHeader = "angular.module(&quot;&lt;%= module %&gt;&quot;&lt;%= standalone %&gt;).run([&quot;$templateCache&quot;, function($templateCache:any) {";
    return gulp.src(['./src/**/*.html'])
        .pipe(templateCache('templates.ts', {
            root: "app-templates",
            module: "app.templates",
            standalone: true,
            templateHeader: _.unescape(encodedHeader)
        }))
        .pipe(gulp.dest('./src/'));
});

// Compile remaining javascript
gulp.task('jsScripts', function () {
    //"**/*.js": { "when": "$(basename).ts"},
    return gulp.src(['./src/**/*.js'])
        .pipe(concat('appJs.js'))
        .pipe(gulp.dest('dist'))
        .pipe(sourceMaps.init())
        .pipe(gulp.dest('dist'))
        .pipe(rename('appJs.min.js'))
    //.pipe(uglify())   // Don't uglify just yet
        .pipe(sourceMaps.write('.'))
        .pipe(gulp.dest('dist'));
});

// TODO: Replace with less compile
// Compile, concat & minify sass
gulp.task('sass', function () {
    console.log('TODO: replace sass with less');
    //return gulp.src('src/**/*.scss')
    //    .pipe(sass().on('error', sass.logError))
    //    .pipe(gulp.dest('dist/css'));
});

gulp.task('concatCss', ['sass'], function () {
    return gulp.src('dist/css/**/*.css')
        .pipe(concatCss("app.css"))
        .pipe(gulp.dest('ist'))
});

gulp.task('cssNano', ['sass', 'concatCss'], function () {
    return gulp.src('dist/app.css')
        .pipe(cssNano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist'));
});

// Inject js, css + bower  files
gulp.task('inject', ['scripts', 'cssNano'], function () {

    // inject our dist files
    // var injectSrc = gulp.src([
    //     './dist/app.css',
    //     './dist/app.js'
    // ], { read: false });

    // Inject all of our src/**/*.js files along with our dist/app.css
    var injectSrc = gulp.src(['./src/**/*.js'], { read: false })

    var injectOptions = {
        ignorePath: '/public'
    };

    // inject bower deps
    var options = {
        bowerJson: require('./bower.json'),
        directory: './lib',
        ignorePath: '../../public',
        exclude: [/ag-grid/] // Wire this up manually in index.html
        // "overrides": {
        //     "ag-grid": {
        //         "main": ["dist/angular-grid.min.js"]
        //     }
        // }
    };

    return gulp.src('./*.html')
        .pipe(wiredep(options))
        .pipe(inject(injectSrc, injectOptions))
        .pipe(gulp.dest('./'));

});

gulp.task('serve', ['clean', 'scripts', 'jsScripts', 'cssNano', 'inject'], function () {

    var options = {
        restartable: "rs",
        verbose: true,
        ext: "ts html scss",
        script: 'server.js',
        delayTime: 1,
        watch: ['gulpfile.js', 'src/app.ts', 'src/**/*.ts', 'src/**/*.js', 'src/**/*(*.ts|*.js|*.html)', 'src/**/*(*.scss | *.css)'],
        env: {
            'PORT': 3000
        },
        ignore: ["dist/*", "dist/**/**"],
        // bit faster if we only do what we need to
        tasks: function (changedFiles) {
            var tasks = [];
            changedFiles.forEach(function (file) {
                var ext = path.extname(file);
                if (ext === '.ts' || ext === '.html') {
                    tasks.push('lint');
                    tasks.push('scripts');
                }
                else if (ext === '.scss') {
                    tasks.push('sass');
                    tasks.push('concatCss');
                    tasks.push('cssNano');
                }
            });
            return tasks
        }
    };

    return nodemon(options)
        .on('restart', function (ev) {
            console.log('restarting..');
        });
});

gulp.task('default', ['compile', 'inject']);
// Default Task
//gulp.task('default', ['lint', 'clean',  'scripts', 'jsScripts',  'concatCss', 'cssNano', 'inject']);

//gulp.task('test', ['lint', 'clean', 'scripts',  'jsScripts',  'concatCss', 'cssNano', 'inject']);

function prepareTemplates() {

    // we get a conflict with the < % = var % > syntax for $templateCache
    // template header, so we'll just encode values to keep yo happy
    var encodedHeader = "angular.module(&quot;&lt;%= module %&gt;&quot;&lt;%= standalone %&gt;).run([&quot;$templateCache&quot;, function($templateCache:any) {";
    return gulp.src('src/**/*.html')
        .pipe(templateCache('templates.ts', {
            root: "app-templates",
            module: "app",
            standalone: true,
            templateHeader: _.unescape(encodedHeader)
        }));
}
