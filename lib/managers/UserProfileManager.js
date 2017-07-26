/**
 * Created by robby on 12/4/15.
 */

var UserProfile = require('../models/UserProfile.js')
    , DataManager = require('./DataManager')
    , TableConsts = require('../constants/TableConsts.js')
    , LogManager = require('./LogManager')
    ;

module.exports.getUserProfile = function( uid, callback ) {
    var userProfile = null;
    DataManager.getItemWithKeyInTable( uid, TableConsts.UserProfile, function( err, data ) {
        if( err ) {
            LogManager.logError( "Failed to get UserProfile for: " + uid, err );
            if( callback ) {
                callback( err );
            }

            return;
        }
        var userProfileData;
        if( !data ) {
            userProfileData = getDefaultProfile( uid );
        } else {
            try {
                userProfileData = JSON.parse( data );
            } catch( e ) {
                LogManager.logError( "Failed to parse UserProfile for: " + uid, e );
            }
        }

        userProfile = new UserProfile( userProfileData );
        if( !userProfile ) {
            userProfile = new UserProfile( getDefaultProfile( uid ) );
        }

        callback( err, userProfile );
    });
};

module.exports.saveUserProfile = function( userProfile, callback ) {
    if( !userProfile || !userProfile.uid ) {
        var err = new Error("Invalid user profile data sent to saveUserProfile.");
        LogManager.logError( err.message, err );
        if( callback ) {
            callback( err );
        }
        return;
    }
    var userProfileData = userProfile.getAttributes();
    var userProfileString = JSON.stringify( userProfileData );

    DataManager.putValueForKeyInTable( userProfileString, userProfile.uid, TableConsts.UserProfile, function( err, saveData ) {
        if( callback ) {
            callback( err, saveData );
        }
    });
};

function getDefaultProfile(uid) {
    return {
        uid: uid,
        name: "",
        gender: "",
        location_name: "",
        last_location: {},
        home_location: {},
        birthday: ""
    }
}
module.exports.getDefaultProfile = getDefaultProfile;
