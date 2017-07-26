/**
* Created by robby on 12/7/15.
*/

var UserProfileManager = require('../UserProfileManager.js')
, UserManager = require('../UserManager.js')
, LocationUtilities = require('../../utilities/LocationUtilities.js')
, ScheduledTipsManager = require('../ScheduledTipsManager.js')
, TypeformConstants = require('../../constants/TypeformConstants.js')
;

function TypeformResponseHandlerOnboardingControl() {
  this.quizId = TypeformConstants.QUIZ_ID_ONBOARDING_CONTROL;
}

TypeformResponseHandlerOnboardingControl.prototype.handleResponse = (response, options, callback)=>{
  if(!response) {
    if(callback) {
      callback(null, {"message": "No response"});
    }
    return;
  }
  if(!response.answers) {
    if(callback){
      callback(null, {"message": "No answers"});
    }
    return;
  }
  console.log("handleResponse: " + response);

  var answers = response.answers;

  var uid = response.hidden.uid;
  if(uid) {
    UserManager.isValidUid(uid).then((isValidUid)=>{
      console.log("valid uid");
      if( answers["list_20237613_choice"] ) {
        console.log("has answer");
        var goalRaw = answers["list_20237613_choice"];
        var goal = goalRaw.toLowerCase();
        var goalParts = goal.split(' ');
        console.log("goalParts:", goalParts);
        if( goalParts.indexOf('organized') > -1 ) {
          console.log("found organized");
          ScheduledTipsManager.handleBatchId(uid, "XvnVwA_organized");
        } else if( goalParts.indexOf('finances') > -1 ) {
          console.log("found finances");
          ScheduledTipsManager.handleBatchId(uid, "XvnVwA_finance");
        } else if( goalParts.indexOf('eating') > -1 ) {
          console.log("found eating");
          ScheduledTipsManager.handleBatchId(uid, "XvnVwA_cooking");
        } else if( goalParts.indexOf('exercising') > -1 ) {
          console.log("found exercising");
          ScheduledTipsManager.handleBatchId(uid, "XvnVwA_exercising");
        } else if( goalParts.indexOf('time') > -1 ) {
          console.log("found time");
          if( goalParts.indexOf('managing') > -1 ) {
            console.log("found managing");
            // managing my time better
            ScheduledTipsManager.handleBatchId(uid, "XvnVwA_managing_time");
          } else if( goalParts.indexOf('making') > -1 ) {
            console.log("found making");
            // making time for myself
            ScheduledTipsManager.handleBatchId(uid, "XvnVwA_making_time");
          }
        }
      }
    });

    UserProfileManager.getUserProfile( uid, function( err, userProfile ) {
      if( answers["list_20506271_choice"] ) {
        userProfile.setGender( answers["list_20506271_choice"] );
      }
      if(answers["textfield_20237609"]) {
        userProfile.setName(answers["textfield_20237609"]);
      }
      UserProfileManager.saveUserProfile( userProfile );
    });
  }
  if(callback) {
    callback();
  }
};

module.exports = TypeformResponseHandlerOnboardingControl;
