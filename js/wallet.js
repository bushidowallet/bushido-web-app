/**
 * Created by Jesion on 2015-01-10.
 */
var wallet = angular.module('wallet', ['app', 'ui.router']);

wallet.config(function($stateProvider) {
    $stateProvider
        .state('main', {
            name: 'main',
            views: {
                '' : { templateUrl: 'wallet.html' },
                'topbar' : {
                    templateUrl : 'partials/shared/topbar.html'
                },
                'sidebar' : {
                    templateUrl : 'partials/shared/sidebar.html',
                    controller: function($scope, walletModel, walletManager) {
                        $scope.$watch(function () { return walletModel.selectedAccount }, function (newValue, oldValue) {
                            if (newValue !== oldValue) {
                                walletManager.save();
                            }
                        });
                    }
                },
                'content' : { templateUrl : 'partials/wallet/main.html',
                    controller: function ($scope, $cookieStore, $http, Base64, $window, walletModel) {
                        $scope.balance = {'confirmed': 0, 'unconfirmed': 0};
                        $scope.qrCodeString = $scope.config.defaultRecipientAddress;
                        $scope.instrument = null;
                        $scope.instrumentPrice = 0;
                        $scope.plnBalance = '0.00';
                        $scope.control = null;
                        $scope.topUpValue = 50.00;
                        $scope.selectedAccount = walletModel.selectedAccount;
                        $scope.topUp = function() {
                            var url = $scope.config.urlBase + '/api/v2/wallet/topup/init';
                            $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($cookieStore.get('username') + ':' + $cookieStore.get('password'));
                            console.log('Initializing currency top up: ' + $cookieStore.get('username') + ' ' + $cookieStore.get('password') + ' auth header: ' + $http.defaults.headers.common['Authorization']);
                            $http.post(url, JSON.stringify($scope.model.selectedWallet)).success(function(data) {
                                $scope.control = data.payload;
                                openGateway();
                            }).error(function(data) {
                            });
                            function openGateway() {
                                var user =  $cookieStore.get('user');
                                var topuplink = $scope.config.dotPayUrlBase + '&amount=' + $scope.topUpValue + '&description=topup&firstname=' + user.firstName + '&lastname=' + user.lastName + '&email=' + user.email + '&control=' + $scope.control + '&api_version=dev';
                                $window.open(topuplink);
                            }
                        }
                        var run = function (a, qrcode) {
                            console.log('Executing get address command for account ' + a);
                            function makeCode (t) {
                                qrcode.makeCode(t);
                            }
                            function updateBalance (balance) {
                                $scope.$apply(function(){
                                    $scope.balance = balance;
                                });
                            }
                            function updateFCBalances(fcBalances) {
                                $scope.$apply(function() {
                                    $scope.plnBalance = fcBalances[0].balance.toFixed(2);
                                });
                            }
                            var walletApi = new WalletApi($scope.config.socketServerUrl,
                                'pos',
                                'pos',
                                $scope.model.selectedWallet.key,
                                false,
                                'GET_ADDRESS',
                                {'account': a},
                                getAddressHandler,
                                '/exchange/v2e-wallet-updates/',
                                '/queue/v2wallet')
                                .addListener('BALANCE_CHANGE_RECEIVED', fundsInHandler)
                                .addListener('BALANCE_CHANGE_SPENT', fundsOutHandler)
                                .addListener('BALANCE_CHANGE_STATUS', fundsStatusChangeHandler)
                                .addListener('INSTRUMENT_CHANGE', instrumentChangeHandler)
                                .addListener('FC_BALANCE_CHANGE_RECEIVED', fcFundsInHandler)
                                .connect();
                            function getInstrumentDataHandler (message) {
                                $scope.$apply(function () {
                                    var wallet = $scope.model.selectedWallet;
                                    var s = wallet.settings.length;
                                    for (var i = 0; i < s; i++) {
                                        var setting = wallet.settings[i];
                                        if (setting.key === 'instruments') {
                                            var instr = setting.value.split(',');
                                            $scope.instrument = instr[0];
                                            if (message.payload.instrument.id == $scope.instrument) {
                                                $scope.instrumentPrice = message.payload.bid;
                                            }
                                        }
                                    }
                                });
                            }
                            function instrumentChangeHandler (message) {
                                $scope.$apply(function () {
                                    $scope.instrumentPrice = message.payload.data.bid;
                                });
                            }
                            function getAddressHandler (message) {
                                $scope.currentAddress = message.payload.currentAddress;
                                makeCode($scope.currentAddress);
                                updateBalance(message.payload.balance);
                                updateFCBalances(message.payload.fcBalances);
                                walletApi.invoke('GET_INSTRUMENT_DATA', null, getInstrumentDataHandler);
                            }
                            function fcFundsInHandler (message) {
                                updateFCBalances(message.payload.fcbalances);
                            }
                            function fundsInHandler (message) {
                                var newTransaction = message.payload.tx;
                                for (var i = 0; i < newTransaction.outputs.length; i++) {
                                    if (newTransaction.outputs[i].toAddress == $scope.currentAddress) {
                                        setTimeout(function () {
                                            $scope.currentAddress = message.payload.currentAddress;
                                            makeCode($scope.currentAddress);
                                        }, 10000);
                                    }
                                }
                                updateBalance(message.payload.balance);
                            }
                            function fundsOutHandler (message) {
                                updateBalance(message.payload.balance);
                            }
                            function fundsStatusChangeHandler (message) {
                                updateBalance(message.payload.balance);
                            }
                        };
                        angular.element(document).ready(function () {
                            var qrcode = new QRCode(document.getElementById('qrcodec'), {
                                width : 180,
                                height : 180
                            });
                            var qrcodeAllPurpose = new QRCode(document.getElementById('qrcodecAllPurpose'), {width: 180, height: 180});
                            $scope.$watch(function () { return walletModel.selectedAccount }, function (newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    $scope.selectedAccount = newValue;
                                    run(newValue.account, qrcode);
                                }
                            });
                            $scope.$watch('qrCodeString', function(newValue, oldValue) {
                                qrcodeAllPurpose.makeCode(newValue);
                            });
                            run(walletModel.selectedAccount.account, qrcode);
                        });
                    }
                }
            }
        })
});

wallet.controller('walletController', ['$state', '$cookieStore', '$scope', 'appConfig', 'walletModel', 'walletManager', function ($state, $cookieStore, $scope, appConfig, walletModel, walletManager) {
    walletManager.init($cookieStore, $scope, appConfig, walletModel);
    $scope.open = function (wallet) {
        walletManager.open(wallet);
    };
    $state.go('main');
}]);