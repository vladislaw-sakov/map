/**
* Created by robby on 12/7/15.
*/

var UserProfileManager = require('../UserProfileManager.js')
, UserManager = require('../UserManager.js')
, LocationUtilities = require('../../utilities/LocationUtilities.js')
, TypeformConstants = require('../../constants/TypeformConstants.js')
;

function TypeformResponseHandlerProfileProductivity() {
  this.quizId = TypeformConstants.QUIZ_ID_PROFILE_PRODUCTIVITY;
}

TypeformResponseHandlerProfileProductivity.prototype.handleResponse = function( response, options, callback ) {
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
      // "What is your profession?"
      if( answers["textfield_20519961"] ) {
        userProfile.set('profession', answers["textfield_20519961"]);
      }

      // birthday
      if( answers["date_20445617"] ) {
        userProfile.setBirthday(answers["date_20445617"]);
      }

      // "What is your zip code?"
      if( answers["textfield_20314421"] ) {
        LocationUtilities.getLocationObjectFromAddress( answers["textfield_20314421"], function( err, locData ) {
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

module.exports = TypeformResponseHandlerProfileProductivity;
