/**
 * Created by liztron on 1/26/16.
 */
var AppDispatcher = require('../../dispatcher/AppDispatcher');
var UserConstants = require('../../constants/swell/SwellUserConstants');
var SwellAPIUtils = require('../../api/swell/SwellAPIUtils.js');

var apiUtils = new SwellAPIUtils({
    baseUrl: API_URL
});

var UserProfileActions = {
    setUserName : function(updatedProfile) {
        AppDispatcher.dispatch({
            actionType: UserConstants.SET_USER_NAME,
            name: updatedProfile.name
        });
        apiUtils.updateProfile(updatedProfile, (err, res) => {
            if (err) {
                throw new Error("Lenny Rules! Failed to update name. error:" + err);
            }
        });
    },
    setUserBirthday : function(updatedProfile) {
        AppDispatcher.dispatch({
            actionType: UserConstants.SET_USER_BIRTHDAY,
            birthday: updatedProfile.birthday
        });
        apiUtils.updateProfile(updatedProfile, (err, res) => {
            if (err) {
                throw new Error("Lenny Rules! Failed to update birthday. error:" + err);
            }
        });
    },
    setUserEmail : function(updatedProfile) {
        AppDispatcher.dispatch({
            actionType: UserConstants.SET_USER_EMAIL,
            email: updatedProfile.email
        });
        apiUtils.updateEmail(updatedProfile, (err, res) => {
            if (err) {
                throw new Error("Lenny Rules! Failed to update email. error:" + err);
            }
        });
    },
    setUserPhone : function(updatedProfile) {
        AppDispatcher.dispatch({
            actionType: UserConstants.SET_USER_PHONE,
            phone: updatedProfile.phone
        });
        apiUtils.updatePhone(updatedProfile, (err, res) => {
            if (err) {
                throw new Error("Lenny Rules! Failed to update phone number. error:" + err);
            }
        });
    },
    setUserGender : function(updatedProfile) {
        AppDispatcher.dispatch({
            actionType: UserConstants.SET_USER_GENDER,
            gender: updatedProfile.gender
        });
        apiUtils.updateProfile(updatedProfile, (err, res) => {
            if (err) {
                throw new Error("Lenny Rules! Failed to update gender. error:" + err);
            }
        });
    },
    setUserLocationName : function(updatedProfile) {
        AppDispatcher.dispatch({
            actionType: UserConstants.SET_USER_LOCATION_NAME,
            location_name: updatedProfile.location_name
        });
        apiUtils.updateProfile(updatedProfile, (err, res) => {
            if (err) {
                throw new Error("Lenny Rules! Failed to update location name. error:" + err);
            }
        });
    },
    setUserTimezone : function(updatedProfile) {
        AppDispatcher.dispatch({
            actionType: UserConstants.SET_USER_TIMEZONE,
            name: updatedProfile.timezone
        });
        apiUtils.updateProfile(updatedProfile, (err, res) => {
            if (err) {
                throw new Error("Lenny Rules! Failed to update timezone. error:" + err);
            }
        });
    }
};


module.exports = UserProfileActions;
