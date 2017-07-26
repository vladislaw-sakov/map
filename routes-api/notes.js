var NotesManager = require('../lib/managers/NotesManager.js')
, TableConsts = require('../lib/constants/TableConsts.js')
, AuthUtilities = require('../lib/utilities/AuthUtilities.js')
;

module.exports = function(app, express) {
  app.get('/:version/user/:uid/notes/:noteId', (req, res)=>{
    var token = req.headers.authorization.split(' ')[1];
    var uid = req.user;
    var noteId = req.params.noteId;

    function returnNote(uid) {
      var key = uid +':'+ noteId;
      NotesManager.getNoteWithKey(key).then((note)=>{
        res.success({"key":key,"note":note});
      }).catch((error)=>{
        res.fail("fetch_error", error.message);
      });
    }

    if( uid === req.params.uid ) {
      returnNote(uid);
    } else {
      AuthUtilities.isAdminToken(token).then((isAdmin)=>{
        if(isAdmin) {
          uid = req.params.uid;
        }
        returnNote(uid);
      }).catch((error)=>{
        returnNote(uid);
      });
    }
  });
  app.post('/:version/user/:uid/notes', (req, res)=>{
    var token = req.headers.authorization.split(' ')[1];
    var uid = req.user;
    var noteId = 1;

    function updateNote(uid) {
      var key = uid +':'+ noteId;
      var note = req.body.note;
      if(typeof note === 'string') {
        note = {
          "entityMap": {},
          "blocks": [{
              "key": "8podr",
              "text": note,
              "type": "unstyled",
              "depth": 0,
              "inlineStyleRanges": [],
              "entityRanges": []
          }]
        };
      }
      NotesManager.saveNoteWithKeyAndOptions(note, key, req.body).then((saveData)=>{
        res.success(note);
      }).catch((error)=>{
        res.fail("save_failed", error.message);
      });
    }
    if( uid === req.params.uid ) {
      updateNote(uid);
    } else {
      res.fail("save_failed", "Unable to save note.");
    }
  });
}
