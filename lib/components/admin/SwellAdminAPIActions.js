/**
* Created by robby on 1/29/16.
*/

var AppDispatcher = require('../../dispatcher/AppDispatcher.js')
, SwellStreamConstants = require('../../constants/swell/SwellStreamConstants.js')
, SwellAdminConstants = require('./AdminDashboardConstants.js')
, TipCreatorConstants = require('../../constants/TipCreatorConstants.js')
;

var SwellAdminAPIActions = {
  receiveUserData: function( userData ) {
    AppDispatcher.dispatch({
      "actionType": SwellAdminConstants.RECEIVE_USER_DATA,
      "userData": userData
    });
  },
  receiveTypeformResponseData: function( typeformResponseData ) {
    AppDispatcher.dispatch({
      "actionType": SwellAdminConstants.RECEIVE_TYPEFORM_RESPONSE_DATA,
      "typeformResponses": typeformResponseData
    });
  },
  receiveUserStream: function(streamData) {
    AppDispatcher.dispatch({
      actionType: SwellStreamConstants.RECEIVE_STREAM,
      streamData: streamData
    });
  },
  receivePreviewConent: function(content) {
    AppDispatcher.dispatch({
      actionType: TipCreatorConstants.RECEIVE_PREVIEW_CONTENT,
      content: content
    });
  },
  receiveAdminUserNotes: function(adminUserNotes) {
    AppDispatcher.dispatch({
      actionType: SwellAdminConstants.RECEIVE_ADMIN_USER_NOTES,
      "adminUserNotes": adminUserNotes
    });
  },
  finishScrapeLink: function() {
    AppDispatcher.dispatch({
      actionType: TipCreatorConstants.SCRAPE_LINK_FINISHED
    })
  }
};

module.exports = SwellAdminAPIActions;
