var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var Server = require('karma').Server;

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

gulp.task('default', ['test', 'jshint']);