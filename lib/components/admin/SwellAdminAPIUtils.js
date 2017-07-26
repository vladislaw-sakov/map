/**
* Created by robby on 1/29/16.
*/

var SimpleRequest = require('../../utilities/SimpleRequest.js')
, SwellAdminAPIActions = require('./SwellAdminAPIActions.js')
, EmailConstants = require('../../constants/email/EmailConstants.js')
;

var _request = new SimpleRequest();

class SwellAdminAPIUtils {
  fetchUserData() {
    var url = '/user/' + UID;
    _request.get(url, {}, (err,res)=>{
      SwellAdminAPIActions.receiveUserData(res);
    });
  }
  fetchTypeformData() {
    var url = '/user/' + UID + '/typeformresponses';
    _request.get(url, {}, (err,res)=>{
      SwellAdminAPIActions.receiveTypeformResponseData(res);
    });
  }
  fetchUserStream() {
    var url = '/v2/user/' + UID + '/stream';
    _request.get(url, {}, (err, res)=>{
      if( err ) {
        alert("Failed to fetch stream.");
        console.log(err);
        return;
      }
      if( !res.data ) {
        console.log("No stream data.", res);
        return;
      }
      SwellAdminAPIActions.receiveUserStream(res.data);
    });
  }
  createStreamObject(streamObject, options) {
    return new Promise((fulfill, reject) =>{
      var url = '/v1/user/'+UID+'/stream';
      var params = {
        streamObject: streamObject,
        options: options
      }
      _request.post(url, params, (err, res)=>{
        if (err) {
          reject(err);
        } else {
          fulfill(res);
        }
      });
    });
  }
  copyStreamObjectWithSourceUidIdToTargetUids(sourceUid, sourceObjectId, targetUids, options) {
    var url = '/v1/streamobject/copy';
    var params = {
      sourceUid: sourceUid,
      sourceObjectId: sourceObjectId,
      targetUids: targetUids,
      options: options
    }
    _request.post(url, params, (err, res)=>{
      if(err) {
        window.alert(err.message);
        console.error(err);
      } else {
        // TODO: make this update the ui.
        window.alert("Tips copied succesfully");
      }
    })
  }
  updateStreamObject(streamObject) {
    var url = '/v1/user/'+UID+'/stream/'+streamObject.id;
    return new Promise((fulfill, reject) => {
      _request.put(url, streamObject, (err, res)=>{
        if (err) {
          reject(err);
        } else {
          fulfill(res);
        }
      });
    });
  }
  deleteStreamObject(streamObject) {
    var url = '/v1/user/'+UID+'/stream/'+streamObject.id;
    _request.delete(url, streamObject, (err, res)=>{

    });
  }
  sendTipCreateNotification(options) {
    var url = '/v1/notifications/send';
    var params = {
      "uids": options.uids,
      "templateId": EmailConstants.SINGLE_TIP_TEMPLATE_ID,
    }
    params = Object.assign(params, options);
    _request.post(url, params, (err, res)=>{
      if( err ) {
        alert( err.message );
      } else {
        alert( "email sent");
      }
    });
  }
  // add the subject and notes here? or another object?
  sendTipDigest(digestObject) {
    var url = '/v1/notifications/digest/send';
    var params = {
      "subject": digestObject.subject,
      "intro": digestObject.intro,
      "uids": digestObject.uids,
      "ids": digestObject.ids,
      "templateId": EmailConstants.TIP_DIGEST_TEMPLATE_ID,
    }
    _request.post(url, params, (err, res)=>{
      if( err ) {
        alert( err.message );
      } else {
        alert( "Digest email sent");
      }
    });
  }
  sendSingleTipNotification(options) {
    var url = '/v1/notifications/send';
    var params = {
      "uids": options.uids,
      "templateId": EmailConstants.SINGLE_TIP_TEMPLATE_ID,
    }
    params = Object.assign(params, options);
    _request.post(url, params, (err, res)=>{
      if( err ) {
        alert( err.message );
      } else {
        alert( "email sent" );
      }
    });
  }
  scrapeLink(link) {
    var url = '/scraper/link/content';
    var queryVars = {
      "url": link
    };
    _request.get(url, queryVars, (err, res)=>{
      if( err ) {
        return alert(err.message);
      }
      SwellAdminAPIActions.receivePreviewConent(res.data);
    });
  }
  fetchAdminUserNotes(uid) {
    var url = '/user/' + uid + '/notes';
    var queryVars = {
      "uid": uid
    };
    _request.get(url, queryVars, (err, res)=>{
      if (err) {
        alert(err.message);
      } else {
        SwellAdminAPIActions.receiveAdminUserNotes(res.data);
      }
    });
  }
  updateAdminUserNotes(uid, note){
    var url = '/user/' + uid + '/notes';
    var params = {
      "note": note
    };
    _request.post(url, params, (err, res)=>{
      if (err) {
        alert(err.message);
      } else {
        alert("Note Saved");
      }
    });
  }
}

module.exports = SwellAdminAPIUtils;
