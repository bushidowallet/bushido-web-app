var register = angular.module('register', ['app', 'ui.router']);

register.factory('signupModel', function () {
    return {
        organizationId: null,
        regCode: null,
        userId: null,
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        countryCode: null,
        walletId: null
    }
});

register.config(function($stateProvider) {

    $stateProvider
        .state('welcome', {
            name: 'welcome',
            templateUrl: "/modules/signup/welcome.html"
        })
        .state('code', {
            name: 'code',
            templateUrl: "/modules/signup/code.html",
            controller: function ($scope, signupModel, $state) {
                $scope.doRegisterIndividual = function() {
                    signupModel.organizationId = "individuals";
                    signupModel.organizationName = "Individuals";
                    signupModel.regCode = $scope.regCode;
                    $state.go('userSetup');
                };
                $scope.doRegisterOrganization = function() {
                    signupModel.regCode = $scope.regCode;
                    $state.go('organizationSetup');
                }
            }
        })
        .state('organizationSetup', {
            name: 'organizationSetup',
            templateUrl: "/modules/signup/organization.html",
            controller: function ($scope, signupModel, $state, $http) {
                var check = function (str) {
                    if (str.length < 5) {
                        return false
                    }
                    return true;
                };
                $scope.doCreateOrganization = function() {
                    if (check($scope.organizationId) == true) {
                        var organization = {key: $scope.organizationId, name: $scope.organizationName, apiKey: "", regCode: signupModel.regCode};
                        $http.post($scope.config.urlBase + '/api/v2/registration/organization', JSON.stringify(organization)).success(function (data) {
                            if (data.payload != null && data.errors == null) {
                                signupModel.organizationId = $scope.organizationId;
                                $state.go('userSetup');
                            } else if (data.errors) {
                                var errorCode = data.errors[0].code;
                                var msg = null;
                                if (errorCode == 10) {
                                    msg = "Organization Id " + $scope.organizationId + " already exists. Pick a different Organization Id."
                                } else if (errorCode == 18) {
                                    msg = "Invalid Trial Code provided.";
                                }
                                $scope.orgError = true;
                                $scope.errorMessage = msg;
                            }
                        });
                    } else {
                        $scope.orgError = true;
                        $scope.errorMessage = "Organization Id needs to have at least 5 characters.";
                    }
                };
            }
        })
        .state('userSetup', {
            name: 'userSetup',
            templateUrl: "/modules/signup/user.html",
            controller: function ($scope, signupModel, $state, $http) {
                var isValidUserId = function (user) {
                    if (user == null || user.length < 5) {
                        return false;
                    }
                    return true;
                };
                var isValidEmail = function (email) {
                    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    return regex.test(email);
                }
                var isValidPassword = function (pass) {
                    var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{10,50}$/;
                    return regex.test(pass);
                }
                var isValidPhone = function (phone) {
                    var regex = /^[0-9]{8,15}$/;
                    return regex.test(phone);
                }
                var isValidCountryCode = function (countrycode) {
                    var regex = /^[0-9]{1,3}$/;
                    return regex.test(countrycode);
                }
                $scope.doCreateUser = function() {
                    if (isValidUserId($scope.userId) == true) {
                        if (isValidPassword($scope.userPassword) == true) {
                            if (isValidEmail($scope.userEmail) == true) {
                                if (isValidPhone($scope.userPhone) == true) {
                                    if (isValidCountryCode($scope.userPhoneCountryCode)) {
                                        var user = {
                                            firstName: $scope.firstName,
                                            lastName: $scope.lastName,
                                            username: $scope.userId,
                                            password: $scope.userPassword,
                                            organization: signupModel.organizationId,
                                            email: $scope.userEmail,
                                            regCode: signupModel.regCode,
                                            phone: $scope.userPhone,
                                            countryCode: $scope.userPhoneCountryCode
                                        };
                                        $http.post($scope.config.urlBase + '/api/v2/registration/user', JSON.stringify(user)).success(function (data) {
                                            if (data.payload != null && data.errors == null) {
                                                signupModel.firstName = user.firstName;
                                                signupModel.lastName = user.lastName;
                                                signupModel.userId = user.username;
                                                signupModel.email = user.email;
                                                signupModel.phone = user.phone;
                                                signupModel.countryCode = user.countryCode;
                                                $state.go('walletSetup');
                                            } else if (data.errors) {
                                                var errorCode = data.errors[0].code;
                                                var msg = null;
                                                if (errorCode == 7) {
                                                    msg = "User Id " + $scope.userId + " already exists. Pick a different User Id.";
                                                } else if (errorCode == 11) {
                                                    msg = "Organization Id " + signupModel.organizationId + " does not exist. Create this Organization first.";
                                                } else if (errorCode == 18) {
                                                    msg = "Invalid Trial Code provided.";
                                                } else if (errorCode == 20) {
                                                    msg = "E-mail address already taken. Use a diffrent email address.";
                                                }
                                                $scope.userError = true;
                                                $scope.errorMessage = msg;
                                            }
                                        });
                                    } else {
                                        $scope.userError = true;
                                        $scope.errorMessage = "Phone Country Code is not valid. Provide between 1 and 2 digits.";
                                    }
                                } else {
                                    $scope.userError = true;
                                    $scope.errorMessage = "Phone is not valid. Provide a valid phone number.";
                                }
                            } else {
                                $scope.userError = true;
                                $scope.errorMessage = "Email is not valid. Provide a valid email.";
                            }
                        } else {
                            $scope.userError = true;
                            $scope.errorMessage = "Password needs to have between 10 and 50 characters, at least one digit, at least one upper case.";
                        }
                    } else {
                        $scope.userError = true;
                        $scope.errorMessage = "User Id needs to have at least 5 characters.";
                    }
                }
            }
        })
        .state('walletSetup', {
            name: 'walletSetup',
            templateUrl: "/modules/signup/wallet.html",
            controller: function ($scope, signupModel, $state, $http) {
                var checkEntropy = function (str) {
                    if (str.length < 20) {
                        return false;
                    }
                    return true;
                };
                var check = function (str) {
                    if (str.length < 5) {
                        return false
                    }
                    return true;
                };
                $scope.doCreateWallet = function() {
                    if (checkEntropy($scope.walletEntropy) == true) {
                        if (check($scope.walletId) == true) {
                            var s = [];
                            s.push({key: 'compressedKeys', value: true});
                            s.push({key: 'passphrase', value: $scope.walletEntropy});
                            s.push({key: 'instruments', value: 'BTCPLN'});
                            var wallet = {key: $scope.walletId, owner: signupModel.userId, settings: s, accounts: [], regCode: signupModel.regCode};
                            $http.post($scope.config.urlBase + '/api/v2/registration/wallet', JSON.stringify(wallet)).success(function (data) {
                                if (data.payload != null && data.errors == null) {
                                    signupModel.walletId = wallet.key;
                                    $state.go('thanks');
                                } else if (data.errors) {
                                    var errorCode = data.errors[0].code;
                                    var msg = null
                                    if (errorCode == 1) {
                                        msg = "Could not create a wallet. Pick a different Wallet Id.";
                                    } else if (errorCode == 14) {
                                        msg = "Unexpected problem while creating wallet. Contact us.";
                                    } else if(errorCode == 18) {
                                        msg = "Invalid Trial Code provided.";
                                    }
                                    $scope.walletError = true;
                                    $scope.errorMessage = msg;
                                }
                            });
                        } else {
                            $scope.walletError = true;
                            $scope.errorMessage = "Wallet Id needs to have at least 5 characters.";
                        }
                    } else {
                        $scope.walletError = true;
                        $scope.errorMessage = "Wallet Entropy needs to have at least 20 characters.";
                    }
                }
            }
        })
        .state('thanks', {
            name: 'thanks',
            templateUrl: "/modules/signup/thanks.html",
            controller: function ($scope, signupModel) {
                $scope.walletId = signupModel.walletId;
                $scope.userId = signupModel.userId;
                $scope.organizationId = signupModel.organizationId;
                $scope.email = signupModel.email;
            }
        })
});
register.controller('registerController', ['$scope', '$state', 'appConfig', function ($scope, $state, appConfig) {
    $scope.env = $.QueryString['env'];
    $scope.config = appConfig.init($scope.env);
    $scope.welcomeScreen = function() {
        renderState('welcome');
    }
    $scope.code = function() {
        renderState('code');
    }
    $scope.organizationSetup = function() {
        renderState('organizationSetup');
    }
    $scope.userSetup = function() {
        renderState('userSetup');
    }
    $scope.walletSetup = function() {
        renderState('walletSetup');
    }
    var renderState = function (name) {
        $state.go(name);
    }
    renderState('welcome');
}]);