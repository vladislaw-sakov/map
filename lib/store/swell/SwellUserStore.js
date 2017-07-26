var AppDispatcher = require('../../dispatcher/AppDispatcher')
    , EventEmitter = require('events').EventEmitter
    , cookie = require('cookie')
    , UserConstants = require('../../constants/swell/SwellUserConstants.js')
    , DashboardConstants = require('../../constants/dashboard/DashboardConstants.js')
    ;

var CHANGE_EVENT = 'change';

var _userData = {};
var localUserRaw = localStorage.getItem("user");
if( localUserRaw ) {
  var localUser;
  try {
    localUser = JSON.parse(localUserRaw);
  } catch(e) {}
  if(localUser) {
    _userData = localUser;
  }
} else {
  var cookieData = cookie.parse(document.cookie);
  if(cookieData && cookieData.uid) {
    _userData = {
      uid: cookieData.uid
    }
  }
}
/**
 * _userData: {
 * created: 1451417125
 * lastTaskCreated: 0
 * last_location: Object
 * level: 15
 * msgsSent: Object
 * notifyEmail: Object
 * notifyFB: Object
 * profile: {
 * *  birthday: "11/26/1977",
 * * email: "elizabethlovero@gmail.com",
 * * gender: "male",
 * * home_location: Object,
 * * last_location: {"country_code":"United States","region_code":"NY","latitude":40.74590636421064,"longitude":-74.00569654076733,"city":"New York","zipcode":"10011"},
 * * location_name: "New York, NY",
 * * name: "elizabethlovero@gmail.com",
 * * photoUrl: "http://a.wunderlist.com/api/v1/avatar?size=512&user_id=1598745"
 * * uid: "4",
 * * }
 * seen: Object
 * sessionToken: "+iK4h7VyZ/KIlil86fPTlsr/R+N7LS5XyBpgJQzK6kg="
 * tags: Array[0]
 * taskCount: 0
 * tipCount: 0
 * uid: "4"
 * variation: "wunderlist"
 * }
 *
 */


function setUserName(newName) {
    _userData.name = newName;
};

function setUserBirthday(newBirthday){
    _userData.birthday = newBirthday;
};

function setUserEmail(newEmail){
    _userData.email = newEmail;
};

function setUserPhone(newPhone){
    _userData.phone = newPhone;
};

function setUserGender(newGender){
    _userData.gender = newGender;
};

function setUserLocationName(newLocationName){
    _userData.location_name = newLocationName;
};

function setUserTimezone(newTimeZone) {
    _userData.timezone = newTimeZone;
};


var UserStore = Object.assign({}, EventEmitter.prototype, {
    getUserData: function() {
        return _userData;
    },
    getUid: function() {
        if( _userData && _userData.hasOwnProperty("uid") ) {
            return _userData.uid;
        }
        return null;
    },
    getEmail: function() {
        if( _userData && _userData.hasOwnProperty("email") ) {
            return _userData.email;
        }
        return null;
    },
    getPhone: function() {
        if( _userData && _userData.hasOwnProperty("phone") ) {
            return _userData.phone;
        }
        return null;
    },
    getCampaign: function() {
      if( _userData && _userData.hasOwnProperty("campaign") ) {
          return _userData.campaign;
      }
      return "";
    },
    emitChange: function () {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function (callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

AppDispatcher.register(function (action) {
    switch (action.actionType) {
        case DashboardConstants.RECEIVE_USER_DATA:
            _userData = action.userData;
            UserStore.emitChange();
            try {
              localStorage.setItem("user", JSON.stringify(_userData));
            } catch(e) {
              console.log(e);
            }

            break;

        case UserConstants.SET_USER_NAME:
            setUserName( action.name );
            UserStore.emitChange();
            break;

        case UserConstants.SET_USER_BIRTHDAY:
            setUserBirthday( action.birthday );
            UserStore.emitChange();
            break;

        case UserConstants.SET_USER_EMAIL:
            setUserEmail( action.email );
            UserStore.emitChange();
            break;

        case UserConstants.SET_USER_PHONE:
            setUserPhone( action.phone );
            UserStore.emitChange();
            break;

        case UserConstants.SET_USER_GENDER:
            setUserGender( action.gender );
            UserStore.emitChange();
            break;

        case UserConstants.SET_USER_LOCATION_NAME:
            setUserLocationName( action.location_name );
            UserStore.emitChange();
            break;

        case UserConstants.SET_USER_TIMEZONE:
            setUserTimezone( action.timezone );
            UserStore.emitChange();
            break;
    }
});

module.exports = UserStore;
