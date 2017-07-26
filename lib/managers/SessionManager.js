var DataManager = require('./DataManager')
    , UserManager = require('./UserManager.js')
    , TableConsts= require('../constants/TableConsts.js')
    , LogManager = require('./LogManager')
    , async = require('async')
    , crypto = require('crypto')
    , StringUtilities = require('../utilities/StringUtilities.js')
    ;

var SESSION_SECRET = "kvqto6sCKUZPttXfdPcZ";
var SESSION_TTL = 31536000; // 1 year in seconds

var SESSION_TYPE_UDID = "session_type_udid";
module.exports.SESSION_TYPE_UDID = SESSION_TYPE_UDID;

var SESSION_TYPE_EMAIL = "session_type_email";
module.exports.SESSION_TYPE_EMAIL = SESSION_TYPE_EMAIL;

var SESSION_TYPE_FACEBOOK = "session_type_facebook";
module.exports.SESSION_TYPE_FACEBOOK = SESSION_TYPE_FACEBOOK;

/**
 * Creates a new session from UDID. If user does not already exist,
 * a new user is created.
 *
 * @param udid
 * @param variation
 * @param callback
 */
function createFromUdid(udid, variation, version, callback) {
    // First find or create user
    findOrCreateUser(udid, variation, function(err, user, isNew) {
        if (err) {
            callback(err);
        } else if (isNew) {
            // New user. Create new session and return
            createSession(user, udid, SESSION_TYPE_UDID, variation, function(err, session) {
                if (err) {
                    callback(err);
                } else {
                    var uid = user.uid;
                    var options = { "variation": variation };
                    getAdditionalStartupData(uid, version, options, function(err, data) {
                        data['user'] = user;
                        data['session'] = session;
                        data['newUser'] = isNew;
                        callback(null, data);
                    });
                }
            });
        } else {
            // Existing user. Check if email or FB association already exists
            async.parallel([
                function (callbackA) {
                    UserManager.getEmailForUid(user.uid, function (err, email) {
                        if (err) {
                            callbackA(err);
                        } else {
                            callbackA(null, email);
                        }
                    });
                }
            ], function (err, results) {
                if (err) {
                    callback(err);
                } else if (results[0] || results[1]) {
                    var failResult = results[0] ? results[0] : results[1];
                    LogManager.log('Must authenticate with facebook or email: ' + failResult, LogManager.LOG_LEVEL_CONSOLE );
                    callback(new Error('Must authenticate with facebook or email'));
                } else {
                    createSession(user, udid, SESSION_TYPE_UDID, variation, function (err, session) {
                        if (err) {
                            callback(err);
                        } else {
                            var uid = user.uid;
                            var options = { "variation": variation };
                            getAdditionalStartupData(uid, version, options, function(err, data) {
                                data['user'] = user;
                                data['session'] = session;
                                data['newUser'] = isNew;
                                callback(null, data);
                            });
                        }
                    });
                }
            });
        }
    });
}
module.exports.createFromUdid = createFromUdid;

/**
 * Creates a session from email login.
 *
 * @param email
 * @param variation
 * @param version
 * @param callback
 */
function createFromEmail(email, variation, version, callback) {
    UserManager.getUidFromKey(email, function(err, uid) {
        if (err) {
            callback(err);
        } else if(!uid) {
            callback(new Error('User ID for ' + email + ' not found'));
        } else {
            UserManager.getUser( uid, false, function( err, user ) {
               if (err) {
                   callback(err);
               } else if (!user) {
                   callback(new Error('User not found'));
               } else {
                   createSession(user, email, SESSION_TYPE_EMAIL, variation, function(err, session) {
                      if (err) {
                          callback(err);
                      } else {
                          var options = { "variation": variation };
                          getAdditionalStartupData(uid, version, options, function(err, data) {
                              data['user'] = user;
                              data['session'] = session;
                              callback(null, data);
                          });
                      }
                   });
               }
            });
        }
    });
}
module.exports.createFromEmail = createFromEmail;

/**
 * Creates a session from facebook. If user does not exist, a new
 * user is created.
 *
 * @param uid User ID
 * @param key Real email address or username@facebook.com
 * @param variation ios, android, web, etc
 * @param callback
 */
function createFromFacebook(uid, key, variation, version, callback) {
    UserManager.getUser(uid, false, function(err, user) {
        if (err) {
            callback(err);
        } else if (!user) {
            callback(new Error('User not found'));
        } else {
            createSession(user, key, SESSION_TYPE_FACEBOOK, variation, function(err, session) {
                if (err) {
                    callback(err);
                } else {
                    var options = { "variation": variation };
                    getAdditionalStartupData(uid, version, options, function(err, data) {
                        data['user'] = user;
                        data['session'] = session;
                        callback(null, data);
                    });
                }
            });
        }
    });
}

module.exports.createFromFacebook = createFromFacebook;

function getAdditionalStartupData(uid, version, options, callback) {
    UserManager.getUserStartupData( uid, 0, version, options, function( err, startupData ) {
        if( err ) {
            LogManager.logError("UserManager.getUserStartupData failed", err);
        }
        if( !startupData ) {
            startupData = {};
        }
        callback( null, startupData );
    });
}

/**
 * Verify a session token. If token is valid, user object returned in
 * callback.
 *
 * @param token
 * @param callback
 */
function verify(token, callback) {
    // Check if session exists in DB.
    getSession(token, function(err, session) {
        if (err) {
            callback(err);
        } else if (!session) {
            console.error( "No session found: " + token);
            callback(new Error("No session found"));
        } else if (sessionHasExpired(session)) {
            console.error( "Session has expired: " + token);
            callback(new Error("Session has expired"));
        } else {
            // Retrieve user object
            UserManager.getUser(session.uid, false, function(err, user) {
                callback(err, user);
            });
        }
    });
}
module.exports.verify = verify;

