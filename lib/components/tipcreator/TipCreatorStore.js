var AppDispatcher = require('../../dispatcher/AppDispatcher')
, EventEmitter = require('events').EventEmitter
, SwellStreamConstants = require('../../constants/swell/SwellStreamConstants.js')
, TipCreatorConstants = require('../../constants/TipCreatorConstants.js')
;

var CHANGE_EVENT = 'change';
var _currentStreamObject; // selected from stream
var _previewStreamObject; // preview from tip creator form
var _previewContent;
var _isScraping = false;
var _currentTipCreatorFormType = "";

function receiveCurrentStreamObject(streamObject) {
  _currentStreamObject = streamObject;
  _previewStreamObject = streamObject;
  _previewContent = streamObject;
  _currentTipCreatorFormType = streamObject.type;
}

function receivePreviewStreamObject(streamObject) {
  _previewStreamObject = streamObject;
  _previewContent = streamObject;
  _currentTipCreatorFormType = streamObject.type;
}

var TipCreatorStore = Object.assign({}, EventEmitter.prototype, {
  getCurrentMode: function() {
    var mode = TipCreatorConstants.MODE_CREATE;
    if(_currentStreamObject || _previewStreamObject) {
      mode = TipCreatorConstants.MODE_EDIT;
    }
    return mode;
  },
  getCurrentTipCreatorFormType: function() {
    return _currentTipCreatorFormType;
  },
  getPreviewStreamObject: function() {
    return _previewStreamObject;
  },
  getPreviewContent: function() {
    return _previewContent;
  },
  getIsScraping: function() {
    return _isScraping;
  },
  getCurrentStreamObject: function() {
    return _currentStreamObject;
  },
  getCurrentStreamObjectContentType: function() {
    if( _currentStreamObject ) {
      return _currentStreamObject.type;
    }
    return null;
  },
  getPreviewStreamObjectContentType: function() {
    if( _previewStreamObject ) {
      return _previewStreamObject.type;
    }
    return null;
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
    case SwellStreamConstants.CREATE_STREAM_OBJECT:
    case SwellStreamConstants.UPDATE_STREAM_OBJECT:
    case SwellStreamConstants.SELECT_STREAM_OBJECT:
      receiveCurrentStreamObject(action.streamObject);
      TipCreatorStore.emitChange();
      break;
    case SwellStreamConstants.PREVIEW_STREAM_OBJECT:
      receivePreviewStreamObject(action.streamObject);
      TipCreatorStore.emitChange();
      break;
    case SwellStreamConstants.DELETE_STREAM_OBJECT:
    case SwellStreamConstants.CLEAR_STREAM_OBJECT_SELECTION:
      _currentStreamObject = null;
      _previewStreamObject = null;
      _previewContent = null;
      _currentTipCreatorFormType = "";
      TipCreatorStore.emitChange();
      break;
    case TipCreatorConstants.SET_CREATOR_FORM_TYPE:
      _currentTipCreatorFormType = action.formType;
      TipCreatorStore.emitChange();
      break;
    case TipCreatorConstants.SCRAPE_LINK_STARTED:
      _isScraping = true;
      TipCreatorStore.emitChange();
      break;
    case TipCreatorConstants.SCRAPE_LINK_FINISHED:
      _isScraping = false;
      TipCreatorStore.emitChange();
      break;
    case TipCreatorConstants.RECEIVE_PREVIEW_CONTENT:
      _previewContent = action.content;
      _isScraping = false;
      TipCreatorStore.emitChange();
      break;
  }
});

module.exports = TipCreatorStore;
