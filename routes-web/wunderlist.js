var WunderlistManager = require('../lib/managers/WunderlistManager')
, SessionManager = require('../lib/managers/SessionManager.js')
, UserManager = require('../lib/managers/UserManager')
, ErrorConsts = require('../lib/store/ErrorConsts')
//, SignupFeedInitializeBot = require('../lib/bots/SignupFeedInitializeBot.js')
, Mixpanel = require('mixpanel')
, mixpanel = Mixpanel.init( env.current.mixpanel.token )
, CookieUtilities = require('../lib/utilities/CookieUtilities.js')
, Slack = require('node-slack')
;

function handleWunderlistAuthSuccess( res, wunderlistUser, stateData, callback ) {
  var next = stateData && stateData.next ? stateData.next : "";
  function handleRedirect(options) {
    var uid = options.uid;
    switch(next) {
      case "signup_quiz":
        var redirectUrl = 'https://tryswell.typeform.com/to/EPf23h?uid=' + uid + '&email=' + wunderlistUser.email;
        res.redirect( redirectUrl );
        break;
      case "dashboard":
      default:
        if( options.hasOwnProperty('token') ) {
          res.cookie('token', options.token, {"path":'/'});
        }
        if(uid) {
          res.cookie('uid', uid, {"path": "/"});
        }
        if( options.isNewUser ) {
          var email = options.startupData.session.key;
          return res.render('setfirstpassword', {email: email, apiUrl:env.current.api_base_url});
        } else {
          res.redirect("/dashboard");
        }
      break;
    }
  }
  function initWithWunderlist() {
    UserManager.initWithWunderlist( wunderlistUser, function( err, result ) {
      SessionManager.createFromEmail( wunderlistUser.email, "ios", 1, (err, startupData) => {
        if( !err && startupData ) {
          result.startupData = startupData;
          if( startupData.hasOwnProperty('session') && startupData.session.hasOwnProperty('token') ) {
            result.token = startupData.session.token;
          }
        }
        handleRedirect(result);
      });
      if( result.isNewUser ) {
        // var feedInitializeBot = new SignupFeedInitializeBot( result.uid, wunderlistUser.email );
        // feedInitializeBot.run();
        UserManager.slackSignup( wunderlistUser.email, "wunderlist", "email", result );

        var peopleProps = {
          "$created": (new Date()).toISOString(),
          "$email": wunderlistUser.email,
          "uid": result.uid
        };
        if( result.variation ) {
          peopleProps.variation = result.variation;
        }
        if( stateData ) {
          if( stateData.campaign ) {
            peopleProps.campaign = stateData.campaign;
          }
          if( stateData.ref ) {
            peopleProps.ref = stateData.ref;
          }

          if( stateData.mixpanel ) {
            var mixpanelProps = stateData.mixpanel;
            if( mixpanelProps.distinct_id ) {
              mixpanel.alias(mixpanelProps.distinct_id, result.uid);
              mixpanel.alias(mixpanelProps.distinct_id, wunderlistUser.email);
            }
          }
        }
        mixpanel.people.set(result.uid, peopleProps);
      }
      if( callback ) {
        callback( null, wunderlistUser );
      }
    });
  }
  if( stateData && stateData.token ) {
    SessionManager.uidFromToken( stateData.token, function( err, tokenUid ) {
      if( !err && tokenUid ) {
        handleRedirect({
          "uid":tokenUid,
          "token": stateData.token
        });
        WunderlistManager.updateWunderlistUser(tokenUid, wunderlistUser);
        if( callback ) {
          callback( null, wunderlistUser );
        }
      } else {
        initWithWunderlist();
      }
    });
  } else {
    initWithWunderlist();
  }
}