/* Helper methods */

/**
 * Find user object associated with UDID. If not found, a new user is created and
 * UDID is associated
 *
 * @param udid
 * @param variation
 * @param callback
 */
function findOrCreateUser(udid, variation, callback) {
    UserManager.getUidFromKey(udid, function(err, uid) {
        if (err) {
            callback(err);
        } else if (uid == null) {
            // User does not exist, create user and associate to UDID
            UserManager.initUser(null, udid, null, {"variation":variation}, function (err, newUid) {
                if (err) {
                    callback(err);
                } else {
                    uid = newUid;
                    // Return new user
                    UserManager.getUser( uid, false, function( err, user ) {
                        callback( err, user, true );
                    });
                }
            });
        } else {
            // Return existing user
            UserManager.getUser( uid, false, function( err, user ) {
                callback( err, user, false );
            });
        }
    });
}

/**
 * Creates a new session for user and persists it. If an existing session exists,
 * it is deleted.
 *
 * @param uid User ID of user
 * @param key Can be either email, UDID, or fb UID
 * @param type Type of session, e.g. SESSION_TYPE_FACEBOOK
 * @param variation Platform type, i.e., ios, android, or web
 * @param callback Error and session objects as parameters
 */
function createSession(user, key, type, variation, callback) {
    // Generate new session token
    var token = generateToken(key);
    var session = {
        "token": token.token,
        "expires": token.expires,
        "uid": user.uid,
        "key": key,
        "variation": variation,
        "type": type
    };

    // Save session
    saveSession(session, function(err) {
        if (err) {
            callback(err);
        } else {
            if (err) {
                callback(err);
            } else {
                callback(null, session);
            }
        }
    });
}

/**
 * Generate token from key
 *
 * @param key
 * @returns {{token: *, expires: number}}
 */
function generateToken(key) {
    var currentTime = Math.round(new Date().getTime()/1000); // Use current timestamp as salt
    var strToHash = key + SESSION_SECRET + currentTime;
    var sessionTokenRaw = crypto.createHash('sha256').update(strToHash).digest('base64');
    var sessionToken = StringUtilities.Base64EncodeUrl(sessionTokenRaw);
    var expires = currentTime + SESSION_TTL;

    return {
        token: sessionToken,
        "expires": expires
    };
}

/**
 * Checks if a session has expired or not
 *
 * @param session
 * @returns {boolean}
 */
function sessionHasExpired(session) {
    var currentTime = Math.round(new Date().getTime()/1000);
    if (!session.expires || currentTime > session.expires) {
        return true;
    }

    return false;
}

/**
 * Retrieves a session from data store
 *
 * @param token
 * @param callback
 */
function getSession(token, callback) {
    DataManager.getItemWithKeyInTable(token, TableConsts.Session, function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            var asObj;
            try {
                asObj = JSON.parse(result);
            } catch (e) {
                return callback(e);
            }
            callback(null, asObj);
        }
    });
}

module.exports.getSession = getSession;

/**
 * Update the session data. Supported updates are: type.
 *
 * @param token
 * @param callback
 */
function updateSessionForTokenWithKeyPassword( token, key, password, type, variation, version, callback ) {
    getSession( token, function( err, sessionData ) {
        if( !sessionData ) {
            return callback( null, null );
        } else {
            sessionData.type = type;
            sessionData.key = key;
            saveSession( sessionData );

            var uid = sessionData.uid;
            UserManager.supplementUserData(uid, key, password, true, variation, function(err, supplementedUid) {
                UserManager.getUser( uid, false, function( err, user ) {
                    var options = { "variation": variation };
                    getAdditionalStartupData(uid, version, options, function(err, data) {
                        data['user'] = user;
                        data['session'] = sessionData;
                        callback(null, data);
                    });
                });
            });
        }
    });
}
module.exports.updateSessionForTokenWithKeyPassword = updateSessionForTokenWithKeyPassword;

/**
 * Saves a session to data store
 *
 * @param token
 * @param session
 * @param callback
 */
function saveSession(session, callback) {
    DataManager.putValueForKeyInTable(JSON.stringify(session), session.token, 'Session', function(err, result) {
        if( callback ) {
            callback(err);
        }
    });
}

/**
 * Deletes a session from the data store
 *
 * @param token
 * @param callback
 */
function deleteSession(token, callback) {
    DataManager.deleteItem('Session', token, function(err) {
        if( callback ) {
            callback(err);
        }
    });
}
module.exports.deleteSession = deleteSession;

/**
 * Retrieve the token from a headers object.
 *
 * @param headers
 * @returns {*}
 */
function tokenFromHeaders( headers ) {
    if( !headers || !headers.authorization ) {
        return null;
    }
    var parts = headers.authorization.split(' ');
    if( parts.length < 2 ) {
        return null;
    }
    return parts[1];
}
module.exports.tokenFromHeaders = tokenFromHeaders;

function uidFromToken( token, callback ) {
    getSession( token, function( err, sessionData ) {
        if( err ) {
            return callback( err );
        } else {
            if( !sessionData || !sessionData.uid ) {
                return callback( null, null );
            } else {
                return callback( null, sessionData.uid );
            }
        }
    });
}
module.exports.uidFromToken = uidFromToken;

function keyFromToken( token, callback ) {
    getSession( token, function( err, sessionData ) {
        if( err ) {
            return callback( err );
        } else {
            if( !sessionData || !sessionData.key ) {
                return callback( null, null );
            } else {
                return callback( null, sessionData.key );
            }
        }
    });
}
module.exports.keyFromToken = keyFromToken;
