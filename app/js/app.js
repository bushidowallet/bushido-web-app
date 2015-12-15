/*jshint browser: true */

var app = angular.module("app", ['ngCookies']);

app.config(function($cookiesProvider) {
    $cookiesProvider.defaults.path = '/';
});

/* globals jQuery */
(function($) {
    $.QueryString = (function(a) {
        if (a === "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));
})(jQuery);

function getEnv() {
    return window.location.hostname == 'localhost' ? 'dev' : 'prod';
}

app.factory('appConfig', function () {
    var AppConfig = function () {
        this.defaultRecipientAddress = '1KxRfiqcNi2GbpdN3pzuQHgewShmeNW9g1';
        this.dotPayUrlBase = 'https://ssl.dotpay.pl/t2/?id=447185';
    };
    AppConfig.prototype.init = function (env) {
        this.env = env;
        this.urlBase = (env == 'prod') ? 'https://api.bushidowallet.com/walletapi' : 'http://localhost:8080/walletapi';
        this.socketServerUrl = (env == 'prod') ? 'https://websockets.bushidowallet.com/stomp' : 'http://localhost:15674/stomp';
        console.log('Initialized AppConfig for environment ' + env);
        return this;
    };
    return new AppConfig();
});

app.factory('walletModel', function () {
    var WalletModel = function() {
    };
    WalletModel.prototype.init = function (user, wallets, selectedWallet, selectedAccount) {
        this.user = user;
        this.wallets = wallets;
        this.selectedWallet = (!!selectedWallet) ? selectedWallet : wallets[0];
        var a = (!!selectedAccount) ? selectedAccount.account : this.selectedWallet.accounts[0].account;
        var sAccount;
        for (var i = 0; i < this.selectedWallet.accounts.length; i++) {
            if (this.selectedWallet.accounts[i].account == a) {
                sAccount = this.selectedWallet.accounts[i];
            }
        }
        if (!!sAccount) {
            this.selectedAccount = sAccount;
        } else {
            console.log('Unable to find account ' + a + ' on wallet ' + this.selectedWallet.key);
        }
        return this;
    };
    return new WalletModel();
});

app.factory('walletManager', function() {
    var m;
    var c;
    var persist = function() {
        c.put('user', m.user);
        c.put('wallets', m.wallets);
        c.put('selectedWallet', m.selectedWallet);
        c.put('selectedAccount', m.selectedAccount);
    };
    return {
        init: function ($cookieStore, $scope, appConfig, walletModel) {
            var model = walletModel.init($cookieStore.get('user'), $cookieStore.get('wallets'), $cookieStore.get('selectedWallet'), $cookieStore.get('selectedAccount'));
            var config = appConfig.init(getEnv());
            $scope.model = model;
            $scope.config = config;
            m = model;
            c = $cookieStore;
            persist();
        },
        open: function (wallet) {
            m.selectedWallet = wallet;
            m.selectedAccount = wallet.accounts[0];
            persist();
        },
        save: function () {
            persist();
        },
        update: function (payload) {
            for (var i = 0; i < m.wallets.length; i++) {
                if (m.wallets[i].key == payload.key) {
                    m.wallets.slice(i, 1, payload);
                }
            }
            if (m.selectedWallet.key == payload.key) {
                m.selectedWallet = payload;
            }
            for (var j = 0; j < payload.accounts.length; j++) {
                if (m.selectedAccount.account == payload.accounts[j].account) {
                    m.selectedAccount = payload.accounts[j];
                }
            }
            persist();
        }
    };
});

app.factory('Base64', function() {
    var keyStr = 'ABCDEFGHIJKLMNOP' +
        'QRSTUVWXYZabcdef' +
        'ghijklmnopqrstuv' +
        'wxyz0123456789+/' +
        '=';
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                console.log("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);
            return output;
        }
    };
});