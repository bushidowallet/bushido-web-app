/**
 * Created by Jesion on 2015-01-10.
 */
var docs = angular.module('docs', ['app', 'ui.router']);

docs.config(function($stateProvider) {
    $stateProvider
        .state('main', {
            name: 'main',
            views: {
                '': { templateUrl: 'docs.html' },
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
                'content': { templateUrl: 'partials/docs/main.html',
                    controller: function ($scope) {
                        $scope.restDocUrl = $scope.config.urlBase + '/client/apidoc/rest/';
                        $scope.websocketDocUrl = $scope.config.urlBase + '/client/apidoc/websocket/';
                    }
                }
            }
        });
});

docs.controller('docsController', ['$state', '$cookieStore', '$scope', 'appConfig', 'walletModel', 'walletManager', function ($state, $cookieStore, $scope, appConfig, walletModel, walletManager) {
    walletManager.init($cookieStore, $scope, appConfig, walletModel);
    $scope.open = function (wallet) {
        walletManager.open(wallet, 'docs.html');
    };
    $state.go('main');
}]);