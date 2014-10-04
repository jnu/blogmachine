'use strict';

// Dependencies

var _ = require('underscore');
var gulp = require('gulp');
var del = require('del');
var server = require('gulp-develop-server');
var changed = require('gulp-changed');
var react = require('gulp-react');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var envify = require('envify');
var source = require('vinyl-source-stream');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');


// Env setup

var PROD = (process.env.NODE_ENV === 'production');
var BUNDLE_NAME = 'blog-app.' + (PROD ? 'min' : 'dev') + '.js';

var SRC_DIR = './src';
var SRC_JS = SRC_DIR + '/**/*.js';
var SRC_JSX = SRC_JS + 'x';
var SRC_LESS_BUNDLES = SRC_DIR + '/styles/*.less';
var SRC_LESS_MODULES = SRC_DIR + '/styles/**/*.less';
var SRC_HTML = SRC_DIR + '/**/*.html';
var SRC_PNG = SRC_DIR + '/**/*.png';
var SRC_BUNDLE = SRC_DIR + '/main.js';
var DEST_DIR = './dist';
var SERVER = DEST_DIR + '/app.js';

var EXCLUDED = [
    '!./src/main.js'
];

var SRC_TO_COPY = [SRC_JS, SRC_HTML, SRC_PNG].concat(EXCLUDED);


// Helpers

function createBrowserify(args) {
    return browserify(_.defaults(args || {}, {
            insertGlobals: true,
            debug: !PROD,
            extensions: ['.jsx'],
            standalone: 'Blog'
        }))
        .transform(envify)
        .transform({ 'es6': true }, reactify);
}

function useBrowserify(b) {
    return b.bundle()
        .pipe(source(BUNDLE_NAME))
        .pipe(gulp.dest(DEST_DIR));
}


// Low-level tasks

gulp.task('clean', function(cb) {
    del([DEST_DIR + '/**', DEST_DIR], cb);
});

gulp.task('server:start', function() {
    server.listen({
        path: SERVER,
        execArgv: ['--harmony'],
        'NODE_ENV': process.env.NODE_ENV
    });
});

gulp.task('copy:dev', function() {
    return gulp.src(SRC_TO_COPY)
        .pipe(changed(DEST_DIR))
        .pipe(gulp.dest(DEST_DIR));
});

gulp.task('jsx', function() {
    return gulp.src(SRC_JSX)
        .pipe(react({ harmony: true }))
        .pipe(gulp.dest(DEST_DIR));
});

gulp.task('less:dev', function() {
    gulp.src(SRC_LESS_BUNDLES)
        .pipe(sourcemaps.init())
        .pipe(less({ compress: true }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(DEST_DIR));
});

gulp.task('bundle:dev', function() {
    var b = createBrowserify();
    b.add(SRC_BUNDLE);
    useBrowserify(b);
});

gulp.task('watch:bundle', function() {
    var b = watchify(createBrowserify(watchify.args));

    var rebundle = function() {
        return useBrowserify(b);
    };

    b.on('update', rebundle);
    b.add(SRC_BUNDLE);

    rebundle();
});


// High-level tasks
gulp.task('build:dev', ['bundle:dev', 'copy:dev', 'less:dev', 'jsx']);
gulp.task('watch', [
        'watch:bundle',
        'server:start'
    ], function() {
        gulp.watch(SRC_JSX, ['jsx']);
        gulp.watch(SRC_TO_COPY, ['copy:dev']);
        gulp.watch(SRC_LESS_MODULES, ['less:dev']);
        gulp.watch([SERVER], server.restart);
    });

