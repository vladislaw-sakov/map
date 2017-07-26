var WunderlistDashboardActions = require('./AdminDashboardActions.js')
, async = require('async')
;

var wunderlistToken = typeof WUNDERLIST_ACCESS_TOKEN != 'undefined' ? WUNDERLIST_ACCESS_TOKEN : null;
var wunderlistClientId = typeof WUNDERLIST_CLIENT_ID != 'undefined' ? WUNDERLIST_CLIENT_ID : null;

if( wunderlistToken && wunderlistClientId ) {
  var WunderlistSDK = window.wunderlist.sdk;
  var WunderlistAPI = new WunderlistSDK({
    "accessToken": wunderlistToken,
    "clientID": wunderlistClientId
  });
}

var WunderlistAPIUtils = {
  fetchListData: function() {
    var self = this;
    WunderlistDashboardActions.fetchTasksStarted();
    if( !WunderlistAPI ) {
      WunderlistDashboardActions.allTasksFetchFinished();
      return;
    }
    WunderlistAPI.initialized.done(function () {
      // Where handleListData and handleError are functions
      // 'http' here can be replaced with 'socket' to use a WebSocket connection for all requests
      WunderlistAPI.http.lists.all()
      .done(function(lists){
        WunderlistDashboardActions.receiveListData( lists );
        async.each(lists, function(list, callbackA) {
          self.fetchTasksForList( list.id, function(err, data) {
            callbackA();
          });
        }, function(err) {
          WunderlistDashboardActions.allTasksFetchFinished();
        });
      })
      .fail(function(error) {
        WunderlistDashboardActions.allTasksFetchFinished();
      });
    });
  },
  fetchTasksForList: function( listId, callback ) {
    async.parallel([
      function(callbackA) {
        WunderlistAPI.http.tasks.forList( listId )
        .done(function(tasks){
          WunderlistDashboardActions.receiveListTasks( listId, tasks );
          callbackA();
        })
        .fail(function(error){
          callbackA();
        });
      },
      function(callbackB) {
        WunderlistAPI.http.tasks.forList( listId, true)
        .done(function(tasks){
          WunderlistDashboardActions.receiveListCompletedTasks( listId, tasks );
          callbackB();
        })
        .fail(function(error){
          callbackB();
        });
      }
    ], function(err) {
      if( callback ) {
        callback(err, {});
      }
    });
  }
};

module.exports = WunderlistAPIUtils;
