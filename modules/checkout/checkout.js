/**
 * Created by Jesion on 2015-01-10.
 */
var checkout = angular.module('checkout', ['app', 'ui.router']);

checkout.config(function($stateProvider) {
    $stateProvider
        .state('keypad', {
            name: 'keypad',
            templateUrl: "/modules/checkout/keypad.html",
            controller: function ($scope, $state) {
                $scope.requestPayment = function() {
                    $state.go('inprogress');
                }
            }
        })
        .state('inprogress', {
            name: 'inprogress',
            templateUrl: "/modules/checkout/inprogress.html",
            controller: function ($scope, $state) {
                var qrcode;
                var renderQR = function(a, qrcode) {
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
                                var incoming = newTransaction.outputs[i].value;
                                var amountBase = $scope.amount.replace(",", ".");
                                var totalJS = parseFloat(amountBase) * 100000000;
                                var total = totalJS.toFixed(0);
                                $scope.incoming = $scope.incoming + incoming;
                                if ($scope.incoming >= total) {
                                    $scope.$apply(function () {
                                        $scope.label = "Thanks for your payment!";
                                        $state.go('thanks');
                                    });
                                } else {
                                    var outstanding = total - $scope.incoming;
                                    $scope.$apply(function () {
                                        $scope.label = "Awaiting " + outstanding / 100000000 + " BTC";
                                    });
                                    $state.go('inprogress');
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
                var init = function() {
                    if ($scope.instrument != null) {
                        var walletApi = new WalletApi($scope.config.socketServerUrl,
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
                            renderQR($scope.account, qrcode);
                        }
                    } else {
                        renderQR($scope.account, qrcode);
                    }
                }
                angular.element(document).ready(function () {
                    qrcode = new QRCode(document.getElementById('qrcodec'), {
                        width : 180,
                        height: 180
                    });
                    console.log('Is qr component ok: ' + qrcode != undefined);
                    init();
                });
            }
        })
        .state('thanks', {
            name: 'thanks',
            templateUrl: "/modules/checkout/thanks.html"
        })
});

checkout.controller('checkoutController', ['$state', '$scope', 'appConfig', function ($state, $scope, appConfig) {
    $scope.walletId = $.QueryString["walletId"];
    $scope.account  = parseInt($.QueryString["account"], 10);
    $scope.env = $.QueryString['env'];
    $scope.config = appConfig.init($scope.env);
    $scope.instrument = $.QueryString["instrument"];
    $scope.amount = 0;
    $scope.localAmount = 0;
    $scope.showLocal = false;
    $scope.incoming = 0;
    $scope.instrumentLabel = "BTC";
    $scope.label = "Enter transaction amount...";
    if ($scope.instrument != null) {
        $scope.instrumentLabel = "PLN";
    }
    $scope.startNew = function() {
        $scope.$apply(function () {
            $scope.label = "Enter transaction amount...";
            $scope.amount = 0;
            $scope.incoming = 0;
            $state.go('keypad');
        });
    };
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
        $scope.amount = (remaining.length > 0) ? remaining : 0;
    }
    $scope.newTransaction = function() {
        $scope.amount = 0;
        $scope.localAmount = 0;
        $scope.showLocal = false;
        $state.go('keypad');
    }
    angular.element(document).ready(function () {
        $state.go('keypad');
    });
}]);