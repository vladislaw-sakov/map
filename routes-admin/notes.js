var DataManager = require('../lib/managers/DataManager.js')
, TableConsts = require('../lib/constants/TableConsts.js')
;

module.exports = function(app, express) {
  app.get('/:version/user/:uid/notes/:noteId', (req, res)=>{
    var uid = req.params.uid;
    var noteId = req.params.noteId;
    var key = uid +':'+ noteId;

    DataManager.getItemWithKeyInTable(key, TableConsts.Notes, (error, noteRaw)=>{
      if(error) return res.fail("fetch_error", error.message);
      var note;
      try{
        note = JSON.parse(noteRaw);
      } catch(e) {
        return res.fail("parse_error", e.message);
      }
      res.success({"key":key,"note":note});
    });
  });
  app.post('/:version/user/:uid/notes', (req, res)=>{
    return res.send(200);
    // we don't want to save on the admin side just yet.
    var uid = req.params.uid;
    var noteId = 1;
    var key = uid +':'+ noteId;
    var note = req.body.note;
    if( typeof note === 'object' ) {
      note = JSON.stringify(note);
    }
    DataManager.putValueForKeyInTable(note, key, TableConsts.Notes, (error, saveData)=>{
      if(error) return res.fail("save_failed", error.message);
      res.success(note);
    });
  });
}
