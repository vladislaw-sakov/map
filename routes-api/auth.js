var UserPasswordManager = require('../lib/managers/UserPasswordManager.js')
, UserManager = require('../lib/managers/UserManager.js')
, NotesManager = require('../lib/managers/NotesManager.js')
, TableConsts = require('../lib/constants/TableConsts.js')
, DataManager = require('../lib/managers/DataManager.js')
, SessionManager = require('../lib/managers/SessionManager.js')
, SignupFeedInitializeBot = require('../lib/bots/SignupFeedInitializeBot.js')
, CookieUtilities = require('../lib/utilities/CookieUtilities.js')
, CampaignUtilities = require('../lib/utilities/CampaignUtilities.js')
, ErrorConsts = require('../lib/store/ErrorConsts.js')
, Mixpanel = require('mixpanel')
, mixpanel = Mixpanel.init(env.current.mixpanel.token)
, Slack = require('node-slack')
, validator = require('validator')
, request = require('request-json')
, zapierClient = request.createClient('https://zapier.com')
;

module.exports = function(app, express) {

  /**
  * Ex:
  * Request body:
  *    email = user@domain.com
  *    password = abc123
  *    udId = 002ebf12-a125-5ddf-a739-67c3c5d20177
  *    variation = ios
  *    app_variation = baby
  * Response:
  *    {
  *      Success: true,
  *      user: user,
  *      session: session
  *      isNew: false
  *    }
  */
  app.post('/:version/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var udid = req.body.udid;
    var redeem = req.body.redeem;
    var variation = req.body.app_variation ? req.body.app_variation : req.body.variation;
    var version = req.params.version;

    if (email && password) {
      email = email.toLowerCase();
      UserPasswordManager.checkUserPassword(email, password, function (err, isVerified) {
        if (err) {
          console.log(err);
          res.fail(ErrorConsts.SystemError, err.message);
        } else if (!isVerified) {
          res.fail(ErrorConsts.InvalidEmailOrPassword, 'Unauthorized. Invalid email and/or password.');
        } else {
          SessionManager.createFromEmail(email, variation, version, function(err, data) {
            if (err) {
              res.fail(ErrorConsts.SystemError, err.message);
            } else {
              res.success(data);
            }
          });
        }
      });
    } else if( typeof redeem !== 'undefined' && udid && variation ) {
      UserManager.checkRedeemCode( redeem, function( err, codeData ) {
        if(err || !codeData)
        return res.fail(ErrorConsts.InviteCodeNotFound, "Invite code not found");
        codeData = JSON.parse(codeData);
        if(codeData.uid)
        return res.fail(ErrorConsts.InviteCodeAlreadyRedeemed, "Invite code already redeemed");
        SessionManager.createFromUdid(udid, variation, version, function (err, data) {
          if (err)
          return res.fail(ErrorConsts.SystemError, err.message);
          codeData.uid = data.user.uid;
          if (codeData.email) {
            data.waitingListEmail = codeData.email;
          }
          DataManager.putValueForKeyInTable(JSON.stringify(codeData), redeem, TableConsts.InviteCodes, function(err, result) {
            return res.success(data);
          });
          var userKey = "";
          if( codeData.email ) {
            userKey = codeData.email;
          } else if( codeData.person ) {
            userKey = codeData.person;
          }

          if(env.name == "production" || env.name == "api") {
            var slack = new Slack( 'simplelabs', env.current.slack.key );
            slack.send({
              text: userKey + " redeemed their code and has uid: "+ codeData.uid +" http://admin.livenotes.me/admin/task/"+ codeData.uid.toString() + ":1",
              channel: "#signups",
              username: "Redeem Code Bot"
            });
          }

          if( codeData.vip ) {
            UserManager.getUser( codeData.uid, true, function( userErr, userData ) {
              if (userErr) {
                console.log(userErr);
                return;
              }
              if (userData) {
                userData.level = UserManager.VIP_LEVEL_VALUE;
                UserManager.saveUser(codeData.uid, userData, function (err, data) {
                  if (err) {
                    console.log( err );
                  }
                });
              }
            });
          }
        });
      });
    } else if (udid && variation) {
      UserManager.getIsUnderCap(function (err, isUnderCap) {
        UserManager.getUidFromKey(udid, function (err, uid) {
          var isThrottleEnabled = false;
          var throttleData = env.current.runtime.throttles[variation];
          if( throttleData && throttleData.hasOwnProperty('isEnabled') ) {
            isThrottleEnabled = throttleData.isEnabled;
          }
          if (uid || (isUnderCap && !isThrottleEnabled) ) {
            SessionManager.createFromUdid(udid, variation, version, function (err, data) {
              if (err) {
                res.fail(ErrorConsts.SystemError, err.message);
              } else {
                res.success(data);
              }
            });
          } else {
            res.fail(ErrorConsts.MissingParameters, 'Invite code not found');
          }
        });
      });
    } else {
      res.fail(ErrorConsts.MissingParameters, 'Unauthorized. Missing credentials');
    }
  });

  app.delete('/:version/logout', function(req, res) {
    SessionManager.deleteSession(req.token, function(err) {
      if (err) {
        res.fail(ErrorConsts.SystemError, err.message);
      } else {
        res.success();
      }
    });
  });

  app.post( '/:version/password/forgot', function( req, res ) {
    var email = req.body.email;
    UserManager.getUidFromKey( email, function( err, uid ) {
      if( err ) {
        return res.fail( "SystemError", err.message );
      }
      if( uid ) {
        var baseUrl = env.current.vanity_url;
        UserPasswordManager.resetUserPassword( email, baseUrl, function( err, data ) {
          if( err ) {
            res.fail( "SystemError", err.message );
          } else {
            res.success( {} );
          }
        });
      } else {
        return res.fail( "InvalidEmailOrPassword", { message: "No email found. Try again or sign-up now." } );
      }
    });
  });

  app.post( '/:version/password/reset', function( req, res ) {
    var token = req.body.token;
    var email = req.body.email;
    var password = req.body.pass;
    UserPasswordManager.checkUserTotp( email, token, function( err, isVerified ) {
      if( isVerified ) {
        UserPasswordManager.addUserPassword( email, password, function( err, data ) {
          res.success({ changepassword: true, email: req.body.email});
        });
      } else {
        res.fail("Invalid", "Invalid");
      }
    });
  });

  /**
  * Ex:
  * Request body:
  *    email = user@domain.com
  *    password = abc123
  *    variation = ios
  * Response:
  *    {
  *        Success: true,
  *        user: user,
  *        session: session
  *    }
  */
  app.post( '/:version/signup', function( req, res ) {
    var email = req.body.email;
    var password = req.body.password;
    var variation = req.body.variation;
    var token = req.token;
    var version = req.params.version;
    var campaign = req.body.campaign || "";

    if (email && password && variation) {
      // First check if email address is in valid format
      email = email.toLowerCase();
      var isEmail = validator.isEmail( email );
      if(!isEmail) {
        return res.fail(ErrorConsts.IncorrectEmailFormat, "Please enter a valid email.");
      }

      // Check if email address already exists
      UserManager.getUidFromKey(email, function(err, uid) {
        if (err) {
          res.fail(ErrorConsts.SystemError, err.message);
        } else if (uid) {
          // check to see if password setup.
          UserPasswordManager.userHasPasswordForEmail( email, function( err, userHasPasswordForEmail ) {
            if( userHasPasswordForEmail ) {
              return res.fail(ErrorConsts.EmailAlreadyRegistered, "Email already registered");
            }
            // all we need to do here is set up the session and set the password
            UserPasswordManager.addUserPassword( email, password );
            SessionManager.createFromEmail(email, variation, version, function(err, data) {
              if (err) {
                res.fail(ErrorConsts.SystemError, e.message);
              } else {
                data.newUser = true;
                UserManager.slackSignup( email, variation, "email", {"uid": uid, "action": "login"} );
                res.success(data);
              }
            });
          });

        } else if (req.user && token) {
          // Session exists. Associate email to user
          SessionManager.updateSessionForTokenWithKeyPassword( token, email, password, SessionManager.SESSION_TYPE_EMAIL, variation, version, function( err, sessionData ) {
            if( err ) {
              res.fail( err );
            } else if( sessionData ) {
              UserManager.slackSignup( email, variation, "email", {"uid": uid, "action": "login"} );
              res.success( sessionData );
            }
          });
        } else {
          // Create new user
          var options = {"variation":variation, "campaign": campaign};
          UserManager.initUser( null, email, password, options, (err, uid)=>{
            if (err) {
              res.fail(ErrorConsts.SystemError, err.message);
            } else {
              SessionManager.createFromEmail(email, variation, version, (err, data)=>{
                if (err) {
                  res.fail(ErrorConsts.SystemError, e.message);
                } else {
                  data.newUser = true;

                  var campaigns = env.current.campaigns;
                  var campaignKey = CampaignUtilities.getBaseCampaignKey(data.user.campaign);
                  if(campaigns.hasOwnProperty(campaignKey)) {
                    var campaignData = campaigns[campaignKey];
                    if(campaignData.hasOwnProperty("starterNoteKey")) {
                      NotesManager.copyNote(campaignData.starterNoteKey, uid+":1").then();
                    }
                  }

                  UserManager.slackSignup( email, variation, "email", {"uid": uid, "action": "signup"} );

                  var feedInitializeBot = new SignupFeedInitializeBot( uid, email, options );
                  feedInitializeBot.run();

                  res.success(data);
                }
              });
              if(env.name != "development") {
                var zapData = {
                  "event": "signup",
                  "email": email,
                  "variation": variation,
                  "uid": uid,
                  "campaign": campaign
                };
                zapierClient.post('/hooks/catch/592021/2v3zaa/', zapData, (err, res, body)=>{
                  if(err) {
                    console.log(err);
                  }
                  if(body) {
                    console.log(body);
                  }
                });
              }
            }
          });
        }
      });
    } else {
      res.fail(ErrorConsts.MissingParameters, "Bad request. Missing parameters");
    }
  });
}
