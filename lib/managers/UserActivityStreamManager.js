var DocumentManager = require('./DocumentManager')
  , UserActivityStorageUtil = require('../utilities/UserActivityStorageUtil.js')
  , JobManager = require('./JobManager.js')
  , LogManager = require('./LogManager.js')
  , UserAlertsManager = require('./UserAlertsManager.js')
  , TableConsts = require('../constants/TableConsts.js')
  , async = require('async')
  , request = require('request-json')
  , zapierClient = request.createClient('https://zapier.com')
  , EmailConstants = require('../constants/email/EmailConstants.js')
  ;

function getUserActivityStreamData(uid, options) {
  return new Promise((fulfill, reject)=>{
    var params = {
        TableName : TableConsts.Tips,
        KeyConditions: {
          uid: {
            ComparisonOperator: 'EQ',
            AttributeValueList: [uid]
          }
        },

        ScanIndexForward: false
    };

    if(options && options.FilterExpression) {
      // FilterExpression: 'attribute_not_exists(deletedAt)',
      params.FilterExpression = options.FilterExpression;
    }

    //console.log(JSON.stringify(params));
    docClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            reject(err);
        } else {
            var streamData = {
              "createdAt": new Date().toISOString(),
              "totalItems": data.Items.length,
              "orderedItems": data.Items
            };
            fulfill(streamData);
        }
    });
  });
}
module.exports.getUserActivityStreamData = getUserActivityStreamData;

function getUserActivityObjectData( uid, objectId ) {
  var id = parseInt(objectId);
  return new Promise((fulfill, reject)=>{
    var params = {
        Key: {
            uid: uid,
            id: id
        },
        TableName: TableConsts.Tips
    };

    docClient.get(params, function(err, data){
        if (err) {
          LogManager.logError("Fetch failed for tip " + JSON.stringify(params), err);
          reject(err);
        } else {
          if(data.Item) {
            fulfill(data.Item);
          } else {
            fulfill(data);
          }
        }
    });
  });
}
module.exports.getUserActivityObjectData = getUserActivityObjectData;

function getNextActivityStreamIdForUser( uid ) {
  return new Promise((fulfill, reject) => {
    dynamodb.updateItem({
      TableName: TableConsts.TipCounts,
      Key: {
        "uid": {
          "S": ""+uid
        }
      },
      AttributeUpdates: {
        "activityCount": {
          "Action": "ADD",
          "Value": {
            "N": "1"
          }
        }
      },
      ReturnValues: "ALL_NEW"
    }, function (error, data) {
      if (error) {
        LogManager.logError(`getNextActivityStreamIdForUser failed for ${uid}`);
        reject(error);
      } else {
        console.log(`update result = ${JSON.stringify(data)}`);
        var newCount = parseInt(data.Attributes.activityCount.N);
        fulfill(newCount);
      }
    });
  });
}

/**
 * @param ActivityObject to use in the stream.
 */
function createUserActivityStreamObject(activityObject) {
  return new Promise((fulfill, reject)=>{
    if( !activityObject ) {
      var error = new Error("Missing activity object.");
      LogManager.logError( "UserActivityManager.updateUserActivityStreamObject failed.", error );
      return reject( error );
    }

    var uid = activityObject.uid;
    getNextActivityStreamIdForUser(uid).then((newId)=>{
      console.log(`newId: ${newId}`);
      activityObject.lastUpdate = null;
      activityObject.id = newId
      updateUserActivityStreamObject(activityObject).then((responseActivityObject)=>{
        fulfill(responseActivityObject);
      },(err)=>{
        reject(err);
      });
    }, (err)=>{
      reject(err);
    });
  });
}
module.exports.createUserActivityStreamObject = createUserActivityStreamObject;

