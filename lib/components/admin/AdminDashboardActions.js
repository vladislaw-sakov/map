var AppDispatcher = require('../../dispatcher/AppDispatcher.js')
, AdminDashboardConstants = require('./AdminDashboardConstants.js')
, SwellAdminAPIUtils = require('./SwellAdminAPIUtils.js')
;

var apiUtils = new SwellAdminAPIUtils();

var AdminDashboardActions = {
  //TODO: refactor out the Wunderlist related actions to a separate Actions file
  receiveListData: function( lists ) {
    AppDispatcher.dispatch({
      "actionType": AdminDashboardConstants.RECEIVE_LIST_DATA,
      "lists": lists
    });
  },
  receiveListTasks: function( listId, tasks ) {
    AppDispatcher.dispatch({
      "actionType": AdminDashboardConstants.RECEIVE_LIST_TASKS,
      "listId": listId,
      "tasks": tasks
    });
  },
  receiveListCompletedTasks: function( listId, tasks ) {
    AppDispatcher.dispatch({
      "actionType": AdminDashboardConstants.RECEIVE_LIST_COMPLETED_TASKS,
      "listId": listId,
      "tasks": tasks
    });
  },
  fetchTasksStarted: function() {
    AppDispatcher.dispatch({
      "actionType": AdminDashboardConstants.TASKS_FETCH_STARTED
    });
  },
  allTasksFetchFinished: function() {
    AppDispatcher.dispatch({
      "actionType": AdminDashboardConstants.ALL_TASKS_FETCHED
    });
  },
  receiveTypeformResponseData: function( typeformResponseData ) {
    AppDispatcher.dispatch({
      "actionType": AdminDashboardConstants.RECEIVE_TYPEFORM_RESPONSE_DATA,
      "typeformResponses": typeformResponseData
    });
  },
  receiveUserData: function( userData ) {
    AppDispatcher.dispatch({
      "actionType": AdminDashboardConstants.RECEIVE_USER_DATA,
      "userData": userData
    });
  },
  fetchAdminUserNotes: function(uid) {
    AppDispatcher.dispatch({
      actionType: AdminDashboardConstants.GET_ADMIN_USER_NOTES
    });
    apiUtils.fetchAdminUserNotes(uid);
  },
  updateAdminUserNotes: function(uid, note) {
    AppDispatcher.dispatch({
      actionType: AdminDashboardConstants.UPDATE_ADMIN_USER_NOTE,
    });
    apiUtils.updateAdminUserNotes(uid, note);
  }
};

module.exports = AdminDashboardActions;
