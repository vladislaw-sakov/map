/**
* SwellAPIUtils.js
*
* Implements task-specific logic for coordinating with the Swell API. Examples
* include creating tasks, editing tasks, and deleting tasks.
*
*
* Created on Dec. 9, 2015
*
* @author Charles Li
*/


'use strict';

// Dependencies
var TokenAPI = require('../TokenAPIUtils')
, SessionStore = require('../../store/auth/SwellSessionStore')
, SwellAPIActions = require('../../actions/swell/SwellAPIActions.js')
;

/**
* SwellAPIUtils inherits from TokenAPI
*
* Sample Usage:
*   var apiClient = new SwellAPIUtils();
*   apiClient.signUp({email: "email@email.com", password: "password", variation: "web"});
*/
class SwellAPIUtils extends TokenAPI {
  constructor(options) {
    super(options);
    this.baseUrl = (options && options.baseUrl) || env.current.api_base_url;

    // Authentication routes
    this.signupRoute = (options && options.signupRoute) || '/v1/signup';
    this.loginRoute = (options && options.loginRoute) || '/v1/login';

    this.session = SessionStore.getSession();
    this.token = this.session.token;


    SessionStore.addChangeListener(() => {
      this.session = SessionStore.getSession();
      this.token = this.session.token;
    });
  }


  /**
  * A sample session token
  *
  * "session": {
  *   "token": "ykPEZUyJyWaqNoINF1IkxI1r/nCswPHTpaFd49j+ZN8=",
  *   "expires": 1481248962,
  *   "uid": "1",
  *   "key": "charles.dt.li@gmail.com",
  *   "type": "session_type_email"
  * }
  *
  */


  /**
  * signUp(): Wraps and saves the session token with a POST to signup
  *
  * @param  {object} signUpData
  *
  * signUpData is an object containing at least the following:
  * - email
  * - password
  * - variation (iOS/web)
  */
  signUp(signUpData, callback) {
    if (signUpData) {
      signUpData.variation = "web";
    }
    super.post(this.baseUrl + this.signupRoute, signUpData, (err, res)=>{
      if( err ) {
        SwellAPIActions.signupError(err);
      }
      if( res && res.data ) {
        if( res.data.user ) {
          SwellAPIActions.receiveUserData(res.data.user);
        }
        if( res.data.session ) {
          SwellAPIActions.receiveSessionData(res.data.session);
        }
      }
    });
  }

  /**
  * login(): Initializes session for current user with a POST
  *
  * @param {object} loginData
  *
  * loginData is an object containing at least the following:
  * - email or udid
  * - password
  * - other optional params
  */
  login(loginData, callback) {
    super.post(this.baseUrl + this.loginRoute, loginData, (err, res)=>{
      if( err ) {
        SwellAPIActions.signupError(err);
      }
      if( res && res.data ) {
        if( res.data.user ) {
          SwellAPIActions.receiveUserData(res.data.user);
        }

        if( res.data.session ) {
          SwellAPIActions.receiveSessionData(res.data.session);
        }
      }
    });
  }


  /**
  * logout() Log the user out of current session
  *
  * Sample usage:
  *     apiClient.logout()
  */
  logout(callback) {
    super.del(this.baseUrl + '/v1/logout', {}, callback);
  }


  /**
  * updateUserProfile() Updates user profile data
  *
  * Sample usage:
  *    var updatedProfile =
  *    {
  *    birthday: "",
  *    email: "elizabethlovero@gmail.com",
  *    gender: "female",
  *    home_location: Object,
  *    last_location: Object,
  *    location_name: "",
  *    name: "elizabethlovero@gmail.com",
  *    photoUrl: "http://a.wunderlist.com/api/v1/avatar?size=512&user_id=1598745"
  *    uid: "4"
  *    timezone: "America/New_York"
  *    }
  *
  *    apiClient.updateProfile(data, callback);
  *
  * @param  {object} data Should have a user id
  * @return {[type]}      [profile]
  */
  updateProfile(updatedProfile, callback) {

    if (!( updatedProfile && updatedProfile.uid)) {
      throw new Error("Problem with data. Check updateProfile() in swell-api-client.");
    }
    var updateProfileRoute = this.baseUrl + '/v1/user/' + updatedProfile.uid + '/profile';

    super.put(updateProfileRoute, updatedProfile, callback);

  }

  updatePhone(updatedProfile, callback) {

    if (!( updatedProfile.phone)) {
      throw new Error("Problem with data. Check updateProfile() in swell-api-client.");
    }
    var updatePhoneRoute = this.baseUrl + '/v1/user/' + updatedProfile.uid + '/phone';

    super.put(updatePhoneRoute, {phone: updatedProfile.phone}, callback);
  }

