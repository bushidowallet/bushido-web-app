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
                };
            }
        })
        .state('inprogress', {
            name: 'inprogress',
            templateUrl: "/modules/checkout/inprogress.html",
            controller: function ($scope, $state) {
                var qrcode;
                var walletApi;
                function makeCode (t) {
                    qrcode.makeCode(t);
                }
                function balanceChangeHandler (message) {
                    var newTransaction = message.payload.tx;
                    function checkOutput(output) {
                        if (output.toAddress == $scope.currentAddress) {
                            var incoming = output.value;
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
                    for (var i = 0; i < newTransaction.outputs.length; i++) {
                        checkOutput(newTransaction.outputs[i]);
                    }
                }
                var renderQR = function(a, pin, appId) {
                    walletApi.invoke('GET_ADDRESS', {'account': a, 'pin': pin, 'appId': appId}, getAddressHandler);
                    function getAddressHandler (message) {
                        $scope.$apply(function(){
                            $scope.currentAddress = message.payload.currentAddress;
                            $scope.label = "Scan code to pay...";
                        });
                        makeCode($scope.currentAddress);
                    }
                };
                function getInstrumentDataHandler (message) {
                    var btcprice = message.payload.bid;
                    var localAmount =  $scope.amount.replace(",",".");
                    var btcAmount = localAmount / btcprice;
                    $scope.$apply(function () {
                        $scope.amount = btcAmount.toFixed(5);
                        $scope.localAmount = localAmount;
                        $scope.showLocal = true;
                    });
                    renderQR($scope.account, $scope.pin, $scope.appId);
                }
                var init = function() {
                    if ($scope.instrument) {
                        walletApi.invoke('GET_INSTRUMENT_DATA', {pin: $scope.pin, appId: $scope.appId}, getInstrumentDataHandler);
                    } else {
                        renderQR($scope.account, $scope.pin, $scope.appId);
                    }
                };
                angular.element(document).ready(function () {
                    qrcode = new QRCode(document.getElementById('qrcodec'), {
                        width : 180,
                        height: 180
                    });
                    console.log('Is qr component ok: ' + (qrcode !== undefined  && qrcode !== null));
                    walletApi = new WalletApi($scope.config.socketServerUrl,
                        'pos',
                        'pos',
                        $scope.walletId,
                        false,
                        null,
                        null,
                        null,
                        '/exchange/v2e-wallet-updates/',
                        '/queue/v2wallet', function() {
                            init();
                        })
                        .addListener('BALANCE_CHANGE_RECEIVED', balanceChangeHandler)
                        .connect();
                });
            }
        })
        .state('thanks', {
            name: 'thanks',
            templateUrl: "/modules/checkout/thanks.html"
        });
});

checkout.controller('checkoutController', ['$state', '$scope', 'appConfig', function ($state, $scope, appConfig) {
    $scope.walletId = $.QueryString.walletId;
    $scope.pin = $.QueryString.pin;
    $scope.appId = 'checkout';
    $scope.account = parseInt($.QueryString.account, 10);
    $scope.env = getEnv();
    $scope.config = appConfig.init($scope.env);
    $scope.instrument = $.QueryString.instrument;
    $scope.amount = 0;
    $scope.localAmount = 0;
    $scope.showLocal = false;
    $scope.incoming = 0;
    $scope.instrumentLabel = "BTC";
    $scope.label = "Enter transaction amount...";
    if ($scope.instrument) {
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
    };
    $scope.delete = function() {
        var remaining = $scope.amount.substring(0, $scope.amount.length - 1);
        $scope.amount = (remaining.length > 0) ? remaining : 0;
    };
    $scope.newTransaction = function() {
        $scope.amount = 0;
        $scope.localAmount = 0;
        $scope.showLocal = false;
        $state.go('keypad');
    };
    angular.element(document).ready(function () {
        $state.go('keypad');
    });
}]);