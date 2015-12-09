/**
 * Created by Jesion on 2015-12-09.
 */

describe('verifyAccount', function() {

    beforeEach(module('verifyAccount'));

    describe('verifyAccountController', function () {

        var $scope, $state, appConfig, createController, emailState, $httpBackend, $rootScope;

        beforeEach(inject(function (_$rootScope_, $controller, _$state_, _appConfig_, _$httpBackend_) {
            $rootScope = _$rootScope_;
            $state = _$state_;
            $httpBackend = _$httpBackend_;
            emailState = $state.get('email');
            $scope = $rootScope.$new();
            appConfig = _appConfig_;
            createController = function() {
                return $controller('verifyAccountController', { '$scope': $scope, '$state': $state, 'appConfig': appConfig });
            };
        }));

        it('should be constructed', function() {
           var ctrl = createController();
           expect(ctrl).toBeDefined();
           expect($scope).toBeDefined();
           expect($state).toBeDefined();
           expect(appConfig).toBeDefined();
           expect(appConfig.dotPayUrlBase).toEqual('https://ssl.dotpay.pl/t2/?id=447185');
           expect(appConfig.env).toEqual('dev');
           expect(emailState.name).toEqual('email');
           expect(emailState.templateUrl).toEqual('/modules/account/verify/email.html');
           expect(emailState.controller).toBeDefined();
           expect(window.location.hostname).toEqual('localhost');
           expect($scope.config).toBeDefined();
           expect($scope.config.env).toEqual('dev');
        });
    });
});