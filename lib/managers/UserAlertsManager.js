/**
 * Created by robby on 7/28/15.
 */
"use strict";

var DataManager = require('./DataManager')
  , UserManager = require('./UserManager')
  , LogManager = require('./LogManager.js')
  , TableConsts = require('../constants/TableConsts.js')
  , async = require('async')
  , sendgrid = require('sendgrid')(env.current.sendgrid.api_key)
  , Mixpanel = require('mixpanel')
  , mixpanel = Mixpanel.init(env.current.mixpanel.token)
  ;

function sendEmailToUidsWithOptions(uids, options) {
  return new Promise((fulfill, reject)=> {
    var sendResponses = {};
    async.each(uids, (uid, callback)=> {
      UserManager.getEmailForUid(uid, (err, email)=> {
        if (err) {
          return callback(err);
        }
        if (!email) {
          return callback();
        }

        if (!options) options = {};
        var categories = options.categories || [new Error().stack];
        var sgEmail = new sendgrid.Email();
        sgEmail.setTos([email]);
        sgEmail.subject = options.subject || " "; // not allowed to be blank.
        sgEmail.from = options.from || "hello@swellist.com";
        sgEmail.fromname = options.fromName || "Swellist";
        sgEmail.html = options.html || " "; // not allowed to be blank.
        sgEmail.text = options.text || " "; // not allowed to be blank.
        sgEmail.setCategories(categories);
        if (options.substitutions) {
          var subs = options.substitutions;
          for (var tag in subs) {
            sgEmail.addSubstitution(tag, subs[tag]);
          }
        }
        if (options.asmGroupID) {
          sgEmail.setASMGroupID(options.asmGroupID);
        }
        if (options.templateId) {
          sgEmail.setFilters({
            'templates': {
              'settings': {
                'enable': 1,
                'template_id': options.templateId
              }
            }
          });
        }
        sendgrid.send(sgEmail, (err, sendResponse)=> {
          if (err) {
            LogManager.logError(`Problem sending email. ${sgEmail}`, err);
            callback(err);
          } else {
            sendResponses[email] = sendResponse;
            callback()
          }
        });
      });
    }, (error)=> {
      if (error) {
        LogManager.logError(`problemSending email ${error.message}`, error);
        reject(error);
      } else {
        fulfill(sendResponses);
      }
    });
  });
}
module.exports.sendEmailToUidsWithOptions = sendEmailToUidsWithOptions;
