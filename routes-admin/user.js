var UserPasswordManager = require('../lib/managers/UserPasswordManager')
  , DataManager = require('../lib/managers/DataManager')
  , UserManager = require('../lib/managers/UserManager')
  , TableConsts = require('../lib/constants/TableConsts.js')
  , DocumentManager = require('../lib/managers/DocumentManager.js')
  , AdminUserNotesManager = require('../lib/managers/AdminUserNotesManager.js')
  ;

function ensureAdmin(req, res, next) {
  UserPasswordManager.checkUserRole(req.user, function (err, role) {
    if ('admin' == role) {
      next();
    } else {
      res.json({"message": "Your role is: " + role + ". Please contact an administrator."});
    }
  });
}
module.exports = function (app, express) {
  app.get('/user/:uid', function (req, res) {
    var uid = req.params.uid;
    UserManager.getUser(uid, false, function (err, userObj) {
      if (err) {
        return res.json(err);
      }
      return res.json(userObj);
    });
  });

  app.get('/user/:uid/dashboard', ensureAdmin, function (req, res) {
    var uid = req.params.uid;
    res.render('admin-user', {uid: uid});
  });

  app.get('/user/:uid/locations', function (req, res) {
    var uid = req.params.uid;
    DataManager.getItemWithKeyInTableNoCache(uid, TableConsts.UserLocations, function (err, rawLocations) {
      if (!rawLocations) {
        rawLocations = "[]";
      }
      res.render('admin-user-locations', {rawLocations: rawLocations});
    });
  });

  app.get('/user/:uid/notes', function (req, res) {
    var uid = req.params.uid;
    AdminUserNotesManager.getAdminUserNoteForUid(uid).then((noteData)=>{
      res.success(noteData);
    }).catch((error)=>{
      res.fail(error.message);
    });
  });

  app.post('/user/:uid/notes', function (req, res) {
    var uid = String(req.params.uid);
    var newNote = String(req.body.note);
    var creationTime = Math.round(new Date().getTime()/1000);
    var newDoc = {
      "text": newNote,
      "createdAt": creationTime
    };
    AdminUserNotesManager.updateAdminUserNotesForUid(newDoc, uid).then((updatedNote)=>{
        res.success(updatedNote);
      }).catch((error)=>{
        res.fail(error.message);
      });
    });

  app.get('/user/:uid/feeddashboard', ensureAdmin, function (req, res) {
    var uid = req.params.uid;

    DataManager.getItemWithKeyInTable(uid, TableConsts.UserWunderlist, function (err, userWunderlistString) {
      if (userWunderlistString) {
        try {
          var userWunderlist = JSON.parse(userWunderlistString);
        } catch (e) {
          return res.json({"message": "Problem parsing: " + userWunderlistString});
        }

        if (!userWunderlist) {
          return res.json({"message": "No wunderlist user object for user."});
        }
        var token = userWunderlist.access_token;
        var pageParams = {
          wunderlistAccessToken: token,
          wunderlistClientId: env.current.wunderlist.client_id,
          uid: uid,
          apiUrl: env.current.admin_url,
          vanityUrl: env.current.vanity_url
        };
        res.render('admin-swellist-tipcreator', pageParams);
      } else {
        var pageParams = {
          "wunderlistAccessToken": "",
          "wunderlistClientId": "",
          "apiUrl": env.current.admin_url,
          "vanityUrl": env.current.vanity_url,
          "uid": uid
        };
        res.render('admin-swellist-tipcreator', pageParams);
      }
    });
  });
};
