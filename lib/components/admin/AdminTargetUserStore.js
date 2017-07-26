var AppDispatcher = require('../../dispatcher/AppDispatcher')
, EventEmitter = require('events').EventEmitter
, SwellAdminConstants = require('./AdminDashboardConstants.js')
;

var CHANGE_EVENT = 'change';

var _userData = {};

var UserStore = Object.assign({}, EventEmitter.prototype, {
  getUid: function() {
    return UID;
  },

  getUserData: function() {
    return _userData;
  },
  emitChange: function () {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function (callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function (callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case SwellAdminConstants.RECEIVE_USER_DATA:
    _userData = action.userData;
    UserStore.emitChange();
    break;
  }
});

module.exports = UserStore;
