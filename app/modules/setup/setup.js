var setup = angular.module('setup', ['app', 'ui.router']);

setup.config(function($stateProvider) {

    $stateProvider
        .state('welcome', {
            name: 'welcome',
            templateUrl: "/modules/setup/welcome.html" ,
            controller: function ($scope, $state) {
                $scope.createWallet = function() {
                    $state.go('wallet');
                }
            }
        })
        .state('wallet', {
            name: 'wallet',
            templateUrl: "/modules/shared/wallet.html",
            controller: function ($scope, $http, $state, Base64, $cookieStore) {
                var checkEntropy = function (str) {
                    if (str.length < 20) {
                        return false;
                    }
                    return true;
                };
                var check = function (str) {
                    if (str.length < 5) {
                        return false
                    }
                    return true;
                };
                $scope.doCreateWallet = function() {
                    if (checkEntropy($scope.walletEntropy) == true) {
                        if (check($scope.walletId) == true) {
                            var s = [];
                            s.push({key: 'compressedKeys', value: true});
                            s.push({key: 'passphrase', value: $scope.walletEntropy});
                            s.push({key: 'instruments', value: 'BTCPLN'});
                            var wallet = { key: $scope.walletId, owner: $scope.user.username, settings: s, accounts: [] };
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($scope.user.username + ':' + $cookieStore.get('password'));
                            $http.post($scope.config.urlBase + '/api/v2/wallet', JSON.stringify(wallet)).success(function (data) {
                                if (data.errors == null || data.errors.length == 0) {
                                    $cookieStore.put('user', data.user);
                                    $cookieStore.put('wallets', data.wallets);
                                    $state.go('thanks');
                                } else {
                                    var errorCode = data.errors[0].code;
                                    var msg = null
                                    if (errorCode == 1) {
                                        msg = "Could not create a wallet. Pick a different Wallet Id.";
                                    } else if (errorCode == 14) {
                                        msg = "Unexpected problem while creating wallet. Contact us.";
                                    } else if(errorCode == 18) {
                                        msg = "Invalid Trial Code provided.";
                                    }
                                    $scope.walletError = true;
                                    $scope.errorMessage = msg;
                                }
                            });
                        } else {
                            $scope.walletError = true;
                            $scope.errorMessage = "Wallet Id needs to have at least 5 characters.";
                        }
                    } else {
                        $scope.walletError = true;
                        $scope.errorMessage = "Wallet Entropy needs to have at least 20 characters.";
                    }
                }
            }
        })
        .state('thanks', {
            name: 'thanks',
            templateUrl: "/modules/setup/thanks.html" ,
            controller: function ($scope, $state) {
                $scope.openWallet = function() {
                    window.location.href = '/modules/wallet/wallet.html';
                }
            }
        })
});
setup.controller('setupController', ['$scope', '$state', '$cookieStore', 'appConfig', function ($scope, $state, $cookieStore, appConfig) {
    $scope.config = appConfig.init(getEnv());
    $scope.user = $cookieStore.get('user');
    $state.go('welcome');
}]);