var login = angular.module('login', ['app', 'ui.router']);

login.config(function($stateProvider) {

    $stateProvider
        .state('userpass', {
            name: 'userpass',
            templateUrl: "partials/signin/userpass.html",
            controller: function ($scope, $state, $http, Base64, $cookieStore) {
                $scope.inputType = 'password';
                $scope.hideShowPassword = function(){
                    if ($scope.inputType == 'password')
                        $scope.inputType = 'text';
                    else
                        $scope.inputType = 'password';
                };
                $scope.doLogin = function() {
                    $scope.loginerror = false;
                    $scope.loginerrorverify = false;
                    var url = $scope.config.urlBase + '/api/v2/user/auth';
                    var request = {userIdOrEmail: $scope.userIdOrEmail, credential: $scope.password};
                    $http.post(url, JSON.stringify(request)).success(function(data) {
                        if (data.errors == null || data.errors.length == 0) {
                            $cookieStore.put('username', data.user.username);
                            $cookieStore.put('password', $scope.password);
                            $cookieStore.put('env', $scope.env);
                            console.log('Saving cookie key: env, value: ' + $scope.env);
                            if (data.user.has2FAEnabled == false) {
                                $cookieStore.put('user', data.user);
                                $cookieStore.put('wallets', data.wallets);
                                console.log("Wallets: " + data.wallets.length);
                                if (data.wallets.length == 1) {
                                    $cookieStore.put('wallet', data.wallets[0]);
                                    window.location.href = 'wallet.html';
                                } else if (data.wallets.length == 0) {
                                    window.location.href = 'panel.html';
                                } else if (data.wallets.length > 1) {
                                    $cookieStore.put('wallet', data.wallets[data.wallets.length - 1]);
                                    window.location.href = 'wallet.html';
                                }
                                $scope.loginerror = false;
                            } else {
                                $state.go('code');
                            }
                        } else {
                            var error = data.errors[0];
                            var msg = 'Login failed.';
                            if (error.code == 28 || error.code == 29) {
                                $scope.loginerrorverify = true;
                            } else {
                                $scope.errorMessage = msg;
                                $scope.loginerror = true;
                            }
                        }
                    }).error(function(data) {
                        $scope.loginerror = true;
                        $scope.errorMessage = "Login failed.";
                    });
                };
            }
        })
        .state('code', {
            name: 'code',
            templateUrl: "partials/signin/code.html",
            controller: function ($scope, $http, Base64, $cookieStore) {
                $scope.username = $cookieStore.get('username');
                $scope.loginerror = false;
                $scope.doRequestSMS = function() {
                    var url = $scope.config.urlBase + '/api/v2/user/auth/code/token';
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($scope.username + ':' + $cookieStore.get('password'));
                    var request = {username: $scope.username, enforceSms: true};
                    $http.post(url, JSON.stringify(request));
                };
                $scope.doLogin = function() {
                    var url = $scope.config.urlBase + '/api/v2/user/auth/code';
                    var request = {userIdOrEmail: $scope.username, credential: $scope.code};
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode($scope.username + ':' + $cookieStore.get('password'));
                    $http.post(url, JSON.stringify(request)).success(function(data) {
                        if (data.errors == null || data.errors.length == 0) {
                            $cookieStore.put('user', data.user);
                            $cookieStore.put('wallets', data.wallets);
                            console.log("Wallets: " + data.wallets.length);
                            if (data.wallets.length == 1) {
                                $cookieStore.put('wallet', data.wallets[0]);
                                window.location.href = 'wallet.html';
                            } else if (data.wallets.length == 0) {
                                window.location.href = 'panel.html';
                            } else if (data.wallets.length > 1) {
                                $cookieStore.put('wallet', data.wallets[data.wallets.length - 1]);
                                window.location.href = 'wallet.html';
                            }
                            $scope.loginerror = false;
                        } else {
                            $scope.loginerror = true;
                        }
                    }).error(function(data) {
                        $scope.loginerror = true;
                    });
                };
            }
        })
});

login.controller('loginController', ['$state', '$scope', '$cookieStore', 'appConfig', function ($state, $scope, $cookieStore, appConfig) {
    $scope.env = $.QueryString['env'];
    $scope.config = appConfig.init($scope.env);
    $scope.loginerror = false;
    $cookieStore.remove('username');
    $cookieStore.remove('password');
    $cookieStore.remove('wallet');
    $cookieStore.remove('rootKeyHash');
    $cookieStore.remove('env');
    $cookieStore.remove('user');
    $cookieStore.remove('wallets');
    $state.go('userpass');
}]);
