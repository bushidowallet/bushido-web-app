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
                'topbar': { templateUrl: 'modules/shared/topbar.html' },
                'sidebar': {
                    templateUrl: 'modules/shared/sidebar.html',
                    controller: function($scope, walletModel, walletManager) {
                        $scope.$watch(function () { return walletModel.selectedAccount }, function (newValue, oldValue) {
                            if (newValue !== oldValue) {
                                walletManager.save();
                            }
                        });
                    }
                },
                'content': { templateUrl: 'modules/user/main.html' }
            }
        });
});

user.controller('userController', ['$state', '$cookieStore', '$scope', 'appConfig', 'walletModel', 'walletManager', function ($state, $cookieStore, $scope, appConfig, walletModel, walletManager) {
    walletManager.init($cookieStore, $scope, appConfig, walletModel);
    $scope.open = function (wallet) {
        walletManager.open(wallet);
    };
    $state.go('main');
}]);