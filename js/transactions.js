var transactions = angular.module('transactions', ['app']);

transactions.controller('transactionsController', ['$scope', '$cookieStore', function ($scope, $cookieStore) {
    $scope.wallet = $cookieStore.get('wallet');
    $scope.wallets = $cookieStore.get('wallets');
    accountHandler($scope, $cookieStore);
    $scope.env =  $cookieStore.get('env');
    var restUrlBase = '';
    var socketServerUrl = '';
    if ($scope.env == 'prod') {
        restUrlBase = 'https://api.bushidowallet.com/';
        socketServerUrl = 'https://websockets.bushidowallet.com/stomp';
    } else if ($scope.env == 'dev') {
        restUrlBase = 'http://localhost:8080/';
        socketServerUrl = 'http://localhost:15674/stomp';
    }
    $scope.restUrlBase = restUrlBase;
    $scope.socketServerUrl = socketServerUrl;
    $scope.open = function (wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'transactions.html';
    };
    $scope.run    = function run(a) {
        var url = restUrlBase + appContext + '/api/v2/wallet/transactions/dt?key=' + $scope.wallet.key + "&account=" + a;
        if ($.fn.dataTable.isDataTable('#transactionsTable')) {
            var table = $('#transactionsTable').DataTable({
                retrieve: true,
                paging: false
            });
            table.destroy();
            //unsubscribe from previous feeds
        }
        var table = $('#transactionsTable').dataTable( {
            "processing": true,
            "serverSide": false,
            "ajax": {
                "url" : url,
                "type" : 'GET',
                "username": $cookieStore.get('user.username'),
                "password": $cookieStore.get('user.password')
            },
            "order": [[ 0, "desc" ]],
            "columns": [
                { "data": "time" },
                { "data": "hash" },
                { "data": "status" },
                { "data": "value" },
                { "data": "confirmations" },
                { "data": "memo" }
            ],
            "columnDefs": [
                {
                    "className": "dt-body-center",
                    "targets"  : 2,
                    "data"     : "status",
                    "render"   : function (data, type, meta) {
                        var styleClass = (data == 'Pending') ? 'txstat pending' : 'txstat';
                        return '<span class="' + styleClass + '">' + data + '</span>';
                    }
                },
                {
                    "className": "dt-body-left",
                    "targets"  : 3,
                    "data"     : "value",
                    "render"   : function (data, type, meta) {
                        var styleClass = (data > 0) ? 'text-success' : 'text-danger';
                        var indic = data > 0 ? '+' : '-';
                        var absData = Math.abs(data);
                        return '<span class="' + styleClass + '">' + indic + absData / 100000000 + ' BTC</span>';
                    }
                }
            ]
        });
        new WalletApi($scope.socketServerUrl,
            'pos',
            'pos',
            $scope.wallet.key,
            false,
            null,
            null,
            null,
            '/exchange/v2e-wallet-updates/',
            '/queue/v2wallet')
            .addListener('BALANCE_CHANGE_RECEIVED', balanceChangeHandler)
            .addListener('TRANSACTION_STATUS_CHANGE', transactionStatusChangeHandler)
            .connect();
        function transactionStatusChangeHandler(message) {
            var txHash = message.payload.txHash;
            var table  = $('#transactionsTable').DataTable();
            table.row().indexes().flatten().each(function(i) {
                var row = table.row( i );
                if (row.data().hash == txHash) {
                    row.data().status           = message.payload.status;
                    row.data().confirmations    = message.payload.confirmations;
                    var tr                      = row.nodes()[0];
                    var statusCell              = tr.cells[2];
                    var confirmationsCell       = tr.cells[4];
                    confirmationsCell.innerHTML = row.data().confirmations;
                    var styleClass              = (row.data().status == 'Pending') ? 'txstat pending' : 'txstat';
                    statusCell.innerHTML        = '<span class="' + styleClass + '">' + row.data().status + '</span>';
                }
            });
        }
        function balanceChangeHandler(message) {
            var newTransaction = message.payload.tx;
            var table          = $('#transactionsTable').DataTable();
            table.row.add(newTransaction).draw();
        }
    };
    angular.element(document).ready(function () {
        $scope.$watch('selectedAccount', function(newValue, oldValue) {
            $scope.run(newValue.account);
        });
        $scope.run($scope.selectedAccount.account);
    });
}]);