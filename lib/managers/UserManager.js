var DataManager = require('./DataManager')
, WunderlistManager = require('./WunderlistManager.js')
, UserPasswordManager = require('./UserPasswordManager')
, UserProfileManager = require('./UserProfileManager.js')
, LogManager = require('./LogManager')
, TableConsts = require('../constants/TableConsts.js')
, UserConsts = require('../store/UserConsts')
, User = require('../models/user')
, moment = require('moment')
, Mixpanel = require('mixpanel')
, mixpanel = Mixpanel.init(env.current.mixpanel.token)
, _ = require('underscore')
, validator = require('validator')
, Slack = require('node-slack')
, async = require('async')
;

function getEmailForUid(uid, callback) {
  DataManager.getItemWithKeyInTable(uid, TableConsts.UserEmail, callback);
}
module.exports.getEmailForUid = getEmailForUid;

function getUidFromKey(key, callback) {
  DataManager.getItemWithKeyInTable(key, TableConsts.UserId, function (err, uid) {
    callback(err, uid);
  });
}
module.exports.getUidFromKey = getUidFromKey;

var getFacebookProfileFromUid = function (uid, callback) {
  DataManager.getItemWithKeyInTable(uid, TableConsts.Facebook, function (err, fbProfile) {
    callback(err, fbProfile);
  });
}
module.exports.getFacebookProfileFromUid = getFacebookProfileFromUid;

var saveUser = function (uid, userData, callback) {
  if (!userData) {
    var error = new Error("Missing userData");
    LogManager.logError("saveUser failed", error);
    return callback(error);
  }
  if (!userData.hasOwnProperty('created')) {
    userData.created = _.now().toString();
  }

  var userString = JSON.stringify(userData);

  var item = {};
  item.key = {S: uid};
  item.value = {'S': userString};
  item.created = {N: userData.created.toString()};

  DataManager.putItem(TableConsts.User, item, function (err, data) {
    if (callback) {
      callback(err, userData);
    }
  });
  DataManager.deleteItemInCache(TableConsts.User, uid);

};
module.exports.saveUser = saveUser;

function isValidUid(uid) {
  return new Promise((fulfill, reject)=>{
    if(!uid) {
      return fulfill(false);
    }
    DataManager.getItemWithKeyInTableNoCache(uid, TableConsts.User, (err, user)=>{
      if(user){
        fulfill(true);
      } else {
        fulfill(false);
      }
    });
  });
}
module.exports.isValidUid = isValidUid;

var getUserObject = function (uid, callback) {
  getUser(uid, false, function (err, userAttributes) {
    if (err) {
      callback(err);
    } else {
      var user = new User(uid, userAttributes);
      callback(null, user);
    }
  });

};
module.exports.getUserObject = getUserObject;

var getUser = function (uid, bypassCache, callback) {
  var profile = {};
  var email = "";
  var phone = "";
  var user = {};
  async.parallel([
    (callbackA)=>{
      DataManager.getItemWithKeyInTable(uid, TableConsts.UserProfile, function (err, fetchedProfile) {
        if (err) {
          return callbackA(err);
        }
        if (!fetchedProfile) {
          profile = UserProfileManager.getDefaultProfile(uid);
        } else {
          try {
            profile = JSON.parse(fetchedProfile);
          } catch (e) {
            profile = UserProfileManager.getDefaultProfile(uid);
            console.log(e + "raw: " + userProfile);
          }
        }
        callbackA();
      });
    },
    (callbackB)=>{
      DataManager.getItemWithKeyInTable(uid, TableConsts.UserEmail, function (emailErr, fetchedEmail) {
        if (!emailErr && fetchedEmail) {
          email = fetchedEmail;
        } else if(emailErr) {
          LogManager.logError("Failed to fetch email.", emailErr);
        }
        callbackB();
      });
    },
    (callbackC)=>{
      DataManager.getItemWithKeyInTable(uid, TableConsts.UserPhone, function (phoneErr, fetchedPhone) {
        if (!phoneErr && fetchedPhone) {
          phone = fetchedPhone;
        } else if(phoneErr) {
          LogManager.logError("Failed to fetch phone number.", phoneErr);
        }
        callbackC();
      });
    },
    (callbackD)=>{
      DataManager.getItemWithKeyInTable(uid, TableConsts.User, (err, userData)=>{
        if (err) {
          LogManager.logError("Error fetching User for uid: " + uid, err )
          return callbackD(err);
        } else {
          try {
            user = JSON.parse(userData);
          } catch(e) {
            LogManager.logError("Error parsing User for uid: " + uid, e );
            return callbackD(e);
          }
        }
        callbackD();
      });
    }
  ], (err)=>{
    var result = Object.assign(profile, user);
    result.email = email;
    result.phone = phone;
    callback(err, result);
  });
};
module.exports.getUser = getUser;

