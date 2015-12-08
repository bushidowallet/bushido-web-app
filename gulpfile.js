var gulp = require('gulp');
var Server = require('karma').Server;

gulp.task('test', function (done) {
    console.log(__dirname);
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        browsers : ['Firefox']
    }, done).start();
});

gulp.task('default', ['test']);