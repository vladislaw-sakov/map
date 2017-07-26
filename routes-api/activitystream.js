/**
 * Created by robby on 2/1/16.
 */

var UserActivityStreamManager = require('../lib/managers/UserActivityStreamManager.js')
, ActivityStream = require('../lib/models/ActivityStream_v2.js')
, AuthUtilities = require('../lib/utilities/AuthUtilities.js')
;

module.exports = function(app, express) {
  app.get('/:version/user/:uid/stream', (req, res)=>{
    var token = req.headers.authorization.split(' ')[1];
    var uid = req.user;
    var version = req.params.version;

    function returnStream(uid) {
      var options = {
        "version": version
      }
      // "FilterExpression": 'attribute_not_exists(deletedAt)'
      UserActivityStreamManager.getUserActivityStreamData(uid, options).then((activityStreamData)=>{
        res.success(activityStreamData);
        activityStream = null;
        result = null;
      }, (error)=>{
        console.log(error);
        res.fail(error);
      });
    }

    if( uid === req.params.uid ) {
      returnStream(uid);
    } else {
      AuthUtilities.isAdminToken(token).then((isAdmin)=>{
        if(isAdmin) {
          uid = req.params.uid;
        }
        returnStream(uid);
      }).catch((error)=>{
        returnStream(uid);
      });
    }

  });

  app.get('/:version/user/:uid/stream/:objectId', (req, res)=>{
    var uid = req.user;
    var token = req.token;
    var objectId = req.params.objectId;
    var version = req.params.version;

    function returnStreamObject(uid, objectId) {
      UserActivityStreamManager.getUserActivityObjectData( uid, objectId ).then((activityStreamObject)=>{
        res.success(activityStreamObject);
      }, (error)=>{
        console.log(error);
        res.fail(error);
      });
    }

    if ( uid === req.params.uid ) {
      returnStreamObject(uid, objectId);
    } else {
      AuthUtilities.isAdminToken(token).then((isAdmin)=>{
        if(isAdmin) {
          uid = req.params.uid;
        }
        returnStreamObject(uid, objectId);
      }).catch((error)=>{
        returnStreamObject(uid, objectId);
      });
    }
  });

  app.put('/:version/user/:uid/stream/:objectId', (req, res)=>{
    var uid = req.user;
    var data = req.body.streamObject;
    var objectId = req.params.objectId;
    data.uid = "" + uid;
    data.id = parseInt(objectId);
    UserActivityStreamManager.updateUserActivityStreamObject(data).then((updateResult)=>{
      res.success(updateResult);
    }).catch((error)=>{
      res.fail("Update_Error", ":(");
    });
  });

  app.post('/:version/user/:uid/stream', (req, res)=>{
    var uid = req.user;
    var data = req.body.streamObject;
    var token = req.headers.authorization.split(' ')[1];

    function addStreamObject(uid) {
      var streamObjectData = {
        "uid": uid,
        "type": "Create",
        "object": data
      };

      UserActivityStreamManager.createUserActivityStreamObject(streamObjectData).then((saveData)=>{
        res.success(saveData);
      }, (error)=>{
        res.fail(saveData);
      });
    }

    if( uid === req.params.uid ) {
      addStreamObject(uid);
    } else {
      AuthUtilities.isAdminToken(token).then((isAdmin)=>{
        if(isAdmin) {
          uid = req.params.uid;
        }
        addStreamObject(uid);
      }).catch((error)=>{
        addStreamObject(uid);
      });
    }
  });
};
