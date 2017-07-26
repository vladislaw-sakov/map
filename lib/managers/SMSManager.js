"use strict";

var twilio = require('twilio')(env.current.twilio.accountSid, env.current.twilio.primaryToken)
, DataManager = require('./DataManager.js')
, LogManager = require('./LogManager.js')
, NotesManager = require('./NotesManager.js')
, UserManager = require('./UserManager.js')
, PhoneNumberUtilities = require('../utilities/PhoneNumberUtilities.js')
;

function handleIncomingSMSMessage(payload) {
  return new Promise((fulfill, reject)=>{
    console.log(`${JSON.stringify(payload)}`);
    let fromNumber = payload.From;
    let formattedFromNumber = PhoneNumberUtilities.getPaddedCountryCodePhoneNumber(fromNumber);
    let text = payload.Body;

    UserManager.getUidFromKey(formattedFromNumber, (err, uid)=>{
      if(!uid) {
        // TODO: send sign up sms.
        return reject({"message": "No uid"});
      }
      let key = `${uid}:1`;
      NotesManager.prependTextToNoteWithKey(text, key).then((prependResult)=>{
        // if ftue, send commands.
        //
        var message = `Added note: ${text}`;
        console.log(message);
        return fulfill({"message": message});
      }).catch((error)=>{
        return reject(error);
        // TODO: send error sms message.
      });
    });
  });
}
module.exports.handleIncomingSMSMessage = handleIncomingSMSMessage;

function sendSMSMessageToUidWithBody(uid, body) {
  return new Promise((fulfill, reject)=>{

    DataManager.getItemWithKeyInTable(uid, TableConsts.UserPhone, function (error, phone) {
      if(phoneErr) {
        LogManager.logError("Failed to fetch phone number.", error);
        return reject(error);
      }
      if(!phone) {
        return reject(new Error("Missing Phone Number"));
      }
      sendSMSToPhoneWithBody(phone, body).then((sendResult)=>{
        fulfill(sendResult);
      }).catch((error)=>{
        reject(error);
      });
    });
  });
}
module.exports.sendSMSMessageToUidWithBody = sendSMSMessageToUidWithBody;

function sendSMSToPhoneWithBody(phone, body) {
  return new Promise((fulfill, reject)=>{
    var sendParams = {
      to: phone,
      from: env.current.twilio.phone,
      body: body
    }
    twilio.sendMessage(sendParams, (error, response)=>{
      if(error) {
        reject(error);
      } else {
        fulfill(response);
      }
    });
  });
}
module.exports.sendSMSToPhoneWithBody = sendSMSToPhoneWithBody;