/**
*
* Update the user profile with the given params.
*
* @param uid
* @param params
*/
function updateUserProfile(uid, updatedProfile, callback) {
  DataManager.getItemWithKeyInTableNoCache(uid, TableConsts.UserProfile, function (err, profileDataRaw) {
    var profileData = {};
    if (!profileDataRaw) {
      profileData = UserProfileManager.getDefaultProfile(uid);
    } else {
      try {
        profileData = JSON.parse(profileDataRaw);
      } catch(e) {
        LogManager.logError("Problem in updateUserProfile.", e);
      }
    }

    Object.assign(profileData, updatedProfile);

    var profileDataString = JSON.stringify(profileData);
    DataManager.putValueForKeyInTable(profileDataString, uid, TableConsts.UserProfile, function (err, data) {
      if (err) {
        console.log(err);
      }
      if (callback) {
        callback(err, updatedProfile);
      }
    });
  });
}
module.exports.updateUserProfile = updateUserProfile;

function isEmployee(uid, callback) {
  getEmailForUid(uid, function (err, email) {
    if (!email)
    return callback(null, false);
    DataManager.getItemWithKeyInTable(email, TableConsts.AdminWhitelist, function (err, role) {
      callback(err, role ? true : false);
    });
  });
}
module.exports.isEmployee = isEmployee;

var getKeyForAppUser = function (appId, appUid) {
  return appId + "_" + appUid;
}
module.exports.getKeyForAppUser = getKeyForAppUser;

var initWithWunderlist = function (wunderlistUser, callback) {
  var result = {};
  var key = 'wunderlist_' + wunderlistUser.id;

  getUidFromKey(key, function (err, existingUid) {
    if (err) {
      return callback(err);
    }
    if (existingUid) {
      WunderlistManager.updateWunderlistUser(existingUid, wunderlistUser)
      result.uid = existingUid;
      result.isNewUser = false;
      callback(null, result);
    } else if (wunderlistUser.email) {
      var email = wunderlistUser.email;
      getUidFromKey(email, function (err, existingUid) {
        if (existingUid) {
          WunderlistManager.updateWunderlistUser(existingUid, wunderlistUser);
          result.uid = existingUid;
          result.isNewUser = false;
          callback(null, result);
        } else {
          initUser(null, key, null, {"variation":'wunderlist'}, function (err, newUid) {
            if (err) {
              return callback(err, null);
            }

            WunderlistManager.updateWunderlistUser(newUid, wunderlistUser);
            result.uid = newUid;
            result.isNewUser = true;

            callback(null, result);
          });
        }
      });
    } else {
      initUser(null, key, null, {"variation":'wunderlist'}, function (err, newUid) {
        if (err) {
          return callback(err, null);
        }

        WunderlistManager.updateWunderlistUser(newUid, wunderlistUser);
        result.uid = newUid;
        result.isNewUser = true;

        callback(null, result);
      });
    }
  });
};
module.exports.initWithWunderlist = initWithWunderlist;

var initUser = function (uid, key, pwd, options, callback) {
  DataManager.getLock(key, function (err) {
    if (err) {
      // Try retrieving uid for a few seconds
      setTimeout(getUidFromKey, 2000, key, callback);
    } else {
      if (uid) {
        initUserWithUidAndKey(uid, key, pwd, options, function (err, data) {
          DataManager.deleteLock(key);
          return callback(err, uid);
        });
      } else {
        getNewUserId(function (err, newUid) {
          initUserWithUidAndKey(newUid, key, pwd, options, function (err, data) {
            DataManager.deleteLock(key);
            return callback(err, newUid);
          });
        });
      }
    }
  });
}
module.exports.initUser = initUser;

/**
* Initializes the new user's data.
*
* @param uid
* @param email
* @param callback
*/
function initUserWithUidAndKey(uid, key, pwd, options, callback) {
  var timestamp = Math.round(_.now() / 1000);
  var user = {
    uid: uid,
    created: timestamp
  };
  if(options.variation) {
    user.variation = options.variation;
  }
  if(options.location) {
    user.last_location = options.location;
  }
  if(options.campaign) {
    user.campaign = options.campaign;
  }

  var userString = JSON.stringify(user);
  DataManager.putValueForKeyInTable(userString, uid, TableConsts.User, function (err, data) {
    mixpanel.track("Born", {"uid": uid});
    supplementUserData(uid, key, pwd, options, function (err, data) {});
    callback(err, user);
  });
}

function getIsUnderCap( callback ) {
  DataManager.getItemOfTypeWithKeyInTable( 'N', 'cap', TableConsts.UserCount, function( err, cap ) {
    if( err ) {
      return callback( err );
    }

    DataManager.getItemOfTypeWithKeyInTable( 'N', 'global', TableConsts.UserCount, function( err, count ) {
      if( err ) {
        return callback( err );
      }
      callback( null, parseInt(cap) > parseInt(count) );
    });
  });
}
module.exports.getIsUnderCap = getIsUnderCap;

