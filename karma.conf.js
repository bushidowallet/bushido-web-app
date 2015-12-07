module.exports = function(config){
  config.set({

    reporters: ['progress'],

    basePath : './',

    files : [
      'app/js/lib/angular/angular.js',
      'app/js/lib/angular/angular-cookies.js',
      'app/js/lib/angular/angular-ui-router.js',
      'app/modules/docs/*.js'     
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    singleRun: true

  });
};