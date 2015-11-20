/**
 * Created by Jesion on 2015-01-10.
 */
var documentation = angular.module('documentation', ['app']);

documentation.controller('documentationController', ['$scope', '$cookieStore', 'appConfig', function ($scope, $cookieStore, appConfig) {
    $scope.env =  $cookieStore.get('env');
    $scope.wallet = $cookieStore.get('wallet');
    $scope.wallets = $cookieStore.get('wallets');
    $scope.config = appConfig.init($scope.env);
    $scope.restDocUrl = $scope.config.urlBase + '/client/apidoc/rest/';
    $scope.websocketDocUrl = $scope.config.urlBase + '/client/apidoc/websocket/';
    $scope.open = function (wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'documentation.html';
    };
}]);