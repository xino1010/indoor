app.factory('socket', function($rootScope, users, auth) {
    var socket = null;

    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                	callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        },
        connect: function (callBack) {
            socket = io.connect();
            socket.on('connect', function() {
                console.log('Connected successfully to websocket');
                socket.emit('userid', auth.getUser()._id);
                socket.on('users', function (_users) {
                    users.setUsers(_users);
                });
                socket.on('user-online', function (userOnline) {
                    users.updateUser(userOnline);
                });
                socket.on('user-disconnected', function (userDisconnected) {
                    users.updateUser(userDisconnected);
                });
                if (callBack)
                    callBack();
            });
        },
        disconnect: function (callBack) {
            if (this.isConnected()) {
                socket.disconnect();
                socket = null;
            }
            if (callBack)
                callBack();
        },
        isConnected: function () {
            if (socket != null && socket.hasOwnProperty('connected'))
                return socket.connected;
            else
                return false;
        }
    };
});