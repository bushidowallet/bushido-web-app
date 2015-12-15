module.exports = function(config){
  config.set({
    reporters: ['progress'],
    basePath : './',
    files : [
      'src/components/jquery/dist/jquery.js',
      'src/components/angular/angular.js',
      'src/components/angular-cookies/angular-cookies.js',
      'src/components/angular-ui-router/release/angular-ui-router.js',
      'src/components/angular-mocks/angular-mocks.js',
      'src/js/app.js',
      'src/modules/**/*.js'
    ],
    autoWatch : true,
    frameworks: ['jasmine'],
    browsers : ['Chrome', 'Firefox', 'PhantomJS'],
    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],
    singleRun: true
  });
};