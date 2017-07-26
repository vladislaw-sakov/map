/**
* Created by robby on 12/7/15.
*/

var UserProfileManager = require('../UserProfileManager.js')
, UserManager = require('../UserManager.js')
, LocationUtilities = require('../../utilities/LocationUtilities.js')
, TypeformConstants = require('../../constants/TypeformConstants.js')
;

function TypeformResponseHandlerProfileRunning() {
  this.quizId = TypeformConstants.QUIZ_ID_PROFILE_RUNNING;
}

TypeformResponseHandlerProfileRunning.prototype.handleResponse = function( response, options, callback ) {
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
  if( uid ) {

    // gender questions.
    UserProfileManager.getUserProfile( uid, function( err, userProfile ) {
      // "textfield_20524044": "What is your profession?"
      if(!userProfile) {
        return;
      }
      if( answers["textfield_20524044"] ) {
        userProfile.set('profession', answers["textfield_20524044"]);
      }

      // birthday
      if( answers["date_20445846"] ) {
        userProfile.setBirthday(answers["date_20445846"]);
      }

      // "textfield_20315370": "What is your zip code?"
      if( answers["textfield_20315370"] ) {
        LocationUtilities.getLocationObjectFromAddress( answers["textfield_20315370"], function( err, locData ) {
          if( locData ) {
            userProfile.setHomeLocation( locData );

            UserProfileManager.saveUserProfile( userProfile );
          }
        })
      } else {
        UserProfileManager.saveUserProfile( userProfile );
      }
    });
  }
  if( callback ) {
    callback();
  }
};

module.exports = TypeformResponseHandlerProfileRunning;
