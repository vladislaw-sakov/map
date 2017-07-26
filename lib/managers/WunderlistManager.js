var crypto = require('crypto')
    , DataManager = require('./DataManager')
    , UserProfileManager = require('./UserProfileManager.js')
    , request = require('request-json')
    , Wunderlist = require('../models/wunderlist')
    , async = require('async')
    , TableConsts = require('../constants/TableConsts.js')
    , LogManager = require('./LogManager.js')
    ;

/**
 * Generate an unguessable random string and store in memcache
 * with short TTL
 */
var generateRandomState = function(data, callback) {
    var state = Math.random().toString(36);
    DataManager.putValueForKeyInCache(data, state, 'wunderlist-oauth-state', 300, function(err, memdata) {
        err ? callback(err) : callback(null, state);
    });
};
module.exports.generateRandomState = generateRandomState;

/**
 * Check if random state exists in memcache to counteract cross-site
 * request forgery attacks
 */
var fetchRandomState = function(state, callback) {
    DataManager.getItemWithKeyInTableFromCache(state, 'wunderlist-oauth-state', function(err, memdata) {
        if (err) {
            callback(err);
        } else if (!memdata) {
            callback(new Error(state + ' not found'));
        } else {
            callback(null, memdata);
        }
    });
};
module.exports.fetchRandomState = fetchRandomState;

/**
 * Fetch access token from wunderlist and store for user
 */
var fetchWunderlistUser = function(code, callback) {
    var params = {
        "client_id": env.current.wunderlist.client_id,
        "client_secret": env.current.wunderlist.client_secret,
        "code": code
    };
    var client = request.createClient('https://www.wunderlist.com/');
    client.post('oauth/access_token', params, function(err, res, body) {
        if (err) {
            return callback(err);
        }
        var accessToken = body.access_token || "";
        if (!accessToken) {
            return callback(new Error('No access token returned'));
        }

        var wunderlist = new Wunderlist(env.current.wunderlist.client_id, accessToken);
        wunderlist.getUser(function(err, wunderlistUser) {
            if (err) {
                return callback(err);
            }
            wunderlistUser.access_token = accessToken;
            callback(null, wunderlistUser);
        });
        subscribeToUpdates(accessToken);
    });
};
module.exports.fetchWunderlistUser = fetchWunderlistUser;

function updateWunderlistUser(uid, wunderlistUserData, callback) {
    var email = wunderlistUserData.email;
    if (email) {
        DataManager.getItemWithKeyInTable( email, TableConsts.UserEmail, function( err, userEmail ) {
            if( !err && !userEmail ) {
                DataManager.putValueForKeyInTable( email, uid, TableConsts.UserEmail, function (err, data) {
                    if (err) LogManager.logError("Failed to save user email: " + email, err);
                });
            }
        });

        DataManager.putValueForKeyInTable( uid, email, TableConsts.UserId, function( err, data ) {
            if (err) LogManager.logError("Failed to save user email: " + email, err);
        });
    }
    DataManager.putValueForKeyInTable(JSON.stringify(wunderlistUserData), uid, TableConsts.UserWunderlist, function(err, data) {
        if (err) LogManager.logError("Failed to save user wunderlist data: " + uid, err);
    });
    var wunderlistUidKey = "wunderlist_"+wunderlistUserData.id;
    DataManager.putValueForKeyInTable(uid, wunderlistUidKey, TableConsts.UserId, function( err, data ) {
        if (err) LogManager.logError("Failed to save user wunderlist: " + wunderlistUidKey, err);
    });

    UserProfileManager.getUserProfile( uid, function( err, userProfile ) {
        userProfile.setName( wunderlistUserData.name );
        userProfile.setPhotoUrl( "http://a.wunderlist.com/api/v1/avatar?size=512&user_id="+wunderlistUserData.id);
        UserProfileManager.saveUserProfile( userProfile, function( err, saveData ) {
            if( callback ) {
                callback( err, userProfile.getAttributes() );
            }
        });
    });
}
module.exports.updateWunderlistUser = updateWunderlistUser;

var subscribeToUpdates = function(accessToken) {
    var wunderlist = new Wunderlist(env.current.wunderlist.client_id, accessToken);
    async.waterfall([
        function(callback) {
            // Get users lists
            wunderlist.getLists(function(err, lists) {
                if (err)
                    return callback(err);
                callback(null, lists);
            });
        },
        function(lists, callback) {
            // Find lists that don't have webhook setup yet
            var unhookedLists = [];
            async.eachSeries(lists, function(list, localCallback) {
                wunderlist.getWebhooksForList(list.id, function(err, existingHooks) {
                    if (!err && existingHooks.length == 0) {
                        unhookedLists.push(list);
                    } else if( existingHooks && existingHooks.length ) {
                        var isFound = false;
                        for( var i = 0; i<existingHooks.length; i++ ) {
                            var hook = existingHooks[i];
                            if( hook.url ==  env.current.wunderlist.update_uri ) {
                                isFound = true;
                                break;
                            }
                        }
                        if( !isFound ) {
                            unhookedLists.push(list);
                        }
                    }
                    localCallback();
                });
            }, function(err) {
                callback(null, unhookedLists);
            });
        },
        function(lists, callback) {
            // Subscribe to callbacks for each list
            lists.forEach(function(list) {
                wunderlist.createWebhookForList(list.id, env.current.wunderlist.update_uri, function(err, result) {});
            });
            callback();
        }
    ], function(err) {
        if (err) console.log(err);
    });
};