module.exports = function( app, express ) {
  app.get('/wunderlist/callback', function( req, res ) {
    var code = req.query.code || "";
    var state = req.query.state || "";
    if (!code || !state) {
      return res.render('wunderlist', {'error': true});
    }
    WunderlistManager.fetchRandomState( state, function( err, stateDataString ) {
      if (err) {
        return res.fail(ErrorConsts.Unauthorized, err.message);
      }
      var stateData;
      try {
        stateData = JSON.parse( stateDataString );
      } catch(e) {

      }
      WunderlistManager.fetchWunderlistUser(code, function(err, wunderlistUser) {
        if (err) {
          res.fail(ErrorConsts.Unauthorized, err.message);
        } else if( !wunderlistUser.email ) {
          var pageParams = {};
          wunderlistUser.code = code;
          wunderlistUser.state = state;
          var wunderlistString = JSON.stringify( wunderlistUser );
          var wunderlistUserEncoded = encodeURIComponent( wunderlistString );
          var wunderlistUserEscaped = wunderlistUserEncoded.replace(/'/g, "\\'");
          pageParams.wunderlistUser = wunderlistUserEscaped;
          res.render('wunderlist-addemail', pageParams);
        } else {
          handleWunderlistAuthSuccess( res, wunderlistUser, stateData );
        }
      });
      var trackingProps = {};
      if( stateData ) {
        trackingProps = Object.assign(trackingProps, stateData);

        delete trackingProps.token;
        delete trackingProps.mixpanel;

        if( stateData.mixpanel ) {
          if( stateData.mixpanel.distinct_id ) {
            trackingProps.distinct_id = stateData.mixpanel.distinct_id;
          }
        }
      }

      mixpanel.track("WunderlistSignup_AuthSuccess", trackingProps);
    });
  });

  app.post('/wunderlist/user', function( req, res ) {
    var code = req.body.code;
    var state = req.body.state;
    var email = req.body.email;
    if (!code || !state || !email) {
      return res.render('wunderlist', {});
    }
    WunderlistManager.fetchRandomState( state, function( err, stateDataString ) {
      if (err) {
        return res.fail(ErrorConsts.Unauthorized, err.message);
      }

      var stateData;
      try {
        stateData = JSON.parse( stateDataString );
      } catch(e) {

      }

      WunderlistManager.fetchWunderlistUser(code, function(err, wunderlistUser) {
        if (err) {
          res.fail(ErrorConsts.Unauthorized, err.message);
        } else {
          if( !wunderlistUser.email ) {
            wunderlistUser.email = email;
          }

          handleWunderlistAuthSuccess( res, wunderlistUser, stateData );
        }
      });
    });
  });

  app.get('/wunderlist/success', function( req, res ) {
    res.render('wunderlist', {'authorized': true});
  });

  app.get('/wunderlist/auth', function(req, res) {
    var token = req.cookies.token || "";
    var campaign = req.cookies.campaign || "";
    var ref = req.query.ref || "";
    var next = req.query.next || "";
    var mixpanel = CookieUtilities.mixpanelCookieParser(req.cookies);
    var stateData = {
      token: token,
      ref: ref,
      next: next,
      campaign: campaign,
      mixpanel: mixpanel
    };
    var dataString = JSON.stringify(stateData);
    WunderlistManager.generateRandomState(dataString, function(err, state) {
      if (err) {
        return res.fail(ErrorConsts.SystemError, 'Failed to generate random state');
      }
      res.redirect('https://www.wunderlist.com/oauth/authorize?client_id=' + env.current.wunderlist.client_id
      + '&redirect_uri=' + env.current.wunderlist.redirect_uri
      + '&state=' + state);
    });
  });

  app.post('/wunderlist/update', function(req, res) {
    if (!req.body.operation || req.body.operation != 'create') {
      return res.send(200);
    }

    var key = 'wunderlist_' + req.body.data.created_by_id;
    var trackingParams = {"app_version": "Wunderlist", "os": (req.headers['user-agent'] || "")};
    UserManager.getUidFromKey(key, function(err, uid) {
      if (err || !uid) {
        console.log('Failed to get uid of wunderlist user ' + req.body.data.created_by_id);
        return res.send(200);
      }

      var slack = new Slack( 'simplelabs', env.current.slack.key );
      slack.send({
          text: "*" + req.body.data.title + "*\nhttp://admin.tryswell.com/user/" + uid +"/feeddashboard",
          channel: "#tasks",
          username: "Wunderlist Task"
      });
    });
  });

};
