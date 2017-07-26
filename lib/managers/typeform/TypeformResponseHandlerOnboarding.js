/**
* Created by robby on 12/7/15.
*/

var UserProfileManager = require('../UserProfileManager.js')
, UserManager = require('../UserManager.js')
, LocationUtilities = require('../../utilities/LocationUtilities.js')
, ScheduledTipsManager = require('../ScheduledTipsManager.js')
;

function TypeformResponseHandlerOnboarding() {
  this.quizId = "EPf23h";
}

TypeformResponseHandlerOnboarding.prototype.handleResponse = function( response, options, callback ) {
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
    UserManager.isValidUid(uid).then((isValidUid)=>{
      // console.log("valid uid");
      if( answers["list_17019786_choice"] ) {
        // console.log("has answer");
        var goalRaw = answers["list_17019786_choice"];
        var goal = goalRaw.toLowerCase();
        var goalParts = goal.split(' ');
        // console.log("goalParts:", goalParts);
        if( goalParts.indexOf('organized') > -1 ) {
          // console.log("found organized");
          ScheduledTipsManager.addSwellistTipsByBatchId(uid, "EPf23h_organized");
        } else if( goalParts.indexOf('finances') > -1 ) {
          // console.log("found finances");
          ScheduledTipsManager.addSwellistTipsByBatchId(uid, "EPf23h_finance");
        } else if( goalParts.indexOf('eating') > -1 ) {
          // console.log("found eating");
          ScheduledTipsManager.addSwellistTipsByBatchId(uid, "EPf23h_cooking");
        } else if( goalParts.indexOf('exercising') > -1 ) {
          // console.log("found exercising");
          ScheduledTipsManager.addSwellistTipsByBatchId(uid, "EPf23h_exercising");
        } else if( goalParts.indexOf('time') > -1 ) {
          // console.log("found time");
          if( goalParts.indexOf('managing') > -1 ) {
            // console.log("found managing");
            // managing my time better
            ScheduledTipsManager.addSwellistTipsByBatchId(uid, "EPf23h_managing_time");
          } else if( goalParts.indexOf('making') > -1 ) {
            // console.log("found making");
            // making time for myself
            ScheduledTipsManager.addSwellistTipsByBatchId(uid, "EPf23h_making_time");
          }
        }
      }
    });

    // gender questions.
    UserProfileManager.getUserProfile( uid, function( err, userProfile ) {
      // "list_13870735_choice": "What is your gender?"
      if( answers["list_13870735_choice"] ) {
        userProfile.setGender( answers["list_13870735_choice"] );
      }
      if(answers["textfield_18651821"]) {
        userProfile.setName(answers["textfield_18651821"]);
      }
      // "number_13870630": "What is your zip code?"
      if( answers["number_13870630"] ) {
        LocationUtilities.getLocationObjectFromAddress( answers["number_13870630"], function( err, locData ) {
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

module.exports = TypeformResponseHandlerOnboarding;
