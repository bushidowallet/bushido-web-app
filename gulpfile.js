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

gulp.task('flatten', function() {
    gulp.src(['./src/components/**/*.*'])
        .pipe(flatten({ includeParents: [1, 1] }))
        .pipe(gulp.dest('dist/components'));
});

gulp.task('copy-components', function() {
    gulp.src(['./src/components/angular/*.min.*'])
        .pipe(gulp.dest('dist/components/angular'));
    gulp.src(['./src/components/angular-cookies/*.min.*'])
        .pipe(gulp.dest('dist/components/angular-cookies'));
    gulp.src(['./src/components/angular-ui-router/release/*.min.*'])
        .pipe(gulp.dest('dist/components/angular-ui-router'));
    gulp.src(['./src/components/bootstrap/dist/**/*'])
        .pipe(gulp.dest('dist/components/bootstrap'));
    gulp.src(['./src/components/components-font-awesome/**/*'])
        .pipe(gulp.dest('dist/components/components-font-awesome'));
    gulp.src(['./src/components/datatables.net/js/*.min.*'])
        .pipe(gulp.dest('dist/components/datatables.net'));
    gulp.src(['./src/components/datatables.net-bs/js/*.min.*'])
        .pipe(gulp.dest('dist/components/datatables.net-bs'));
    gulp.src(['./src/components/datatables.net-bs/css/*.min.*'])
        .pipe(gulp.dest('dist/components/datatables.net-bs'));
    gulp.src(['./src/components/jquery/dist/*.min.*'])
        .pipe(gulp.dest('dist/components/jquery'));
    gulp.src(['./src/components/metisMenu/dist/*.min.*'])
        .pipe(gulp.dest('dist/components/metisMenu'));
    gulp.src(['./src/components/sockjs-client/dist/*.min.*'])
        .pipe(gulp.dest('dist/components/sockjs-client'));
    gulp.src(['./src/components/stomp-websocket/lib/*.min.*'])
        .pipe(gulp.dest('dist/components/stomp-websocket'));
    gulp.src(['./src/components/webshim/js-webshim/minified/**/*'])
        .pipe(gulp.dest('dist/components/js-webshim'));
});

gulp.task('copy-modules', function() {
    gulp.src('./src/modules/**/*')
        .pipe(gulp.dest('dist/modules'));
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'js-uglify', 'copy-components', 'copy-modules', 'copy-images', 'test', 'jshint');
});