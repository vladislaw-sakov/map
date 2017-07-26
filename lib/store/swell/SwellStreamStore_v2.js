var AppDispatcher = require('../../dispatcher/AppDispatcher')
  , EventEmitter = require('events').EventEmitter
  , SwellStreamConstants = require('../../constants/swell/SwellStreamConstants.js')
  , ActivityStream = require('../../models/ActivityStream_v2.js')
  ;

var CHANGE_EVENT = 'change';

var _activityStream;
var _featuredStreamObject = null;
var _isLoading = false;

var SwellStreamStore = Object.assign({}, EventEmitter.prototype, {
  isLoading: function() {
    return _isLoading;
  },
  getStreamObjects: function () {
    if (_activityStream) {
      return _activityStream.streamObjects;
    }
    return [];
  },

  getFeaturedStreamObject: function() {
    return _featuredStreamObject;
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

function updateStreamObject(streamObject) {
  for (var i = 0; i < _activityStream.length; i++) {
    var curStreamObject = _activityStream[i];
    if (curStreamObject.id == streamObject.id && curStreamObject.uid == streamObject.uid) {
      curStreamObject.attributes = streamObject.attributes;
    }
  }
}

function updateStreamObjectRating(rating, uid, id) {
  for (var i = 0; i < _activityStream.streamObjects.length; i++) {
    var aStreamObject = _activityStream.streamObjects[i];
    if (aStreamObject.id == id && aStreamObject.uid == uid) {
        aStreamObject.rating = rating;
    }
  }
}

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case SwellStreamConstants.RECEIVE_STREAM:
      _activityStream = new ActivityStream(action.streamData);
      SwellStreamStore.emitChange();
      break;
    case SwellStreamConstants.RECEIVE_FEATURED_STREAM_OBJECT:
      _featuredStreamObject = action.streamObject;
      SwellStreamStore.emitChange();
      break;
    case SwellStreamConstants.UPDATE_STREAM_OBJECT:
      updateStreamObject(action.streamObject);
      SwellStreamStore.emitChange();
      break;
    case SwellStreamConstants.CREATE_STREAM_OBJECT:
      _activityStream.addNewStreamObject(action.streamObject);
      SwellStreamStore.emitChange();
      break;
    case SwellStreamConstants.DELETE_STREAM_OBJECT:
      _activityStream.removeStreamObject(action.streamObject);
      SwellStreamStore.emitChange();
      break;
    case SwellStreamConstants.SET_TIP_RATING:
      updateStreamObjectRating(action.rating, action.uid, action.id);
      SwellStreamStore.emitChange();
      break;
    case SwellStreamConstants.LOADING_STARTED:
      _isLoading = true;
      SwellStreamStore.emitChange();
      break;
    case SwellStreamConstants.LOADING_FINISHED:
      _isLoading = false;
      SwellStreamStore.emitChange();
      break;
  }
});

module.exports = SwellStreamStore;
