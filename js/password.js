var passw = angular.module('passw', ['app', 'ui.router']);

passw.factory('helpFieldState', function () {
    return { code: null }
});

passw.config(function($stateProvider) {
    $stateProvider
        .state('code', {
            name: 'code',
            templateUrl: "partials/password/code.html",
            controller: function ($scope, $state, $http) {
                $scope.doVerifyCode = function() {
                     var url = $scope.config.urlBase + '/api/v2/user/password/reset/code';
                     var request = { token: $scope.t, code: $scope.code };
                     $http.post(url, JSON.stringify(request)).success(function(data) {
                     if ((data.errors == null || data.errors.length == 0) && data.payload != null && data.payload == true) {
                        $state.go('password');
                     } else {

                     }}).error(function(data) {

                     });
                };
                $scope.doRequestSMS = function() {
                    var url = $scope.config.urlBase + '/api/v2/user/password/reset/token';
                    var request = {token: $scope.t, enforceSms: true};
                    $http.post(url, JSON.stringify(request));
                };
            }
        })
        .state('password', {
            name: 'password',
            templateUrl: "partials/password/password.html",
            controller: function ($scope, $http, helpFieldState, $state) {
                $scope.newpass = '';
                $scope.newpass2 = '';
                $scope.bdisabled = true;
                $scope.inputType = 'password';
                $scope.$watch('newpass', function() {
                    check();
                });
                $scope.$watch('newpass2', function() {
                    check();
                });
                var check = function() {
                    $scope.bdisabled = true;
                    if ($scope.newpass == $scope.newpass2) {
                        var o = $scope.newpass.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{10,50}$/);
                        if (o != null) {
                            $scope.bdisabled  = false;
                        }
                    }
                };
                $scope.hideShowPassword = function(){
                    if ($scope.inputType == 'password')
                        $scope.inputType = 'text';
                    else
                        $scope.inputType = 'password';
                };
                $scope.doReset = function() {
                    var url = $scope.config.urlBase + '/api/v2/user/password/reset/confirm';
                    var request = {token: $scope.t, password: $scope.newpass};
                    $http.post(url, JSON.stringify(request)).success(function(data) {
                        if (data.errors == null || data.errors.length == 0) {
                            $scope.reseterror = false;
                            $state.go('thanks');
                        } else {
                            $scope.reseterror = true;
                        }
                    }).error(function(data) {
                        $scope.reseterror = true;
                    });
                };
            }
        })
        .state('thanks', {
            name: 'thanks',
            templateUrl: "partials/password/thanks.html"
        })
});

passw.controller('passwController', ['$scope', '$http', '$state', 'appConfig', function ($scope, $http, $state, appConfig) {
    $scope.env = $.QueryString['env'];
    $scope.t = $.QueryString['t'];
    $scope.config = appConfig.init($scope.env);
    var init = function() {
        var url = $scope.config.urlBase + '/api/v2/user/password/reset/init';
        var request = {token: $scope.t};
        $http.post(url, JSON.stringify(request)).success(function(data) {
            if (data.errors == null || data.errors.length == 0) {
                $scope.reseterror = false;
                if (data.payload == true) {
                    $state.go('code');
                } else {
                    $state.go('password');
                }
            } else {
                $scope.reseterror = true;
            }
        }).error(function(data) {
            $scope.reseterror = true;
        });
    }
    angular.element(document).ready(function () {
        init();
    });
}]);