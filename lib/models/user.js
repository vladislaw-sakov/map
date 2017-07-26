/**
 * Created by robby on 7/27/15.
 */

var sanitize = require('validator').sanitize;

var User = function( aUid, attributes ) {
    this.uid = aUid;
    this.attributes = attributes || {};
};

User.prototype.setAttributes = function( theAttributes ) {
    this.attributes = theAttributes;
};

User.prototype.getAttributes = function() {
    return this.attributes || {};
};

User.prototype.setSeenFlag = function( flagName, flagValue ) {
    if( !flagName ) {
        return;
    }
    if( !this.attributes.seen ) {
        this.attributes.seen = {};
    }
    if( null == flagValue || flagValue === undefined ) {
        flagValue = Math.round(new Date().getTime()/1000);
    }

    this.attributes.seen[flagName] = flagValue;
};

User.prototype.setNotifPrefs = function( notifType, isOn ) {
    var key;
    switch( notifType ) {
        case "notifyEmail":
        case "email" :
            key = "notifyEmail";
            break;
        case "notifyFB":
        case "facebook" :
            key = "notifyFB";
            break;
        case "notifySMS":
            key = "notifySMS";
            break;
        case "notifyApps":
            key = "notifyApps";
            break;
    }

    if( !key ) {
        return { message: "no type: " + notifType };
    }

    var notifyPrefs = {
        isOn: true,
        lastSent: 0
    };
    if( this.attributes[key] ) {
        notifyPrefs = this.attributes[key];
    }

    notifyPrefs.isOn = sanitize(isOn).toBoolean();

    this.attributes[key] = notifyPrefs;
};

module.exports = User;
