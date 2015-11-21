/**
 * Created by Jesion on 2015-01-10.
 */
var settings = angular.module('settings', ['app', 'ui.router']);

settings.config(function($stateProvider) {
    $stateProvider
        .state('main', {
            name: 'main',
            views: {
                '': { templateUrl: 'settings.html' },
                'topbar': { templateUrl: 'partials/shared/topbar.html' },
                'sidebar': {
                    templateUrl: 'partials/shared/sidebar.html',
                    controller: function ($scope, $cookieStore, walletModel) {
                        $scope.selectedAccount = walletModel.selectedAccount;
                        $scope.$watch('selectedAccount', function (newValue, oldValue) {
                            if (newValue != oldValue) {
                                walletModel.selectedAccount = newValue;
                                $cookieStore.put('selectedAccount', newValue.account);
                            }
                        });
                    }
                },
                'content': { templateUrl: 'partials/settings/main.html',
                    controller: function ($scope, $cookieStore, $http, Base64) {
                        var run = function() {
                            var wallet = $cookieStore.get('wallet');
                            var s = wallet.settings.length;
                            for (var i = 0; i < s; i++) {
                                var setting = wallet.settings[i];
                                if (setting.key === 'compressedKeys') {
                                    $scope.compressed = setting.value;
                                }
                            }
                            $scope.wallet = wallet;
                        };
                        $scope.save = function() {
                            var passphraseHash = new jsSHA($scope.passphrase, "TEXT").getHash("SHA-256", "HEX", 50000);
                            var rootKeyHash = new jsSHA(passphraseHash, "HEX").getHMAC("Bitcoin seed", "TEXT", "SHA-512", "HEX");
                            //TODO: Root Key hash has to be stored against a wallet (since user may switch wallets - making the export page generating keys that don't apply to currently selected wallet)
                            $cookieStore.put('rootKeyHash', rootKeyHash);
                        };
                        $scope.createAccount = function() {
                            var url = $scope.config.urlBase + '/api/v2/wallet/' + $scope.wallet.key;
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookieStore.get('username') + ':' + $cookieStore.get('password'));
                            var acc = { 'name': $scope.newaccountname };
                            $http.post(url, JSON.stringify(acc)).success(function(data) {
                                if (data.payload != null) {
                                    $('#createAccountModal').modal('hide');
                                    $cookieStore.put('wallet', data.payload);
                                    run();
                                } else if (response.errors) {

                                }
                            }).error(function(data) {

                            });
                        };
                        angular.element(document).ready(function () {
                            run();
                        });
                    }
                }
            }
        });
});

settings.controller('settingsController', ['$state', '$cookieStore', '$scope', 'appConfig', 'walletModel', 'wallet', function ($state, $cookieStore, $scope, appConfig, walletModel, wallet) {
    wallet.init($cookieStore, $scope, appConfig, walletModel);
    $scope.open = function (wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'settings.html';
    };
    $state.go('main');
}]);