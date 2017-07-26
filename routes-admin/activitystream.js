/**
* Created by robby on 1/29/16.
*/

'use strict';

var UserActivityStreamManager = require('../lib/managers/UserActivityStreamManager.js')
, ActivityStream = require('../lib/models/ActivityStream_v2.js')
, _ = require('underscore')
, JobManager = require('../lib/managers/JobManager.js')
;


module.exports = function(app) {
  app.get('/:version/user/:uid/stream', (req, res)=>{
    var uid = req.params.uid;
    var version = req.params.version;
    var options = {
      "version": version
    }
    UserActivityStreamManager.getUserActivityStreamData(uid, options).then((activityStreamData)=>{
      var result = {};
      var activityStream;
      if(version === "v1") {
        activityStream = new ActivityStream(activityStreamData);
        result = activityStream.JSON;
      } else {
        result = activityStreamData;
      }
      res.success(result);
      activityStream = null;
      result = null;
    }, (error)=>{
      console.log(error);
      res.fail(error);
    });
  });

  app.post('/:version/user/:uid/stream', (req,res)=>{
    var activityStreamObject = req.body.streamObject;
    var options = req.body.options;

    if(activityStreamObject.publishDate) {
      JobManager.createJob(activityStreamObject.publishDate, 'publishActivityStream', [req.body]);
      res.success(null);
    } else {
      UserActivityStreamManager.createUserActivityStreamObject(activityStreamObject).then((saveData)=>{
        res.success(saveData);
      }, (error)=>{
        res.fail(saveData);
      });
    }
  });

  app.put('/:version/user/:uid/stream/:objectId', (req,res)=>{
    var activityStreamObject = req.body;
    UserActivityStreamManager.updateUserActivityStreamObject(activityStreamObject).then((saveData)=>{
      res.success(saveData);
    }, (error)=>{
      res.fail(error);
    });
  });

  app.delete('/:version/user/:uid/stream/:objectId', (req,res)=>{
    var activityStreamObject = req.body;
    activityStreamObject.deletedAt = Math.round(_.now() / 1000);
    UserActivityStreamManager.updateUserActivityStreamObject(activityStreamObject).then((saveData)=>{
      res.success(saveData);
    }, (error)=>{});
  });

  app.post('/:version/streamobject/copy', (req, res)=>{
    var sourceUid = req.body.sourceUid;
    var sourceObjectId = req.body.sourceObjectId;
    var targetUidsRaw = req.body.targetUids;
    var options = req.body.options;
    if( !sourceUid || !sourceObjectId || !targetUidsRaw ) {
      return res.send(500, "Missing Parameter");
    }

    var targetUids = targetUidsRaw.split(',');
    for( let targetUidRaw of targetUids ) {
      var targetUid = targetUidRaw.trim();
      if( targetUid ) {
        UserActivityStreamManager.copyStreamObjectWithSourceUidIdToTargetUid(sourceUid, sourceObjectId, targetUid, options).then(copyResponse=>{
          res.success(copyResponse);
        }).catch(error=>{
          res.fail("Failed to copy.", error);
        });
      }
    }
  });
};
