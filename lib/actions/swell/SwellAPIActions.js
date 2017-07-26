var DashboardConstants = require('../../constants/dashboard/DashboardConstants.js')
, SwellStreamConstants = require('../../constants/swell/SwellStreamConstants.js')
, SwellSessionConstants = require('../../constants/auth/SwellSessionConstants.js')
, NotesConstants = require('../../constants/notes/NotesConstants.js')
, AppDispatcher = require('../../dispatcher/AppDispatcher.js')
;

var SwellAPIActions = {
  fetchTokenStarted: function() {
    AppDispatcher.dispatch({
      actionType: DashboardConstants.FETCH_TOKEN_STARTED
    });
  },
  fetchTokenCompleted: function() {
    AppDispatcher.dispatch({
      actionType: DashboardConstants.FETCH_TOKEN_COMPLETED
    });
  },
  receiveWunderlistToken: function( token ) {
    AppDispatcher.dispatch({
      actionType: DashboardConstants.RECEIVE_TOKEN_WUNDERLIST,
      token: token
    });
  },

  missingWunderlistToken: function() {
    AppDispatcher.dispatch({
      actionType: DashboardConstants.NO_WUNDERLIST_TOKEN
    });
  },
  signupError: function(err) {
    AppDispatcher.dispatch({
      actionType: SwellSessionConstants.SIGNUP_ERROR,
      error: err
    });
  },
  receiveSessionData: function(sessionData) {
    AppDispatcher.dispatch({
      actionType: SwellSessionConstants.RECEIVE_SESSION,
      sessionData: sessionData
    });

    // set up mixpanel
    mixpanel.alias(sessionData.uid);
    mixpanel.people.set({
      "$created": (new Date()).toISOString(),
      "$email": sessionData.key,
      "uid": sessionData.uid,
      "variation": sessionData.variation
    });
  },
  receiveUserData: function( userData ) {
    AppDispatcher.dispatch({
      actionType: DashboardConstants.RECEIVE_USER_DATA,
      userData: userData
    });
  },
  receiveUserStream: function(streamData) {
    AppDispatcher.dispatch({
      "actionType": SwellStreamConstants.RECEIVE_STREAM,
      "streamData": streamData
    });
  },
  receiveUserStreamObject: function(streamObject) {
    AppDispatcher.dispatch({
      "actionType": SwellStreamConstants.RECEIVE_FEATURED_STREAM_OBJECT,
      "streamObject": streamObject
    });
  },
  receiveNote: function(key, note) {
    AppDispatcher.dispatch({
      "actionType": NotesConstants.RECEIVE_NOTE,
      "key": key,
      "note": note
    });
  },
  streamFetchFinished: function() {
    AppDispatcher.dispatch({
      "actionType": SwellStreamConstants.LOADING_FINISHED
    })
  }
};

module.exports = SwellAPIActions;
