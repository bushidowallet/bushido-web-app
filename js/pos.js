/**
 * Created by Jesion on 2015-01-10.
 */
var pos = angular.module('pos', ['app']);

pos.controller('posController', ['$scope', 'appConfig', function ($scope, appConfig) {
    $scope.walletId = $.QueryString["walletId"];
    $scope.env = $.QueryString['env'];
    $scope.account  = parseInt($.QueryString["account"], 10);
    $scope.label = "Initializing... Please wait...";
    var config = appConfig.init($scope.env);
    $scope.run = function (a, qrcode) {
        function makeCode (t) {
            qrcode.makeCode(t);
        }
        var walletApi = new WalletApi(config.socketServerUrl,
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
        $scope.run($scope.account, qrcode);
    });
}]);