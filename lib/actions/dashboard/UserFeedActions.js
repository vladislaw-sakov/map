/**
 * Created by liztron on 3/15/16.
 */
'use strict';

var AppDispatcher = require('../../dispatcher/AppDispatcher');
var SwellStreamConstants = require('../../constants/swell/SwellStreamConstants');
var SwellAPIUtils = require('../../api/swell/SwellAPIUtils.js');

var apiUtils = new SwellAPIUtils({
  baseUrl: API_URL
});

var UserFeedActions = {
  setTipRating: function setTipRating(tipRating, tipUid, tipId) {
    AppDispatcher.dispatch({
      actionType: SwellStreamConstants.SET_TIP_RATING,
      rating: tipRating,
      uid: tipUid,
      id: tipId
    });
    apiUtils.updateUserStreamObjectRating(tipUid, tipId, tipRating);
  },
  setTipComment: function setTipComment(tipComment, tipUid, tipId) {
    AppDispatcher.dispatch({
      actionType: SwellStreamConstants.SET_TIP_COMMENT,
      comment: tipComment,
      uid: tipUid,
      id: tipId
    });
    apiUtils.updateUserStreamObjectComment(tipUid, tipId, tipComment);
  }
};

module.exports = UserFeedActions;
