/**
* Created by robby on 3/31/15.
*/

var DataManager = require('../lib/managers/DataManager')
, CommonUserManager = require('../lib/managers/UserManager')
, UserPasswordManager = require('../lib/managers/UserPasswordManager')
, moment = require('moment')
, validator = require('validator')
, TableConsts = require('../lib/constants/TableConsts.js')
, async = require('async')
, WunderlistManager = require('../lib/managers/WunderlistManager')
, UserActivityStreamManager = require('../lib/managers/UserActivityStreamManager.js')
;

var AdminRoutes = function( app, express ) {
  app.get("/wunderlistuserprofileupdate", function( req, res ) {
    DataManager.scan(TableConsts.UserWunderlist, "ALL_ATTRIBUTES", {}, null, function( err, scanResults ) {
      if( !scanResults || !scanResults.Items ) {
        return res.json( {"message": "No wunderlist users available."} );
      }

      var userObjects = scanResults.Items;
      var users = [];
      async.each(userObjects, function( userObjectRaw, iteratorCallback ) {
        var userObject = {};

        if( userObjectRaw.value && userObjectRaw.value.S ) {
          try {
            userObject = JSON.parse( userObjectRaw.value.S );
          } catch( e ) {
            console.log( e );
            return iteratorCallback();
          }
        }
        var uid = userObjectRaw.key.S;
        WunderlistManager.updateWunderlistUser( uid, userObject, function( err, userProfile ) {
          userObject.profile = userProfile;
          users.push(userObject);
          iteratorCallback();
        });
      }, function(err) {
        res.json(users);
      });
    });
  });

  app.get('/wunderlistuser/reset/:uid', function( req, res ) {
    var uid = req.params.uid;
    DataManager.getItemWithKeyInTable( uid, TableConsts.UserWunderlist, function( err, wunderlistUserRaw ) {
      var wunderlistUser = {};
      try {
        wunderlistUser = JSON.parse( wunderlistUserRaw );
      } catch( e ) {

      }

      var wunderlistId = wunderlistUser.id;
      var wunderlistKey = 'wunderlist_'+wunderlistId;
      var wunderlistEmail;
      if( wunderlistUser.email ) {
        wunderlistEmail = wunderlistUser.email;
      }

      DataManager.deleteItem( TableConsts.UserId, wunderlistKey );

      if( wunderlistEmail ) {
        DataManager.deleteItem( TableConsts.UserId, wunderlistEmail );
      }

      DataManager.deleteItem( TableConsts.UserWunderlist, uid );

      res.json( err || wunderlistUser );
    });
  });

  app.post("/resetwunderlist", function( req, res ) {
    function doReset(uid) {
      WunderlistManager.resetWunderlistUserByUid( uid, function( err, result ) {
        if( err ) {
          res.json(err);
        } else {
          res.json(result);
        }
      });
    }
    var uid = req.body.uid;
    if( uid ) {
      doReset(uid);
    } else {
      var email = req.body.email;
      DataManager.getItemWithKeyInTable( email, TableConsts.UserId, (err, aUid)=>{
        if( aUid ) {
          doReset(aUid);
        }
      });
    }
  });

  app.get("/migrate/tips/user/:uid", (req, res)=>{
    var uid = req.params.uid;
    UserActivityStreamManager.migrateTipsForUser(uid, (err, data)=>{
      if(err) return console.log(err);
      else console.log(data);
    });
    res.json({"message": "Migration started."});
  });
};

module.exports = AdminRoutes;
