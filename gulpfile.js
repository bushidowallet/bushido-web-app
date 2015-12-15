var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var Server = require('karma').Server;
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var flatten = require('gulp-flatten');

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        browsers : ['Firefox']
    }, done).start();
});

gulp.task('test-local', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        browsers : ['Chrome']
    }, done).start();
});

gulp.task('jshint', function() {
    return gulp.src(['./src/js/*.js', './src/modules/*/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('styles', function() {
    return gulp.src('./src/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(minifyCss())
        .pipe(sourcemaps.write('./', {addComment: false}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('js-uglify', function() {
    return gulp.src('./src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write('./', {addComment: false}))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('copy-images', function() {
    gulp.src('./src/images/*.*')
        .pipe(gulp.dest('dist/images'));
});

gulp.task('js-components', function() {
    gulp.src('./src/components/**/*.min.js')
        .pipe(flatten({ includeParents: [1, 1]}))
        .pipe(gulp.dest('dist/components'));
});

gulp.task('css-components', function() {
    gulp.src(['./src/components/**/*.min.css', './src/components/**/*.map'])
        .pipe(flatten({ includeParents: [1, 1]}))
        .pipe(gulp.dest('dist/components'));
});

gulp.task('copy-modules', function() {
    gulp.src('./src/modules/**/*')
        .pipe(gulp.dest('dist/modules'));
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'js-uglify', 'js-components', 'css-components', 'copy-modules', 'copy-images', 'test', 'jshint');
});