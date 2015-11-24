/**
 * Created by Jesion on 2015-01-10.
 */
var pos = angular.module('pos', ['app', 'ui.router']);

pos.config(function($stateProvider) {

    $stateProvider
        .state('main', {
            name: 'main',
            views: {
                '': { templateUrl: 'pos.html' },
                'content': { templateUrl: '/modules/pos/main.html',
                    controller: function ($scope) {
                        $scope.label = "Initializing... Please wait...";
                        var run = function (a, qrcode) {
                            function makeCode (t) {
                                qrcode.makeCode(t);
                            }
                            var walletApi = new WalletApi($scope.config.socketServerUrl,
                                'pos',
                                'pos',
                                $scope.walletId,
                                false,
                                'GET_ADDRESS',
                                {'account':a},
                                getAddressHandler,
                                '/exchange/v2e-wallet-updates/',
                                '/queue/v2wallet')
                                .addListener('BALANCE_CHANGE_RECEIVED', balanceChangeHandler)
                                .connect();
                            function getAddressHandler (message) {
                                $scope.currentAddress = message.payload.currentAddress;
                                $scope.$apply(function(){
                                    $scope.label = "Scan code to pay...";
                                });
                                makeCode($scope.currentAddress);
                            }
                            function balanceChangeHandler (message) {
                                var newTransaction = message.payload.tx;
                                for (var i = 0; i < newTransaction.outputs.length; i++) {
                                    if (newTransaction.outputs[i].toAddress == $scope.currentAddress) {
                                        $scope.$apply(function () {
                                            $scope.label = "Thanks for your payment!";
                                        });
                                        setTimeout(function () {
                                            $scope.currentAddress = message.payload.currentAddress;
                                            $scope.$apply(function(){
                                                $scope.label = "Scan code to pay...";
                                            });
                                            makeCode($scope.currentAddress);
                                        }, 10000);
                                    }
                                }
                            }
                        };
                        angular.element(document).ready(function () {
                            var qrcode = new QRCode(document.getElementById('qrcodec'), {
                                width : 180,
                                height: 180
                            });
                            run($scope.account, qrcode);
                        });
                    }
                }
            }
        });

});

pos.controller('posController', ['$state', '$scope', 'appConfig', function ($state, $scope, appConfig) {
    $scope.walletId = $.QueryString["walletId"];
    $scope.env = getEnv();
    $scope.account  = parseInt($.QueryString["account"], 10);
    $scope.config = appConfig.init($scope.env);
    $state.go('main');
}]);