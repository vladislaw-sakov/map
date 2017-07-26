var DataManager = require('../lib/managers/DataManager.js')
, DocumentManager = require('../lib/managers/DocumentManager.js')
, RequestUtilities = require('../lib/utilities/RequestUtilities.js')
, UserManager = require('../lib/managers/UserManager.js')
, TableConsts = require('../lib/constants/TableConsts.js')
, ErrorConsts = require('../lib/store/ErrorConsts.js')
;

module.exports = function( app, express ) {
  app.get( '/:version/user/:uid', (req, res)=>{
    var version = req.params.version ? req.params.version : 0;
    var uid = RequestUtilities.getUidFromReq(req);
    if( uid ) {
      UserManager.getUser( uid, false, function( err, userData ) {
        if( err ) {
          return res.fail( ErrorConsts.SystemError, err.message );
        }

        return res.success(userData);
      });
    } else {
      return res.fail(ErrorConsts.Unauthorized, "Please log in.");
    }
  });


  function setProfile( req, res ) {
    var uid = RequestUtilities.getUidFromReq(req);
    if( uid ) {
      var data = {};

      var gender = req.body.gender;
      if (gender) {
        data["gender"] = gender;
      }

      var location_name = req.body.location_name;
      if (location_name) {
        data["location_name"] = location_name;
      }

      var birthday = req.body.birthday;
      if (birthday) {
        data["birthday"] = birthday;
      }

      var timezone = req.body.timezone;
      if( timezone ) {
        data["timezone"] = timezone;
      }

      var name = req.body.name;
      if( name ) {
        data["name"] = name;
      }

      UserManager.updateUserProfile( uid, data);
      res.success(data);
    } else {
      res.fail(ErrorConsts.Unauthorized, "Please Log In.");
    }
  }
  app.put( '/:version/user/:uid/profile', setProfile );
  app.post( '/:version/user/:uid/profile', setProfile );

  function setPhone( req, res ) {
    var uid = RequestUtilities.getUidFromReq(req);
    if( uid ) {

      UserManager.updatePhone( uid, req.body.phone, (error, updateResult)=>{
        if(error) {
          return res.fail(ErrorConsts.SystemError, `Error updating phone number. ${error.message}`);
        }
        res.success({phone: req.body.phone});
      });
    } else {
      res.fail(ErrorConsts.Unauthorized, "Please Log In.");
    }
  }

  function setEmail( req, res ) {
    var uid = RequestUtilities.getUidFromReq(req);
    if( uid ) {

      UserManager.updateEmail( uid, req.body.email);
      res.success({email: req.body.email});

    } else {
      res.fail(ErrorConsts.Unauthorized, "Please Log In.");
    }
  }

  app.put( '/:version/user/:uid/phone', setPhone );
  app.put( '/:version/user/:uid/email', setEmail );

  app.post( '/:version/user/:uid/preferences', (req, res)=>{
    var uid = req.params.uid;
    var preferences = req.body;
    if(!preferences) {
      return res.fail(ErrorConsts.MissingParameters, "Missing body.");
    }
    preferences.uid = uid;
    DocumentManager.updateDocumentWithKeyInTable(preferences, {"uid": uid}, TableConsts.UserPreferences).then((updatedPrefs)=>{
      res.success(updatedPrefs);
    }).catch((error)=>{
      res.fail(ErrorConsts.SystemError, error.message);
    });
  });
}
