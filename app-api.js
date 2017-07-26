
/**
* Module dependencies.
*/

env = require('./env');

var express = require('express')
, cors = require('cors') // enable CORS for certain origins
, morgan = require('morgan')
, http = require('http')
, bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, methodOverride = require('method-override')
, errorhandler = require('errorhandler')
, path = require('path')
, fs = require('fs')
, Memcached = require('memcached') //require('lifelist-common').Memcached for mock object
, passport = require('passport')
, SessionManager = require('./lib/managers/SessionManager')
, flash = require('connect-flash')
, AWS = require('aws-sdk')
, Mixpanel = require('mixpanel')
, mixpanel = Mixpanel.init( env.current.mixpanel.token )
, ErrorConsts = require('./lib/store/ErrorConsts')
, rollbar = require('rollbar');
;

// Add success and fail methods to response
express.response.success = function(data) {
  this.json({success: true, "data": data});
};
express.response.fail = function(code, message) {
  this.json({success: false, "code": code, "message": message});
};

var app = express();

AWS.config.update({apiVersion:"2012-08-10"});
AWS.config.update({sslEnabled:false});
AWS.config.update({region:env.current.aws.region});
if( env.current.aws.endpoint ) {
  AWS.config.update({endpoint:env.current.aws.endpoint});
}

dynamodb = new AWS.DynamoDB();
docClient = new AWS.DynamoDB.DocumentClient();
s3 = new AWS.S3();

/* Setup memcached */
cacheNodes = [];
app_memcached = null;

cacheNodes.push( env.current.memcachedEndpoint );

app_memcached = new Memcached( cacheNodes );
app_memcached.on('failure', function( details ){ sys.error( "Server " + details.server + "went down due to: " + details.messages.join( '' ) ) });

// all environments
app.set('port', process.env.PORT || 3000);


// CORS config
var originWhitelist = [
  env.current.vanity_url,
  'https://swellist.com',
  'https://www.swellist.com',
  'http://swellist.com',
  'http://www.swellist.com'
];
var corsOptions = {
  origin: originWhitelist,
  credentials: true
};
app.use(cors(corsOptions));

app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());

app.use(flash());
app.use(validateSessionToken)
app.use(ensureAuthenticated);
app.use(passport.initialize());

app.use(function(err, req, res, next) {
  // Catch all error handling
  if (err) {
    res.fail(ErrorConsts.SystemError, err.message);
  }
});

if( env.name != "development" ) {
  rollbar.init("9782ff1328f44d579454484ee4c14483", {
    environment: env.name
  });
  app.use(rollbar.errorHandler('9782ff1328f44d579454484ee4c14483'));
  var rollBarOptions = {
    // Call process.exit(1) when an uncaught exception occurs but after reporting all
    // pending errors to Rollbar.
    //
    // Default: false
    exitOnUncaughtException: true
  };
  rollbar.handleUncaughtExceptions("9782ff1328f44d579454484ee4c14483", rollBarOptions);
}

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

var normalizedPath = require("path").join(__dirname, "routes-api");
fs.readdirSync(normalizedPath).forEach(function(file) {
  require("./routes-api/" + file)(app, express);
});

app.all('*', function(req, res) { //if no route is found
  res.send(404);
});
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Authenticate user and set req.user
function validateSessionToken(req, res, next) {
  var token;

  if (req.headers.authorization) { // bearer token
    var parts = req.headers.authorization.split(' ');
    if (parts.length < 2) {
      return next();
    } else {
      var token = parts[1];
      if( !token ) {
        console.error("missing token for: " + req.path);
      }
    }
  } else if( req.query.access_token ) {
    token = req.query.access_token;
  } else if( req.body.access_token ) {
    token = req.body.access_token;
  } else {
    return next();
  }

  SessionManager.verify(token, function(err, user) {
    if (err) {
      console.error( "token verify failed path: " + req.path );
      console.error( "token verify failed err: " + err );
      mixpanel.track("Login_Error", {"message": "token verify failure", "path": req.path, "error": err });
      return next();
    } else {
      req.user = user.uid;
      req.token = token;
      return next();
    }
  });
}

// If route is not whitelisted or req.user not set, send 401 response
function ensureAuthenticated(req, res, next) {
  if (routeIsWhitelisted(req.path)) {
    return next();
  } else if (!req.user) {
    mixpanel.track("Login_Error", {"message": "Invalid session.", "path": req.path });
    return res.fail(ErrorConsts.InvalidSession, "Invalid session."); //res.fail( ErrorConsts.Unauthorized, "Unauthorized");
  }
  return next();
}

function routeIsWhitelisted(path) {
  var whitelisted = false;
  switch(path) {
    case "/v1/login":
    case "/v1/signup":
    case "/checkme":
    case "/v1/sms/":
    case "/wUqGCYVw.html":
      whitelisted = true;
      break;
    default:
      break;
  }

  return whitelisted;
}
