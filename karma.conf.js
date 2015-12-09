module.exports = function(config){
  config.set({
    reporters: ['progress'],
    basePath : './',
    files : [
      'app/components/jquery/dist/jquery.js',
      'app/components/angular/angular.js',
      'app/components/angular-cookies/angular-cookies.js',
      'app/components/angular-ui-router/release/angular-ui-router.js',
      'app/components/angular-mocks/angular-mocks.js',
      'app/js/app.js',
      'app/modules/**/*.js'
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