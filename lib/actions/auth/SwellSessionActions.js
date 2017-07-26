var AppDispatcher = require('../../dispatcher/AppDispatcher')
, SessionConstants = require('../../constants/auth/SwellSessionConstants')
, SwellAPIUtils = require('../../api/swell/SwellAPIUtils.js')
;

/**
* on initial main component load it goes through the action creator.
*
* Creator fires off two separate things -> a REQ to web api utils and
* simultaneously create the actual action that eventually gets dispatched to
* the store
*
* if the http req fails, create another action to update the store that it
* failed
*
*/


var apiUtils = new SwellAPIUtils({
  baseUrl: API_URL
});


var SessionActions = {

  signUp: function(signUpData) {
    // "false" param specifies synchronous execution
    apiUtils.signUp(signUpData);
  },

  login: function(loginData) {
    // "false" param specifies synchronous execution
    apiUtils.login(loginData, (err, res) => {
      if (err) {
        this.displayError(err);
      } else {
        this.create(res.data.session);
      }
    });
  },

  logout: function() {
    apiUtils.logout((err, res) => {
      if (err) {
        //alert("Please try logging out again!");
        console.error(err);
        AppDispatcher.dispatch({
          actionType: SessionConstants.SESSION_DESTROY,
        });
      } else {
        AppDispatcher.dispatch({
          actionType: SessionConstants.SESSION_DESTROY,
        });
      }
    });
    // apiUtils.logout();

  },

  queryCookie: function() {
    AppDispatcher.dispatch({
      actionType: SessionConstants.COOKIE_GET
    });
  },

  impersonate: function(impersonateUid) {
    AppDispatcher.dispatch({
      actionType: SessionConstants.IMPERSONATE,
      impersonateUid: impersonateUid
    });
  }

};

module.exports = SessionActions;
