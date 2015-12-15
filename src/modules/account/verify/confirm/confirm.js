var account = angular.module('account', ['app', 'ui.router']);

account.config(function($stateProvider) {
    $stateProvider
        .state('email', {
            name: 'email',
            templateUrl: "/modules/account/verify/confirm/email.html",
            controller: function ($scope, $http, $state) {
                $scope.email = '';
                $scope.bdisabled = true;
                $scope.reseterror = false;
                $scope.$watch('email', function() {
                    console.log(isValidEmail($scope.email));
                    $scope.bdisabled = isValidEmail($scope.email) === false;
                });
                var isValidEmail = function (email) {
                    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    return regex.test(email);
                };
                $scope.doConfirm = function() {
                    var url = $scope.config.urlBase + '/api/v2/user/account/verify';
                    var request = {token: $scope.t, email: $scope.email};
                    $http.post(url, JSON.stringify(request)).success(function(data) {
                        if (!data.errors || data.errors.length === 0) {
                            $scope.reseterror = false;
                            $state.go('thanks');
                        } else {
                            $scope.reseterror = true;
                        }
                    }).error(function() {
                        $scope.reseterror = true;
                    });
                };
            }
        })
        .state('thanks', {
            name: 'thanks',
            templateUrl: "/modules/account/verify/confirm/thanks.html"
        });
});

account.controller('accountController', ['$state', '$scope', 'appConfig', function ($state, $scope, appConfig) {
    $scope.env = getEnv();
    $scope.t = $.QueryString.t;
    $scope.config = appConfig.init($scope.env);
    var renderState = function (name) {
        $state.go(name);
    };
    angular.element(document).ready(function () {
        renderState('email');
    });
}]);