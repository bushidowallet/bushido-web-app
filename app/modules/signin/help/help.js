var help = angular.module('help', ['app', 'ui.router']);

help.factory('helpFieldState', function () {
    return { email: null }
});

help.config(function($stateProvider) {

    $stateProvider
        .state('welcome', {
            name: 'welcome',
            templateUrl: "/modules/signin/help/welcome.html"
        })
        .state('thanks', {
            name: 'thanks',
            templateUrl: "/modules/signin/help/thanks.html",
            controller: function ($scope, helpFieldState) {
                $scope.email = helpFieldState.email;
            }
        })
        .state('forgotpassword', {
            name: 'forgotpassword',
            templateUrl: "/modules/signin/help/forgotpassword.html",
            controller: function($scope, $state, $http, helpFieldState) {
                $scope.bdisabled = true;
                $scope.email = '';
                $scope.$watch('email', function() {
                    helpFieldState.email = $scope.email;
                    check();
                });
                var check = function() {
                    $scope.bdisabled = true;
                    var o = $scope.email.match(/\S+@\S+\.\S+/);
                    if (o != null) {
                        $scope.bdisabled  = false;
                    }
                };
                $scope.doReset = function() {
                    var url = $scope.config.urlBase + '/api/v2/user/password/reset';
                    var request = {email: $scope.email};
                    $http.post(url, JSON.stringify(request)).success(function(data) {
                            $state.go('thanks');
                        }).error(function(data) {
                            $state.go('thanks');
                        }
                    );
                };
            }
        });
});
help.controller('helpController', ['$scope', '$state', 'appConfig', function ($scope, $state, appConfig) {
    $scope.env = getEnv();
    $scope.config = appConfig.init($scope.env);
    $scope.welcomeScreen = function() {
        renderState('welcome');
    }
    $scope.forgotPass = function() {
        renderState('forgotpassword');
    }
    var renderState = function (name) {
        $state.go(name);
    }
    renderState('welcome');
}]);