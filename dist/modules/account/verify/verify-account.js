var verifyAccount = angular.module('verifyAccount', ['app', 'ui.router']);

verifyAccount.factory('verifyModel', function () {
    return {
        email: null
    };
});

verifyAccount.config(function($stateProvider) {
    $stateProvider
        .state('email', {
            name: 'email',
            templateUrl: "/modules/account/verify/email.html",
            controller: function ($scope, $http, $state, verifyModel) {
                $scope.email = '';
                $scope.bdisabled = true;
                $scope.$watch('email', function() {
                    console.log(isValidEmail($scope.email));
                    $scope.bdisabled = isValidEmail($scope.email) === false;
                });
                var isValidEmail = function (email) {
                    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    return regex.test(email);
                };
                $scope.doRequestVerificationLink = function() {
                    $scope.verifyerror = false;
                    var url = $scope.config.urlBase + '/api/v2/user/account/verify/init';
                    var request = {email: $scope.email};
                    verifyModel.email = $scope.email;
                    $http.post(url, JSON.stringify(request)).success(function(data) {
                        if (!data.errors || data.errors.length === 0) {
                            $scope.verifyerror = false;
                            $state.go('thanks');
                        } else {
                            $scope.verifyerror = true;
                        }
                    }).error(function() {
                        $scope.verifyerror = true;
                    });
                };
            }
        })
        .state('thanks', {
            name: 'thanks',
            templateUrl: "/modules/account/verify/thanks.html",
            controller: function ($scope, verifyModel) {
                $scope.email = verifyModel.email;
            }
        });
});

verifyAccount.controller('verifyAccountController', ['$state', '$scope', 'appConfig', function ($state, $scope, appConfig) {
    $scope.env = getEnv();
    $scope.config = appConfig.init($scope.env);
    var renderState = function (name) {
        $state.go(name);
    };
    renderState('email');
}]);