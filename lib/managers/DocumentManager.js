"use strict";

var LogManager = require('./LogManager.js')
  ;

function getDocumentWithKeyFromTable(key, tableName) {
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
module.exports.getDocumentWithKeyFromTable = getDocumentWithKeyFromTable;

function putDocumentInTable(doc, tableName) {
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
        // if(env.name === 'development') {
        //   process.exit();
        // }
      } else {
        return fulfill(doc);
      }
    });
  });
}
module.exports.putDocumentInTable = putDocumentInTable;

function updateDocumentWithKeyInTable(newDoc, key, tableName) {
  return new Promise((fulfill, reject)=>{
    var fetchParams = {
      "Key": key,
      "TableName": tableName
    };

    getDocumentWithKeyFromTable(key, tableName).then((origDoc)=>{
      origDoc = origDoc || {};
      var updatedDoc = Object.assign(origDoc, newDoc);
      // clean up values
      for(var key in updatedDoc) {
        // empty strings aren't allowed
        if(updatedDoc[key] === "") {
          delete updatedDoc[key];
        }
        // convert strings to booleans.
        if(updatedDoc[key] === "true") {
          updatedDoc[key] = true;
        }
        if(updatedDoc[key] === "false") {
          updatedDoc[key] = false;
        }
      }

      putDocumentInTable(updatedDoc, tableName).then((saveResult)=>{
        fulfill(saveResult);
      }).catch((error)=>{
        reject(error);
      });
    }).catch((error)=>{
      reject(error);
    });
  });
}
module.exports.updateDocumentWithKeyInTable = updateDocumentWithKeyInTable;
