"use strict";

var LogManager = require('./LogManager.js'),
    TableConsts = require('../constants/TableConsts.js')
  ;

function getAdminUserNoteForUid(uid) {
  var strUid = String(uid);
  var key = {"uid": strUid};
  var tableName = TableConsts.AdminUserNotes;
  return new Promise((fulfill, reject)=>{
    var fetchParams = {
      "Key": key,
      "TableName": tableName
    };
    docClient.get(fetchParams, (error, doc)=>{
      if(error) {
        LogManager.logError(`Failed to get ${JSON.stringify(fetchParams)}`, error);
        return reject(error);
      }
      if(!doc || !doc.Item) {
        return fulfill();
      }
      fulfill(doc.Item);
    });
  });
}
module.exports.getAdminUserNoteForUid = getAdminUserNoteForUid;

function putAdminUserNoteInTable(doc) {
  var tableName = TableConsts.AdminUserNotes;
  return new Promise((fulfill, reject)=>{
    var params = {
      "Item": doc,
      "TableName": tableName
    };

    docClient.put(params, (error, data)=>{
      if(error) {
        var message = `Error saving document: ${JSON.stringify(params)}.`;
        LogManager.logError(message, error);
        return reject(error);
      } else {
        return fulfill(doc);
      }
    });
  });
}
module.exports.putAdminUserNoteInTable = putAdminUserNoteInTable;

// CreatedAt shows time in seconds: Math.round(new Date().getTime()/1000)
//{
//"uid": "12",
//  "blocks": [
//  {
//    "text": "San Antonio",
//    "createdAt": 1463670496
//  },
//  {
//    "text": "Mother"
//    "createdAt": 1463670523
//  }
//]
//}

function updateAdminUserNotesForUid(newDoc, uid) {
  var tableName = TableConsts.AdminUserNotes;
  return new Promise((fulfill, reject)=> {
    var defaultDoc = {
      "uid": uid,
      "blocks": []
    };
    getAdminUserNoteForUid(uid).then((oldDoc)=> {
      var origDoc = oldDoc || defaultDoc;
      origDoc.blocks.push(newDoc);
      var updatedDoc = origDoc;
      putAdminUserNoteInTable(updatedDoc).then((saveResult)=> {
        fulfill(saveResult);
      }).catch((error)=> {
        reject(error);
      });
    }).catch((error)=> {
      reject(error);
    });
  });
}

module.exports.updateAdminUserNotesForUid = updateAdminUserNotesForUid;
