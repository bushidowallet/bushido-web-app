/* jshint undef: false */

var exportKeys = angular.module('exportKeys', ['app', 'ui.router']);

exportKeys.config(function($stateProvider) {

    $stateProvider
        .state('main', {
            name: 'main',
            views: {
                '': {templateUrl: 'export.html'},
                'topbar': {templateUrl: '/modules/shared/topbar.html'},
                'sidebar': {
                    templateUrl: '/modules/shared/sidebar.html',
                    controller: function($scope, walletModel, walletManager) {
                        $scope.$watch(function () { return walletModel.selectedAccount; }, function (newValue, oldValue) {
                            if (newValue !== oldValue) {
                                walletManager.save();
                            }
                        });
                    }
                },
                'content': {
                    templateUrl: '/modules/export/main.html',
                    controller: function ($scope, $cookieStore, walletModel) {
                        var run = function(a) {
                            var table;
                            var url = $scope.config.urlBase + '/api/v2/wallet/transactions/keys/dt?key=' + walletModel.selectedWallet.key + "&account=" + a;
                            if ($.fn.dataTable.isDataTable('#keysTable')) {
                                table = $('#keysTable').DataTable({
                                    retrieve: true,
                                    paging: false
                                });
                                table.destroy();
                                //unsubscribe from previous feeds
                            }
                            $.fn.dataTableExt.sErrMode = 'mute';
                            table = $('#keysTable').dataTable( {
                                dom: 'T<"clear">lfrtip',
                                tableTools: {
                                    "aButtons": [ 'copy' ]
                                },
                                "processing": true,
                                "serverSide": false,
                                "ajax": {
                                    "url" : url,
                                    "type" : 'GET',
                                    "username": $cookieStore.get('username'),
                                    "password": $cookieStore.get('password')
                                },
                                "order": [[ 0, "desc" ]],
                                "columns": [
                                    { "data": "creationTimeMillis" },
                                    { "data": "address" },
                                    { "data": "account" },
                                    { "data": "sequence" },
                                    { "data": "wif" }
                                ],
                                "columnDefs": [
                                    {
                                        "className": "dt-body-left",
                                        "targets": 4
                                    }
                                ],
                                rowCallback: function ( row, data ) {
                                    var wallet = walletModel.selectedWallet;
                                    var s = wallet.settings.length;
                                    var compressed = false;
                                    for (var i = 0; i < s; i++) {
                                        var setting = wallet.settings[i];
                                        if (setting.key === 'compressedKeys') {
                                            compressed = setting.value;
                                        }
                                    }
                                    var rootKeyHash = $cookieStore.get('rootKeyHash');
                                    if (rootKeyHash) {
                                        var rootKey = new ExtendedKey(rootKeyHash, compressed);
                                        var keygen = new KeyGen(compressed);
                                        var wif = keygen.run(data, rootKey);
                                        data.wif = wif;
                                        row.cells[4].innerHTML = data.wif;
                                    } else {
                                        data.wif = 'Passphrase not set';
                                        row.cells[4].innerHTML = '<span class="text-warning">' + data.wif + '</span>';
                                    }
                                }
                            });
                        };
                        angular.element(document).ready(function () {
                            $scope.$watch(function () { return walletModel.selectedAccount; }, function (newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    $scope.selectedAccount = newValue;
                                    run(newValue.account);
                                }
                            });
                            run(walletModel.selectedAccount.account);
                        });
                    }
                }
            }
        });
});

exportKeys.controller('exportKeysController', ['$state', '$cookieStore', '$scope', 'appConfig', 'walletModel', 'walletManager', function ($state, $cookieStore, $scope, appConfig, walletModel, walletManager) {
    walletManager.init($cookieStore, $scope, appConfig, walletModel);
    $scope.open = function (wallet) {
        walletManager.open(wallet);
    };
    $state.go('main');
}]);