/**
 * Created by Jesion on 2015-01-10.
 */
var user = angular.module('user', ['app']);

user.controller('userController', ['$scope', '$cookieStore', function ($scope, $cookieStore) {
    $scope.user = $cookieStore.get('user');
    $scope.env =  $cookieStore.get('env');
    $scope.wallet = $cookieStore.get('wallet');
    $scope.wallets = $cookieStore.get('wallets');
    $scope.open = function (wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'user.html';
    };
}]);