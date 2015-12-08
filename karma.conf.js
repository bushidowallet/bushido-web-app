module.exports = function(config){
  config.set({
    reporters: ['progress'],
    basePath : './',
    files : [
      'app/components/angular/angular.js',
      'app/components/angular-cookies/angular-cookies.js',
      'app/components/angular-ui-router/release/angular-ui-router.js',
      'app/modules/docs/*.js'
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