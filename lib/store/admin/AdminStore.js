var AppDispatcher = require('../../dispatcher/AppDispatcher')
  , EventEmitter = require('events').EventEmitter
  , AdminDashboardConstants = require('../../components/admin/AdminDashboardConstants.js')
  ;

var CHANGE_EVENT = 'change';

// Array of Admin User Note objects keyed to uid
var _adminUserNotes = [];


var AdminStore = Object.assign({}, EventEmitter.prototype, {
  getAdminUserNotes: function () {
   return _adminUserNotes;
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
    case AdminDashboardConstants.RECEIVE_ADMIN_USER_NOTES:
      _adminUserNotes = action.adminUserNotes;
      AdminStore.emitChange();
      break;
  }
});

module.exports = AdminStore;