function resetWunderlistUserByUid( uid, callback ) {
    async.parallel([
        function(callbackA) {
            unSubscribeFromUpdatesForUid(uid, callbackA);
        },
        function(callbackB) {
            getWunderlistUserObject( uid, function( err, wunderlistUser ) {
                if( !wunderlistUser ) {
                    return callbackB();
                }
                async.parallel([
                    function(callbackB1) {
                        var wunderlistUidKey = "wunderlist_" +wunderlistUser.id;
                        DataManager.deleteItem( TableConsts.UserId, wunderlistUidKey, function(err,data){
                            callbackB1();
                        });
                    },
                    function(callbackB2) {
                        if( wunderlistUser.email ) {
                            DataManager.deleteItem( TableConsts.UserId, wunderlistUser.email, function( err, data ) {
                                callbackB2();
                            });
                        }
                    },
                    function(callbackB3) {
                        DataManager.deleteItem( TableConsts.UserWunderlist, uid, function(err, data) {
                            callbackB3();
                        });
                    }
                ], function( err ) {
                    callbackB(err);
                });
            });
        }
    ], function( err ) {
        callback( err, {} );
    });
}
module.exports.resetWunderlistUserByUid = resetWunderlistUserByUid;

var unSubscribeFromUpdatesForUid = function(uid, callback) {
    getAccessTokenForUid( uid, function( err, accessToken ) {
        if( err ) {
            return callback( err );
        }

        var result = {};
        var wunderlist = new Wunderlist(env.current.wunderlist.client_id, accessToken);
        wunderlist.getLists(function(err, lists) {
            if (err) {
                return callback( err );
            }

            async.eachSeries(lists, function(list, localCallback) {
                result[list.id] = {};
                var wunderlistA = new Wunderlist(env.current.wunderlist.client_id, accessToken);
                wunderlistA.getWebhooksForList(list.id, function(err, existingHooks) {
                    if( existingHooks && existingHooks.length  ) {
                        async.eachSeries( existingHooks, function( hook, localCallbackA ) {
                            if( hook.url == env.current.wunderlist.update_uri ) {
                                result[list.id].id = hook.id;
                                result[list.id].url = hook.url;
                                result[list.id].status = "deleted";
                                var wunderlistB = new Wunderlist(env.current.wunderlist.client_id, accessToken);
                                wunderlistB.deleteWebhook( hook.id, function( err, result ) {
                                    localCallbackA();
                                });
                            } else {
                                localCallbackA();
                            }
                        }, function( err ) {
                            localCallback();
                        });
                    } else {
                        localCallback();
                    }
                });

            }, function(err) {
                if( err ) {
                    console.log( err );
                    callback( err );
                } else {
                    callback(null, {"message": "Successfully deleted webhooks", "result": result });
                }
            });
        });
    });
};

module.exports.unSubscribeFromUpdatesForUid = unSubscribeFromUpdatesForUid;

var commentOnTask = function(uid) {

    DataManager.getItemWithKeyInTable(uid, TableConsts.UserWunderlist, function(err, wunderlistUser) {
        if (err) {
            console.log(err);
            return;
        }
        wunderlistUser = JSON.parse(wunderlistUser);
        var wunderlist = new Wunderlist(env.current.wunderlist.client_id, wunderlistUser.access_token);
        wunderlist.createComment(wunderlistUser.id, comment = 'We have tips for your task at swellist.com');
    });
};
module.exports.commentOnTask = commentOnTask;

var getAccessTokenForUid = function( uid, callback ) {
    DataManager.getItemWithKeyInTable(uid, TableConsts.UserWunderlist, function(err, wunderlistUser) {
        if (err) {
            return callback(err);
        }
        if( !wunderlistUser ) {
            return callback( new Error("Missing Wunderlist Authentication. Please re-authenticate Wunderlist."));
        }
        try {
            wunderlistUser = JSON.parse(wunderlistUser);
        } catch( e ) {
            return callback( e );
        }
        if( !wunderlistUser || !wunderlistUser.access_token ) {
            return callback( new Error("Missing access token.") );
        }

        var accessToken = wunderlistUser.access_token;
        callback(null, accessToken);
    });
};
module.exports.getAccessTokenForUid = getAccessTokenForUid;

function getWunderlistUserObject( uid, callback ) {
    DataManager.getItemWithKeyInTable( uid, TableConsts.UserWunderlist, function( err, wunderlistUserRaw ) {
        var wunderlistUser = {};
        try {
            wunderlistUser = JSON.parse(wunderlistUserRaw);
        } catch (e) {
            return callback(e);
        }
        return callback( null, wunderlistUser );
    });
}

module.exports.getWunderlistUserObject = getWunderlistUserObject;