function publishActivityStream(params, job, successCallback, failureCallback, completionCallback) {
  var activityStreamObject = params.streamObject;
  var options = params.options;
  createUserActivityStreamObject(activityStreamObject).then((saveData)=>{

    if (options.shouldSendTipCreateNotification == true) { 

      var emailOptions = {};
      emailOptions.substitutions = options.sendOptions.substitutions;
      emailOptions.substitutions["%tipId%"] = [saveData.id];

      emailOptions.templateId = EmailConstants.SINGLE_TIP_TEMPLATE_ID;
      emailOptions.subject = options.sendOptions.subject;
      emailOptions.categories = ["new_tips"];
      emailOptions.asmGroupID = 543;

      UserAlertsManager.sendEmailToUidsWithOptions(options.sendOptions.uids, emailOptions)
        .then((sendData)=> {
          if( successCallback ) {
            successCallback(job, "Added stream object.", completionCallback);
          }
        }).catch((error)=> {
          if( failureCallback ) {
            failureCallback(job, error, completionCallback);
          }
      });
    }
    else if( successCallback ) {
      successCallback(job, "Added stream object.", completionCallback);
    }
  }, (error)=>{
    if( failureCallback ) {
      failureCallback(job, error, completionCallback);
    }
  });
}
module.exports.publishActivityStream = publishActivityStream;

function updateUserActivityStreamObject( activityObject ) {
  return new Promise((fulfill, reject)=>{
    if(!activityObject) {
      var error = new Error("Missing activity object.");
      LogManager.logError( "UserActivityManager.updateUserActivityStreamObject failed.", error );
      return reject(error);
    }

    if(!activityObject.id) {
      var error = new Error("ActivityStreamObject is missing an ID");
      LogManager.logError("UserActivityManager.updateUserActivityStreamObject failed.", error);
      return reject(error);
    }

    getUserActivityObjectData(activityObject.uid, activityObject.id).then((objectData)=>{
      if(!objectData) {
        objectData = {};
      }

      activityObject = Object.assign(objectData, activityObject);

      activityObject.lastUpdate = Math.round(new Date().getTime()/1000);

      // An AttributeValue may not contain an empty string
      for(var key in activityObject) {
        if(activityObject[key] === "") {
          delete activityObject[key];
        }
      }

      var params = {
        Item: activityObject,
        TableName: TableConsts.Tips
      };

      docClient.put(params, (error, data)=>{
        if(error) {
          var message = "Error saving tip: " + JSON.stringify(params);
          LogManager.logError(message, error);
          return reject(error);
        } else {
          fulfill(activityObject);

          zapierClient.post('/hooks/catch/592021/u1wpm3/', activityObject, (err, res, body)=>{
            if(err) {
              console.log(err);
            }
            if(body) {
              console.log(body);
            }
          });
        }
      });

    }).catch((error)=>{
      return reject(error);
    });
  });
}
module.exports.updateUserActivityStreamObject = updateUserActivityStreamObject;

function copyStreamObjectWithSourceUidIdToTargetUid(sourceUid, sourceObjectId, targetUid, options) {
  return new Promise((fulfill, reject)=>{
    getUserActivityObjectData(sourceUid, sourceObjectId).then((objectData)=>{
      objectData.uid = targetUid;

      delete objectData.createdAt;
      delete objectData.lastUpdate;
      delete objectData.id;

      if(options && options.publishDate) {
        JobManager.createJob(options.publishDate, 'publishActivityStream', [objectData]);
        fulfill(objectData);
      } else {
        createUserActivityStreamObject(objectData).then((createData)=>{
          fulfill(createData);
          objectData = null;
        }).catch((error)=>{
          LogManager.logError("Failed to create stream object from uid: " + sourceUid + " objectId: " + sourceObjectId, error);
          reject(error);
          objectData = null;
        });
      }
    }).catch((error)=>{
      LogManager.logError("Failed to copy stream object from uid: " + sourceUid + " objectId: " + sourceObjectId, error);
      reject(error);
    });
  });
}
module.exports.copyStreamObjectWithSourceUidIdToTargetUid = copyStreamObjectWithSourceUidIdToTargetUid;
