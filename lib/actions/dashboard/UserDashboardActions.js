var SwellAPIUtils = require('../../api/swell/SwellAPIUtils.js')
, AppDispatcher = require('../../dispatcher/AppDispatcher.js')
, SwellStreamConstants = require('../../constants/swell/SwellStreamConstants.js')
;

var apiUtils = new SwellAPIUtils({
  baseUrl: API_URL
});


var UserDashboardActions = {
  fetchTokenWithType: function(tokenType) {
    apiUtils.fetchTokenWithType( tokenType );
  },
  fetchUserData: function() {
    apiUtils.fetchUserData();
  },
  fetchStream: function() {
    apiUtils.fetchUserStream();
    AppDispatcher.dispatch({
      actionType: SwellStreamConstants.LOADING_STARTED
    });
  },
  fetchFeaturedStreamObject: function(objectId) {
    apiUtils.fetchUserStreamObject( objectId );
  }
};

module.exports = UserDashboardActions;
