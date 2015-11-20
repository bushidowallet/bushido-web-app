var exportKeys = angular.module('exportKeys', ['app']);

exportKeys.controller('exportKeysController', ['$scope', '$cookieStore', 'appConfig', function ($scope, $cookieStore, appConfig) {
    $scope.wallet = $cookieStore.get('wallet');
    $scope.wallets = $cookieStore.get('wallets');
    accountHandler($scope, $cookieStore);
    $scope.env =  $cookieStore.get('env');
    var config = appConfig.init($scope.env);
    $scope.open = function (wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'export.html';
    };
    $scope.run = function(a) {
        var table;
        var url = config.urlBase + '/api/v2/wallet/transactions/keys/dt?key=' + $scope.wallet.key + "&account=" + a;
        if ($.fn.dataTable.isDataTable('#keysTable')) {
            table = $('#keysTable').DataTable({
                retrieve: true,
                paging: false
            });
            table.destroy();
            //unsubscribe from previous feeds
        }
        $.fn.dataTableExt.sErrMode = 'mute';
        var table = $('#keysTable').dataTable( {
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
                var wallet = $cookieStore.get('wallet');
                var s = wallet.settings.length;
                var compressed = false;
                for (var i = 0; i < s; i++) {
                    var setting = wallet.settings[i];
                    if (setting.key === 'compressedKeys') {
                        compressed = setting.value;
                    }
                }
                var rootKeyHash = $cookieStore.get('rootKeyHash');
                if (rootKeyHash != null) {
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
        $scope.$watch('selectedAccount', function(newValue, oldValue) {
            $scope.run(newValue.account);
        });
        $scope.run($scope.selectedAccount.account);
    });
}]);