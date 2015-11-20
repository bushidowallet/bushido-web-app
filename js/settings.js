/**
 * Created by Jesion on 2015-01-10.
 */
var settings = angular.module('settings', ['app']);

settings.controller('settingsController', ['$scope', '$cookieStore', '$http', 'Base64', 'appConfig', function ($scope, $cookieStore, $http, Base64, appConfig) {
    $scope.wallet = $cookieStore.get('wallet');
    $scope.wallets = $cookieStore.get('wallets');
    accountHandler($scope, $cookieStore);
    $scope.env =  $cookieStore.get('env');
    var config = appConfig.init($scope.env);
    $scope.open = function (wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'settings.html';
    };
    $scope.save = function() {
        var passphraseHash = new jsSHA($scope.passphrase, "TEXT").getHash("SHA-256", "HEX", 50000);
        var rootKeyHash = new jsSHA(passphraseHash, "HEX").getHMAC("Bitcoin seed", "TEXT", "SHA-512", "HEX");
        $cookieStore.put('rootKeyHash', rootKeyHash);
    };
    $scope.createAccount = function() {
        var url = config.urlBase + '/api/v2/wallet/' + $scope.wallet.key;
        $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookieStore.get('username') + ':' + $cookieStore.get('password'));
        var acc = { 'name': $scope.newaccountname };
        $http.post(url, JSON.stringify(acc)).success(function(data) {
            if (data.payload != null) {
                $('#createAccountModal').modal('hide');
                $cookieStore.put('wallet', data.payload);
                $scope.run();
            } else if (response.errors) {

            }
        }).error(function(data) {

        });
    };
    $scope.run = function() {
        var wallet = $cookieStore.get('wallet');
        var s      = wallet.settings.length;
        for (var i = 0; i < s; i++) {
            var setting = wallet.settings[i];
            if (setting.key === 'compressedKeys') {
                $scope.$apply(function(){
                    $scope.compressed = setting.value;
                });
            }
        }
        $scope.wallet = wallet;
    };
    angular.element(document).ready(function () {
        $scope.run();
    });
}]);