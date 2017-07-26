/**
* Created by robby on 12/7/15.
*/

var UserProfileManager = require('../UserProfileManager.js')
, UserManager = require('../UserManager.js')
, LocationUtilities = require('../../utilities/LocationUtilities.js')
, TypeformConstants = require('../../constants/TypeformConstants.js')
;

function TypeformResponseHandlerOnboardingRunning() {
  this.quizId = TypeformConstants.QUIZ_ID_ONBOARDING_RUNNING;
}

TypeformResponseHandlerOnboardingRunning.prototype.handleResponse = function( response, options, callback ) {
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
    UserProfileManager.getUserProfile( uid, function( err, userProfile ) {
      if( answers["list_20506135_choice"] ) {
        userProfile.setGender( answers["list_20506135_choice"] );
      }
      if(answers["textfield_20506066"]) {
        userProfile.setName(answers["textfield_20506066"]);
      }
      UserProfileManager.saveUserProfile( userProfile );
    });
  }
  if(callback) {
    callback();
  }
};

module.exports = TypeformResponseHandlerOnboardingRunning;
