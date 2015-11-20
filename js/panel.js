/**
 * Created by Jesion on 2015-01-10.
 */
var panel = angular.module('panel', ['app']);

panel.controller('panelController', ['$scope', '$cookieStore', function ($scope, $cookieStore) {
    $scope.env =  $cookieStore.get('env');
    $scope.wallets = $cookieStore.get('wallets');
    $scope.user = $cookieStore.get('user');
    if ($scope.wallets.length == 0) {
        $scope.message = "You don't have any wallets";
    }
    $scope.open = function(wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'wallet.html';
    }
}]);