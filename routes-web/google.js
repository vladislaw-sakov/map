var google = require('googleapis')
, googleAuth = require('google-auth-library')
, clientSecret = env.current.google.client_secret
, clientId = env.current.google.client_id
, redirectUrl = env.current.google.redirect_uri
, auth = new googleAuth()
, oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)
, UserTokenManager = require('../lib/managers/UserTokenManager.js')
, SessionManager = require('../lib/managers/SessionManager.js')
;

module.exports = function(app, express) {
  app.get('/auth/google/success', (req, res)=>{
    var code = req.query.code;
    if(!code) {
      return res.json({"message": "Missing code."});
    }
    if( req.cookies && req.cookies.token ) {
      var token = req.cookies.token;
      SessionManager.getSession( token, function( err, session ) {
        var uid = session.uid;
        oauth2Client.getToken(code, function(err, token) {
          if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
          }
          oauth2Client.credentials = token;
          UserTokenManager.storeUidTokenForService(uid, token, UserTokenManager.SERVICES.google).then((saveResult)=>{
            var message = encodeURIComponent("You have successfully synced your calendar!");
            req.session.message = message;
            var next = 'account-connect';
            if(req.session.nextHash) {
              next = req.session.nextHash;
              delete req.session.nextHash;
            }
            res.redirect(`/dashboard#/${next}`);
          }).catch((error)=>{
            console.log(error.message);
            res.send(error);
          });
        });
      });
    } else {
      res.send(req.cookies);
    }
  });

  app.get('/auth/google', (req, res)=>{
    var clientSecret = env.current.google.client_secret;
    var clientId = env.current.google.client_id;
    var redirectUrl = env.current.google.redirect_uri;
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    if(req.query.nextHash) {
      req.session.nextHash = req.query.nextHash;
    }
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar']
    });
    res.redirect(authUrl);
  });
}
