/**
 * Created by Jesion on 2015-01-10.
 */
var user = angular.module('user', ['app']);

user.controller('userController', ['$scope', '$cookieStore', '$http', 'Base64', function ($scope, $cookieStore, $http, Base64) {
    $scope.user = $cookieStore.get('user');
    $scope.env =  $cookieStore.get('env');
    $scope.wallet = $cookieStore.get('wallet');
    $scope.wallets = $cookieStore.get('wallets');
    var urlBase = '';
    if ($scope.env == 'prod') {
        urlBase = 'https://api.bushidowallet.com/';
    }
    if ($scope.env == 'dev') {
        urlBase = 'http://localhost:8080/';
    }
    $scope.urlBase = urlBase;
    $scope.run = function() {

    };
    $scope.open = function (wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'user.html';
    };
    angular.element(document).ready(function () {
        $scope.run();
    });
}]);