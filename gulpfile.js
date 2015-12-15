var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var Server = require('karma').Server;
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');

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
    return gulp.src(['./app/js/*.js', './app/modules/*/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('styles', function() {
    return gulp.src('./app/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(minifyCss())
        .pipe(sourcemaps.write('./', {addComment: false}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('default', ['styles', 'test', 'jshint']);