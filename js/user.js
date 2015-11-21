/**
 * Created by Jesion on 2015-01-10.
 */
var user = angular.module('user', ['app', 'ui.router']);

user.config(function($stateProvider) {
    $stateProvider
        .state('main', {
            name: 'main',
            views: {
                '': { templateUrl: 'user.html' },
                'topbar': { templateUrl: 'partials/shared/topbar.html' },
                'sidebar': {
                    templateUrl: 'partials/shared/sidebar.html',
                    controller: function ($scope, $cookieStore, walletModel) {
                        $scope.selectedAccount = walletModel.selectedAccount;
                        $scope.$watch('selectedAccount', function (newValue, oldValue) {
                            if (newValue != oldValue) {
                                walletModel.selectedAccount = newValue;
                                $cookieStore.put('selectedAccount', newValue.account);
                            }
                        });
                    }
                },
                'content': { templateUrl: 'partials/user/main.html' }
            }
        });
});

user.controller('userController', ['$state', '$cookieStore', '$scope', 'appConfig', 'walletModel', 'wallet', function ($state, $cookieStore, $scope, appConfig, walletModel, wallet) {
    wallet.init($cookieStore, $scope, appConfig, walletModel);
    $scope.open = function (wallet) {
        $cookieStore.put('wallet', wallet);
        window.location.href = 'user.html';
    };
    $state.go('main');
}]);