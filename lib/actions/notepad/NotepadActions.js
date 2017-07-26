import SwellAPIUtils from '../../api/swell/SwellAPIUtils.js';
import AppDispatcher from '../../dispatcher/AppDispatcher.js';
import NotesConstants from '../../constants/notes/NotesConstants.js';

var apiUtils = new SwellAPIUtils({
    baseUrl: API_URL
});

class NotepadActions {
  fetchNoteWithKey(noteKey) {
    apiUtils.fetchNoteWithKey(noteKey);
  }
  saveNote(noteKey, noteRaw, updatedBlocks={}) {
    AppDispatcher.dispatch({
      "actionType": NotesConstants.SAVE_NOTE,
      "key": noteKey,
      "note": noteRaw,
      "updatedBlocks": updatedBlocks
    });
    apiUtils.saveNote(noteKey, noteRaw, {"updatedBlocks":updatedBlocks});
  };
}

module.exports = NotepadActions;
