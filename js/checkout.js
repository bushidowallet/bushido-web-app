/**
 * Created by Jesion on 2015-01-10.
 */
var pos = angular.module('checkout', ['app']);

pos.controller('checkoutController', ['$scope', function ($scope) {
    $scope.walletId = $.QueryString["walletId"];
    $scope.account  = parseInt($.QueryString["account"], 10);
    $scope.env = $.QueryString['env'];
    $scope.instrument = $.QueryString["instrument"];
    $scope.label    = "Enter transaction amount...";
    $scope.amount = 0;
    $scope.localAmount = 0;
    $scope.showLocal = false;
    $scope.incoming = 0;
    $scope.BTCKeypadOn = true;
    $scope.inProgress = false;
    $scope.done = false;
    $scope.instrumentLabel = "BTC";
    var socketServerUrl = '';
    if ($scope.env == 'prod') {
        socketServerUrl = 'https://websockets.bushidowallet.com/stomp';
    }
    else if ($scope.env == 'dev') {
        socketServerUrl = 'http://localhost:15674/stomp';
    }
    $scope.socketServerUrl = socketServerUrl;
    if ($scope.instrument != null) {
        $scope.instrumentLabel = "PLN";
    }
    var qrcode;
    $scope.run = function () {

    };
    $scope.startNew = function() {
        $scope.$apply(function () {
            $scope.label = "Enter transaction amount...";
            $scope.amount = 0;
            $scope.incoming = 0;
            $scope.BTCKeypadOn = true;
            $scope.inProgress = false;
            $scope.done = false;
        });
    };
    $scope.runQR = function(a, qrcode) {
        function makeCode (t) {
            qrcode.makeCode(t);
        }
        var walletApi = new WalletApi($scope.socketServerUrl,
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
            $scope.$apply(function(){
                $scope.currentAddress = message.payload.currentAddress;
                $scope.label = "Scan code to pay...";
            });
            makeCode($scope.currentAddress);
        }
        function balanceChangeHandler (message) {
            var newTransaction = message.payload.tx;
            for (var i = 0; i < newTransaction.outputs.length; i++) {
                if (newTransaction.outputs[i].toAddress == $scope.currentAddress) {
                    //see incoming amount and check if more money required...
                    var incoming = newTransaction.outputs[i].value;
                    var amountBase = $scope.amount.replace(",", ".");
                    var totalJS = parseFloat(amountBase) * 100000000;
                    var total = totalJS.toFixed(0);
                    $scope.incoming = $scope.incoming + incoming;
                    if ($scope.incoming >= total) {
                        $scope.$apply(function () {
                            $scope.label = "Thanks for your payment!";
                            $scope.BTCKeypadOn = false;
                            $scope.inProgress = false;
                            $scope.done = true;
                        });
                        //wait and start new transaction...
                        //setTimeout(function() {
                        //    $scope.startNew();
                        //}, 10000);
                    } else {
                        var outstanding = total - $scope.incoming;
                        $scope.$apply(function () {
                            $scope.BTCKeypadOn = false;
                            $scope.inProgress = true;
                            $scope.label = "Awaiting " + outstanding / 100000000 + " BTC";
                        });
                        setTimeout(function () {
                            $scope.$apply(function() {
                                $scope.currentAddress = message.payload.currentAddress;
                            });
                            makeCode($scope.currentAddress);
                        }, 1000);
                    }
                }
            }
        }
    }
    $scope.add = function(sign) {
        if (sign == ",") {
            //check if already present...
        }
        if ($scope.amount == "0" && sign != ",") {
            $scope.amount = "";
        }
        $scope.amount = $scope.amount + sign;
    }
    $scope.delete = function() {
        var remaining = $scope.amount.substring(0, $scope.amount.length - 1);
        if (remaining.length > 0) {
            $scope.amount = remaining;
        } else {
            $scope.amount = 0;
        }
    }
    $scope.requestPayment = function() {
        $scope.BTCKeypadOn = false;
        $scope.done = false;
        $scope.inProgress = true;
        if ($scope.instrument != null) {
            var walletApi = new WalletApi($scope.socketServerUrl,
                'pos',
                'pos',
                $scope.walletId,
                false,
                'GET_INSTRUMENT_DATA',
                null,
                getInstrumentDataHandler,
                '/exchange/v2e-wallet-updates/',
                '/queue/v2wallet')
                .connect();
            function getInstrumentDataHandler (message) {
                var btcprice = message.payload.bid;
                var localAmount =  $scope.amount.replace(",",".");
                var btcAmount = localAmount / btcprice;
                $scope.$apply(function () {
                    $scope.amount = btcAmount.toFixed(5);
                    $scope.localAmount = localAmount;
                    $scope.showLocal = true;
                });
                $scope.runQR($scope.account, qrcode);
            }
        } else {
            $scope.runQR($scope.account, qrcode);
        }
    }
    $scope.newTransaction = function() {
        $scope.amount = 0;
        $scope.localAmount = 0;
        $scope.showLocal = false;
        $scope.BTCKeypadOn = true;
        $scope.done = false;
        $scope.inProgress = false;
    }
    angular.element(document).ready(function () {
        qrcode = new QRCode(document.getElementById('qrcodec'), {
            width : 180,
            height: 180
        });
        $scope.run();
    });
}]);