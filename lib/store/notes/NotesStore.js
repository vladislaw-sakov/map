var AppDispatcher = require('../../dispatcher/AppDispatcher')
  , SwellUserStore = require('../swell/SwellUserStore.js')
  , EventEmitter = require('events').EventEmitter
  , NotesConstants = require('../../constants/notes/NotesConstants.js')
  ;

var CHANGE_EVENT = 'change';

var _notes = [];
var _notesLocal = [];
var localNotesRaw = localStorage.getItem("notes:"+SwellUserStore.getUid()+":1");
if( localNotesRaw ) {
  var localNotes;
  try {
    localNotes = JSON.parse(localNotesRaw);
  } catch(e) {}
  if(localNotes) {
    _notesLocal = localNotes;
  }
}

var NotesStore = Object.assign({}, EventEmitter.prototype, {
  getNoteWithKey: function(noteKey, useLocal) {
    var result = null;
    if(useLocal && _notesLocal && _notesLocal.length) {
      result = _notesLocal[0];
    }
    if(_notes && _notes.length) {
      // there's only one note;
      result = _notes[0];
    }
    return result;
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
    case NotesConstants.RECEIVE_NOTE:
      // There's only one note right now
      _notes = [action.note];
      try {
        localStorage.setItem("notes:"+SwellUserStore.getUid()+":1", JSON.stringify(_notes));
      } catch(e) {
        console.log(e);
      }

      NotesStore.emitChange();
      break;
    case NotesConstants.SAVE_NOTE:
      // There's only one note right now
      _notes = [action.note];
      try {
        localStorage.setItem("notes", JSON.stringify(_notes));
      } catch(e) {
        console.log(e);
      }

      break;
  }
});

module.exports = NotesStore;