  updateEmail(updatedProfile, callback) {

    if (!( updatedProfile.email)) {
      throw new Error("Problem with data. Check updatedEmail() in swell-api-client.");
    }
    var updatedEmailRoute = this.baseUrl + '/v1/user/' + updatedProfile.uid + '/email';

    super.put(updatedEmailRoute, {email: updatedProfile.email}, callback);
  }


  fetchTokenWithType(tokenType) {
    SwellAPIActions.fetchTokenStarted();
    var url = this.baseUrl + '/v1/user/' + SessionStore.getUid() + '/token/' + tokenType;
    super.get(url, (err, res) => {
      SwellAPIActions.fetchTokenCompleted();
      if (err) {
        console.error(err);
        switch (tokenType) {
          case 'wunderlist':
          SwellAPIActions.missingWunderlistToken();
          break;
        }
      } else {
        switch (tokenType) {
          case 'wunderlist':
          if (res.success === true) {
            SwellAPIActions.receiveWunderlistToken(res.data.token);
          } else {
            throw new Error(res.message);
          }
          break;
        }
      }
    });
  }


  fetchUserData(callback) {
    var url = this.baseUrl + '/v1/user/' + SessionStore.getUid();
    super.get(url, (err, res) => {
      if (err) {
        //alert("Failed to fetch user data");
        console.error(err);
      } else {
        SwellAPIActions.receiveUserData(res.data);
      }
    });

  }

  /**
  * updateUserStreamObjectRating() Updates rating on individual tips
  *
  * @param uid
  * @param id
  * @param rating
  * @return should only console log an error, no res action is needed
  */

  updateUserStreamObjectRating(uid, id, rating) {
    if (!uid || !id) {
      throw new Error("Problem with data check updateUserStream in swell-api-client");
    }
    var url = this.baseUrl + '/v1/user/' + uid + /stream/ + id;
    super.put( url, {"streamObject":{"rating": rating}}, (err, res)=>{
      if (err){
        console.error(err);
      }
     });
  }


  /**
   * updateUserStreamObjectRating() Updates rating on individual tips
   *
   * @param uid
   * @param id
   * @param comment
   * @return should only console log an error, no res action is needed
   */

  updateUserStreamObjectComment(uid, id, comment) {
    if (!uid || !id) {
      throw new Error("Problem with data check updateUserStreamObjectComment in swell-api-client");
    }
    var url = this.baseUrl + '/v1/user/' + uid + /stream/ + id;
    super.put( url, {"streamObject":{"comment": comment}}, (err, res)=>{
      if (err){
      console.error(err);
    }
  });
  }

  fetchUserStream() {
    var url = this.baseUrl + '/v2/user/'+SessionStore.getUid()+'/stream';
    super.get(url, (err,res) => {
      if(err) {
        console.log( err );
      } else {
        SwellAPIActions.receiveUserStream(res.data);
      }
      SwellAPIActions.streamFetchFinished();
    });
  }

  fetchUserStreamObject( objectId ) {
    var url = this.baseUrl + '/v1/user/'+SessionStore.getUid()+'/stream/'+objectId;
    super.get(url, (err, res) => {
      if (err) {
        console.log( err );
      } else {
        SwellAPIActions.receiveUserStreamObject(res.data);
      }
    });
  }

  fetchNoteWithKey(noteKey) {
    var parts = noteKey.split(':');
    var uid = parts[0];
    var noteId = parts[1];
    var url = this.baseUrl + '/v1/user/'+uid+'/notes/'+noteId;
    super.get(url, (err, res)=>{
      if(err) {
        console.log(err);
      } else {
        SwellAPIActions.receiveNote(res.data.key, res.data.note);
      }
    });
  }

  saveNote(noteKey, noteRaw, options) {
    var url = this.baseUrl + '/v1/user/'+SessionStore.getUid()+'/notes';

    var params = {
      "note": noteRaw
    };
    params = options ? Object.assign(params, options) : params;
    super.post(url, params, (error, res)=>{
      if(error) return console.log(error);
      console.log(res);
    });
  }

  saveStripeCustomer(token, uid, callback) {
    var url = `${this.baseUrl}/v1/user/${uid}/payments/save`;
    var params = {
      "token": token
    }
    super.post(url, params, (error, response)=>{
      if(error) {
        this.setState({"errorMessage": error.message});
      }
      callback(null, response);
    });
  }

  track(event, props) {
    var url = this.baseUrl + '/v3/trackevent';
    super.post(url, {"events":[{"event": event, "properties": props}]});
  }

  trackBatch(events) {
    var url = this.baseUrl + '/v3/trackevent';
    super.post(url, {"events":events});
  }
}

module.exports = SwellAPIUtils;
