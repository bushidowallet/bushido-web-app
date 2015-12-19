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
                        var run = function (a, qrcode, pin, appId) {
                            function makeCode (t) {
                                qrcode.makeCode(t);
                            }
                            new WalletApi($scope.config.socketServerUrl,
                                'pos',
                                'pos',
                                $scope.walletId,
                                false,
                                'GET_ADDRESS',
                                {'account':a, 'pin': pin, 'appId': appId},
                                getAddressHandler,
                                '/exchange/v2e-wallet-updates/',
                                '/queue/v2wallet')
                                .addListener('BALANCE_CHANGE_RECEIVED', balanceChangeHandler)
                                .connect();
                            function getAddressHandler (message) {
                                $scope.currentAddress = message.payload.currentAddress;
                                $scope.$apply(function(){
                                    if (!$scope.showAddr) {
                                        $scope.label = "Scan code to pay...";
                                    } else {
                                        $scope.label = $scope.currentAddress;
                                    }
                                });
                                makeCode($scope.currentAddress);
                            }
                            function balanceChangeHandler (message) {
                                var newTransaction = message.payload.tx;
                                function checkOutput(output) {
                                    if (output.toAddress == $scope.currentAddress) {
                                        $scope.$apply(function () {
                                            $scope.label = "Thanks for your payment!";
                                        });
                                        setTimeout(function () {
                                            $scope.currentAddress = message.payload.currentAddress;
                                            $scope.$apply(function(){
                                                if (!$scope.showAddr) {
                                                    $scope.label = "Scan code to pay...";
                                                } else {
                                                    $scope.label = $scope.currentAddress;
                                                }
                                            });
                                            makeCode($scope.currentAddress);
                                        }, 10000);
                                    }
                                }
                                for (var i = 0; i < newTransaction.outputs.length; i++) {
                                    checkOutput(newTransaction.outputs[i]);
                                }
                            }
                        };
                        angular.element(document).ready(function () {
                            var qrcode = new QRCode(document.getElementById('qrcodec'), {
                                width : 180,
                                height: 180
                            });
                            $('#posBody').css('backgroundColor', '#FFFFFF');
                            run($scope.account, qrcode, $scope.pin, $scope.appId);
                        });
                    }
                }
            }
        });
});

pos.controller('posController', ['$state', '$scope', 'appConfig', function ($state, $scope, appConfig) {
    $scope.walletId = $.QueryString.walletId;
    $scope.pin = $.QueryString.pin;
    $scope.showLogo = $.QueryString.logo == 'true';
    $scope.showAddr = $.QueryString.showAddr == 'true';
    $scope.appId = 'pos';
    $scope.env = getEnv();
    $scope.account = parseInt($.QueryString.account, 10);
    $scope.config = appConfig.init($scope.env);
    $state.go('main');
}]);