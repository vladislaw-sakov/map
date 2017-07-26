var AppDispatcher = require('../../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var SessionConstants = require('../../constants/auth/SwellSessionConstants');
var cookie = require('cookie');


var _session = {};
var _impersonateUid;
var _isLoggedIn = false;
var _error = null;

function receiveSession(session) {
    if( session.token ) {
        _session = session;
        _isLoggedIn = true;
        _error = null;

        var expires = session["expires"];
        var expireDate = new Date(expires*1000);

        document.cookie = cookie.serialize("token", session["token"], {"path":'/', "expires": expireDate});
        document.cookie = cookie.serialize("uid", session["uid"], {"path":'/', "expires": expireDate});


        SwellSessionStore.emitChange();
    }
}

function queryCookie() {
    _session = cookie.parse(document.cookie);
    if (_session.token) { // if cookie had a token
        _isLoggedIn = true;
        _error = null;

        SwellSessionStore.emitChange();
    }
}

function destroy() {
    _session = {};
    _isLoggedIn = false;
    document.cookie = cookie.serialize("token", "", {path: "/", expires: new Date(0)});
    document.cookie = cookie.serialize("uid", "", {path: "/", expires: new Date(0)});
    document.cookie = cookie.serialize("expires", "", {"path":'/'});
    window.location = "/dashboard#/login";
    window.location.reload();
}


var SwellSessionStore = Object.assign({}, EventEmitter.prototype, {
    getIsLoggedIn: function() {
        return _isLoggedIn;
    },

    getError: function() {
        return _error;
    },

    getSession: function() {
        return _session;
    },

    getUid: function() {
        return _impersonateUid || _session.uid;
    },

    emitChange: function() {
        this.emit('change');
    },

    addChangeListener: function(callback) {
        this.on('change', callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener('change', callback);
    }
});


AppDispatcher.register(function(action) {

    switch (action.actionType) {
        case SessionConstants.RECEIVE_SESSION:
            receiveSession(action.sessionData);
            break;

        case SessionConstants.SIGNUP_ERROR:
            _error = action.error;
            SwellSessionStore.emitChange();
            break;

        case SessionConstants.COOKIE_GET:
            queryCookie();
            break;

        case SessionConstants.SESSION_DESTROY:
            destroy();
            SwellSessionStore.emitChange();
            break;

        case SessionConstants.IMPERSONATE:
            _isLoggedIn = true;
            _error = false;
            _impersonateUid = action.impersonateUid;
            SwellSessionStore.emitChange();
            break;

        default:
    }
});

module.exports = SwellSessionStore;
