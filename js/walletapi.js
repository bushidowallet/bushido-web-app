var WalletApi;

(function() {

    /**
     * WalletApi - an interface to wallet notifications
     *
     * @param serviceUrl - Wallet API WebSocket endpoint
     * @param username - User name logged in
     * @param password - User password
     * @param walletId - Wallet Id you are interacting with
     * @param autoConnect - Tells whether connect automatically
     * @param connectCommand - Command to execute immediately after connection is established
     * @param connectPayload - Payload that has to be carried with connect command
     * @param connectHandler - Handler that has to be notified when connection command's response is back
     * @param subscribeDestination - Desitnation for wallet server to client messaging ( '/exchange/e-wallet-updates/' )
     * @param sendDestination - Destination for client to server messaging ( '/queue/wallet' )
     * @returns {WalletApi}
     * @constructor
     */
    WalletApi = function(serviceUrl,
                         username,
                         password,
                         walletId,
                         autoConnect,
                         connectCommand,
                         connectPayload,
                         connectHandler,
                         subscribeDestination,
                         sendDestination) {
        var ws                    = new SockJS(serviceUrl);
        var client                = Stomp.over(ws);
        client.heartbeat.incoming = 0;
        client.heartbeat.outgoing = 0;
        var observers             = [];
        this.client               = client;
        this.serviceUser          = 'bushido';
        this.servicePassword      = 'bushido';
        this.username             = username;
        this.password             = password;
        this.walletId             = walletId;
        this.sendDestination      = sendDestination;
        this.observers            = observers;
        this.on_connect = function(frame) {
            client.subscribe(subscribeDestination + walletId);
            if (connectCommand != null) {
                invoke(client, username, password, connectCommand, connectPayload, connectHandler, observers, walletId, sendDestination);
            }
        };
        this.on_error =  function() {
            console.log('error');
        };
        client.onreceive = function(m) {
            var payload = JSON.parse(m.body);
            var index   = -1;
            if (observers != null) {
                for (var i = 0; i < observers.length; i++) {
                    if (observers[i].type == 'notification') {
                        if (observers[i].command == payload.command) {
                            observers[i].handler.call(this, payload);
                        }
                    } else if(observers[i].type == 'rpc') {
                        if (observers[i].correlationId == payload.correlationId) {
                            index = i;
                            observers[i].handler.call(this, payload);
                        }
                    }
                }
                if (index > -1) {
                    observers.splice(index, 1);
                }
            }
        };
        if (autoConnect) {
            this.connect();
        }
        return {
            'connect'         : WalletApi.prototype.connect,
            'invoke'          : WalletApi.prototype.invoke,
            'addListener'     : WalletApi.prototype.addListener,
            'removeListener'  : WalletApi.prototype.removeListener,
            'observers'       : this.observers,
            'client'          : this.client,
            'serviceUser'     : this.serviceUser,
            'servicePassword' : this.servicePassword,
            'on_connect'      : this.on_connect,
            'on_error'        : this.on_error,
            'username'        : this.username,
            'password'        : this.password,
            'walletId'        : this.walletId,
            'sendDestination' : this.sendDestination
        };
    };

    WalletApi.prototype.connect = function() {
        this.client.connect(this.serviceUser, this.servicePassword, this.on_connect, this.on_error, '/');
        return this;
    };

    WalletApi.prototype.invoke = function(command, payload, responseHandler, correlationId) {
        invoke(this.client, this.username, this.password, command, payload, responseHandler, this.observers, this.walletId, this.sendDestination, correlationId);
        return this;
    };

    WalletApi.prototype.addListener = function(command, handler) {
        this.observers.push(new MessageListener(null, command, handler, 'notification'));
        return this;
    };

    WalletApi.prototype.removeListener = function(command, handler) {
        var index = -1;
        for (var i = 0; i < this.observers.length; i++) {
            if (this.observers[i].command == command && this.observers[i].handler == handler && this.observers[i].type == 'notification') {
                index = i;
            }
        }
        if (index > -1) {
            this.observers.splice(index, 1);
        }
        return this;
    };

    function invoke(client, username, password, command, payload, handler, observers, walletId, sendDestination, correlationId) {
        if (correlationId == null) {
            correlationId = generateUUID();
        }
        if (handler != null) {
            observers.push(new MessageListener(correlationId, command, handler, 'rpc'));
        }
        console.log('Invoking ' + command + ' on wallet ' + walletId + ' with correlationId: ' + correlationId + '...');
        client.send(sendDestination,
            {'content-type':'application/json','__TypeId__':'com.bitcoin.blockchain.api.domain.message.ClientMessage'},
            JSON.stringify({'correlationId':correlationId,
                'username': username,
                'password': password,
                'key': walletId,
                'command': command,
                'payload': payload}
            )
        );
    }

    function generateUUID(){
        var d    = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d     = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    }

})();

var MessageListener = function(correlationId, command, handler, type) {
    this.correlationId = correlationId;
    this.command = command;
    this.handler = handler;
    this.type = type;
};