"use strict";

var DataManager = require('./DataManager.js')
, DocumentManager = require('./DocumentManager.js')
, TableConsts = require('../constants/TableConsts.js')
, UserAlertsManager = require('./UserAlertsManager.js')
, LogManager = require('./LogManager.js')
, JobManager = require('./JobManager.js');
;

var NotesManager = {
  prependTextToNoteWithKey: function(text, noteKey) {
    return new Promise((fulfill, reject)=>{
      this.getNoteWithKey(noteKey).then((note)=>{
        let blockKey = Math.floor(Math.random() * Math.pow(2, 24)).toString(32);
        var newBlock = {
          "key": blockKey,
          "text": text,
          "type": "unstyled",
          "depth": 0,
          "inlineStyleRanges": [],
          "entityRanges": []
        }
        if(!note) {
          note = {
            "entityMap": {}
          };
        }
        if(note.blocks && note.blocks.length) {
          note.blocks.unshift(newBlock);
        } else {
          note.blocks = [newBlock];
        }
        this.saveNoteWithKey(note, noteKey).then((saveResult)=>{
          fulfill(saveResult);
        }).catch((error)=>{
          reject(error);
        });
      }).catch((error)=>{
        reject(error);
      });
    });
  },

  getNoteWithKey: function(key) {
    return new Promise((fulfill, reject)=>{
      DataManager.getItemWithKeyInTable(key, TableConsts.Notes, (error, noteRaw)=>{
        if(error) {
          LogManager.logError(`Failed to fetch note with key ${key}`, error);
          return reject(error);
        }
        var note;
        try{
          note = JSON.parse(noteRaw);
        } catch(e) {
          return reject(e);
        }
        fulfill(note);
      });
    });
  },

  saveNoteWithKeyAndOptions: function(note, key, options) {
    return new Promise((fulfill, reject)=>{
      if(options.updatedBlocks) {
        let now = Math.round(new Date().getTime()/1000);
        let updatedBlocks = options.updatedBlocks;
        let noteBlocks = note.blocks;
        for(var updatedBlockKey in updatedBlocks) {
          for(let noteBlock of noteBlocks) {
            if(noteBlock.key === updatedBlockKey) {
              noteBlock.lastUpdate = updatedBlocks[updatedBlockKey];
              break;
            }
          }
        }
      }

      this.saveNoteWithKey(note, key).then((saveResult)=>{
        fulfill(saveResult);
      }).catch((error)=>{
        reject(error);
      });
    });
  },

  saveNoteWithKey: function(note, key) {
    return new Promise((fulfill, reject)=>{
      if( typeof note === 'object' ) {
        note = JSON.stringify(note);
      }
      DataManager.putValueForKeyInTable(note, key, TableConsts.Notes, (error, saveData)=>{
        if(error) {
          LogManager.logError(`Failed to save note: ${JSON.stringify(note)} with key: ${key}`, error);
          return reject(error);
        }
        return fulfill(saveData);
      });

      let uid = this.getUidFromKey(key);
      let now = Math.round(new Date().getTime()/1000);

      let userTimestampsUpdate = {"uid": uid};
      userTimestampsUpdate[`noteSave_1:1`] = now;
      DocumentManager.updateDocumentWithKeyInTable(userTimestampsUpdate, {"uid":uid}, TableConsts.UserTimestamps).then((updateResult)=>{
      }).catch((error)=>{
        LogManager.logError(`Failed updating save note timestamp. ${error.message}`);
      });

      DocumentManager.getDocumentWithKeyFromTable({"uid":uid}, TableConsts.UserPreferences).then((userPrefs)=>{
        if(!userPrefs || !userPrefs.noteUpdateEmail) {
          return;
        }
        let targetSendTime = now + 60*10;
        if(env.name == 'development') {
          targetSendTime = now + 60*1;
        }
        JobManager.createJob(targetSendTime, 'runNoteEmailJob', [key]);

      });
    });
  },

  copyNote: function(originalKey, targetKey) {
    return new Promise((fulfill, reject)=>{
      DataManager.copyItem(originalKey, targetKey, TableConsts.Notes, (error, saveData)=>{
        if(error) return reject(error);
        return fulfill(saveData);
      });
    });
  },

  sendNoteEmail: function(noteKey) {
    return new Promise((fulfill, reject)=>{
      this.getNoteWithKey(noteKey).then((note)=>{
        var noteParsed = note;
        if(typeof note === 'string') {
          try {
            noteParsed = JSON.parse(note);
          } catch(e) {
            LogManager.logError(`Problem parsing ${note}`, e);
          }
        }
        if(!noteParsed.blocks || noteParsed.blocks.length <1) {
          return reject(new Error("Invalid note."));
        }
        var noteText = "";
        var htmlText = "";
        var blocks = noteParsed.blocks;
        for(let block of blocks) {
          if(noteText !== "") {
            noteText = `${noteText}\n\n`;
          }
          let blockText = block.text;
          noteText = `${noteText}${blockText}`;
          htmlText = `${htmlText}<p>${blockText}</p>`
        }

        htmlText += "<br /><a href='" + env.current.base_url + "/dashboard#/notepad' target='_blank'>Go to Notepad</a><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />";
        var options = {
          "subject": 'Your Notes',
          "text": noteText,
          "html": htmlText,
          "categories": ["own_notes"],
          "asmGroupID": 549
        };
        let uid = this.getUidFromKey(noteKey);
        UserAlertsManager.sendEmailToUidsWithOptions([uid], options).then((sendResult)=>{
          fulfill(sendResult);
          console.log(`Note send succeeded ${JSON.stringify(sendResult)}`);
        }).catch((error)=>{
          LogManager.logError(`Note send failed ${JSON.stringify(error)}`, error);
          reject(error);
        });
      }).catch((error)=>{
        LogManager.logError(`note send failed ${JSON.stringify(error)}`, error);
        reject(error);
      });
    });
  },

  runNoteEmailJob: function(noteKey, job, successCallback, failureCallback, completionCallback) {
    let uid = this.getUidFromKey(noteKey);
    DocumentManager.getDocumentWithKeyFromTable({"uid":uid}, TableConsts.UserTimestamps).then((userTimestamps)=>{
      if(!userTimestamps) {
        userTimestamps = {};
      }
      let now = Math.round(new Date().getTime()/1000);
      let lastSave = 0;
      if(userTimestamps["noteSave_1:1"]) {
        lastSave = userTimestamps["noteSave_1:1"];
      }
      let lastSaveThrottle = 60*8; // five minutes
      if(env.name === 'development') {
        lastSaveThrottle = 30;
      }
      if(now - lastSave < lastSaveThrottle) {
        return;
      }

      let lastSent = 0;
      if(userTimestamps.noteUpdateEmail) {
        lastSent = userTimestamps.noteUpdateEmail;
      }

      let lastSentThrottle = 60*30;
      if(env.name === 'development') {
        lastSentThrottle = 30;
      }
      if(now - lastSent < lastSentThrottle) {
        return;
      }

      this.sendNoteEmail(noteKey).then((sendResult)=>{
        var message = `Sent email for note: ${noteKey}`;
        successCallback(job, message, completionCallback);
        if(!userTimestamps.uid) {
          let uid = this.getUidFromKey(noteKey);
          userTimestamps.uid = uid;
        }
        userTimestamps.noteUpdateEmail = now;
        DocumentManager.putDocumentInTable(userTimestamps, TableConsts.UserTimestamps).then((saveData)=>{
        }).catch((error)=>{
          LogManager.logError(`Failed to update user timestamps with noteUpdateEmail for note: ${noteKey}`, error);
        });
      }).catch((error)=>{
        LogManager.logError(`Failed to send note email for note: ${noteKey}`, error);
        return failureCallback(error);
      });
    });
  },

  getUidFromKey: function(key) {
    var parts = key.split(':');
    return parts[0];
  }
}

module.exports = NotesManager;