var supplementUserData = function (uid, key, pwd, options, callback) {
  var keyIsEmail = validator.isEmail(key);
  async.parallel([
    (callbackA)=>{
      DataManager.putValueForKeyInTable(uid, key, TableConsts.UserId, function (err, data) {
        callbackA();
      });
    },
    (callbackB)=>{
      if (!keyIsEmail) {
        return callbackB();
      }
      DataManager.putValueForKeyInTable(key, uid, TableConsts.UserEmail, function (err, data) {
        if(err) {
          LogManager.logError("Error saving email.", err);
        }
        callbackB();
      });
    },
    (callbackC)=>{
      if (keyIsEmail && pwd) {
        UserPasswordManager.addUserPassword(key, pwd, function(err, saveData){});
      }
      callbackC();
    }
  ], function (err) {
    callback(err, uid);
  });
}
module.exports.supplementUserData = supplementUserData;

function getNewUserId(callback) {
  dynamodb.updateItem({
    TableName: TableConsts.UserCount,
    Key: {
      "key": {
        "S": "global"
      }
    },
    AttributeUpdates: {
      "value": {
        "Action": "ADD",
        "Value": {
          "N": "1"
        }
      }
    },
    ReturnValues: "ALL_NEW"
  }, function (err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      var uid = data.Attributes.value.N;
      callback(err, uid);
    }
  });
}

module.exports.getUserStartupData = function (uid, suggestedLastModified, version, options, callback) {
  async.parallel([
    function (callbackA) {
      getUser(uid, false, function (err, userData) {
        callbackA(err, userData);
      });
    }
  ], function (error, results) {
    if (error) {
      callback(error);
    } else {
      var userData = results[0];
      var result = {
        "user": userData
      };

      callback(null, result);
    }
  }
);
};

module.exports.addToWaitingList = function (key, source) {
  var keyObj = {"key": {"S": key}, "type": {"S": "applicant"}};
  DataManager.getItem(keyObj, TableConsts.WaitingList, function (err, entry) {
    if (err || !entry) {
      dynamodb.updateItem({
        TableName: TableConsts.UserCount, Key: {"key": {"S": "priority"}}, ReturnValues: "ALL_NEW",
        AttributeUpdates: {"value": {"Action": "ADD", "Value": {"N": "1"}}}
      }, function (err, data) {
        var item = {};
        item['priority'] = {'N': data.Attributes.value.N};
        item['key'] = {'S': key + ''}
        item['type'] = {'S': 'applicant'};
        item['metadata'] = {'S': JSON.stringify({"source": source, "created_at": Math.round(_.now() / 1000)})};
        item['deleted'] = {'N': '0'};
        DataManager.putItem(TableConsts.WaitingList, item);
      });
    }
  });
};

module.exports.slackSignup = function (key, source, channel, options) {
  if (env.name != "development") {
    source = source || "ios";
    channel = channel || "email";
    var slack = new Slack('simplelabs', env.current.slack.key);
    var action = "signup";
    var dashboardLink = "";
    if (options) {
      if (options.uid) {
        dashboardLink = " " + env.current.admin_url + "/user/" + options.uid + "/dashboard";
      }
      if (options.action) {
        action = options.action;
      }
    }
    var message = "new " + action + " via " + source + " from: https://api.fullcontact.com/v2/person.json?" + channel + "=" + key + "&apiKey=b7143d6076190cd8";
    message += dashboardLink;

    slack.send({
      text: (message),
      channel: "#signups",
      username: "SignupBot"
    });
  }
};

function updateEmail(uid, email, callback) {
  async.parallel([
    function (callbackA) {
      DataManager.putValueForKeyInTable(email, uid, TableConsts.UserEmail, function (err, data) {
        callbackA(err);
      });
    },
    function (callbackB) {
      DataManager.putValueForKeyInTable(uid, email, TableConsts.UserId, function (err, data) {
        callbackB(err);
      });
    }
  ], function (err) {
    if(callback)
      callback(err, {});
  });
}
module.exports.updateEmail = updateEmail;

function updatePhone(uid, phone, callback) {
  async.parallel([
    function (callbackA) {
      DataManager.putValueForKeyInTable(phone, uid, TableConsts.UserPhone, function (err, data) {
        callbackA(err);
      });
    },
    function (callbackB) {
      DataManager.putValueForKeyInTable(uid, phone, TableConsts.UserId, function (err, data) {
        callbackB(err);
      });
    }
  ], function (err) {
    if(callback) {
      callback(err, {});
    }
  });
}
module.exports.updatePhone = updatePhone;

module.exports.saveLastLocation = function ( uid, lastLocation ) {
  DataManager.getItemWithKeyInTableNoCache( uid, TableConsts.UserLocations, function( err, locations ) {
    if(err) return; //noop
    if( !locations ) {
      locations = [];
    } else {
      try {
        locations = JSON.parse(locations);
      } catch (e) {
        locations = []; //back to the drawing board
      }
    }
    var twoWeeksAgo = lastLocation.at - 1209600;
    for(var i=locations.length - 1; i>=0; i--) { //start at end (longest time ago) and count up
      if(locations[i].at >= twoWeeksAgo)
      break;
    }
    locations = locations.slice(0, i+1);
    locations.unshift(lastLocation);
    DataManager.putValueForKeyInTableNoCache( JSON.stringify(locations), uid, TableConsts.UserLocations, function( err, data ) { /* don't care if failure */ } );
  });
};
