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
                'topbar': { templateUrl: '/modules/shared/topbar.html' },
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
                'content': { templateUrl: '/modules/docs/main.html',
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
        walletManager.open(wallet);
    };
    $state.go('main');
}]);