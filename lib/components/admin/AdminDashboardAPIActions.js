/**
* Created by robby on 1/29/16.
*/



var AppDispatcher = require('../../dispatcher/AppDispatcher.js')
, SwellStreamConstants = require('../../constants/swell/SwellStreamConstants.js')
, SwellAdminConstants = require('../../components/admin/AdminDashboardConstants.js')
, TipCreatorConstants = require('../../constants/TipCreatorConstants.js')
;

var AdminDashboardActions = {
  //  TODO: REMOVE - THIS IS LIKELY ALL DEAD CODE
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
  finishScrapeLink: function() {
    AppDispatcher.dispatch({
      actionType: TipCreatorConstants.SCRAPE_LINK_FINISHED
    })
  },
  receiveAdminUserNote: function (adminUserNote) {
    AppDispatcher.dispatch({
      "actionType": SwellAdminConstants.RECEIVE_ADMIN_USER_NOTE,
      "adminUserNote": adminUserNote
    })
  }
};

module.exports = AdminDashboardActions;
