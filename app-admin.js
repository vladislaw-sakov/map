/**
* Module dependencies.
*/

env = require('./env');

var express = require('express')
, AWS = require('aws-sdk')
, hbs = require('hbs')
, http = require('http')
, morgan = require('morgan')
, Memcached = require('memcached')
, session = require('express-session')
, bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, methodOverride = require('method-override')
, DualCacheDbStore = require('./lib/store/DualCacheDbStore')(session)
, LogManager = require('./lib/managers/LogManager.js')
, passport = require('passport')
, LocalStrategy = require('passport-local').Strategy
, flash = require('connect-flash')
, errorhandler = require('errorhandler')
, fs = require('fs')
, path = require('path')
, UserPasswordManager = require('./lib/managers/UserPasswordManager')
;

rollbar = require('rollbar');
var app = express();

// Add success and fail methods to response
express.response.success = function(data) {
  this.json({success: true, "data": data});
};
express.response.fail = function(code, message) {
  this.json({success: false, "code": code, "message": message});
};

AWS.config.update({apiVersion:"2012-08-10"});
AWS.config.update({sslEnabled:false});
AWS.config.update({region:env.current.aws.region});
if( env.current.aws.endpoint ) {
  AWS.config.update({endpoint:env.current.aws.endpoint});
}

dynamodb = new AWS.DynamoDB();
docClient = new AWS.DynamoDB.DocumentClient();
s3 = new AWS.S3();

hbs.registerHelper('ifCond', function(v1, v2, options) {
  return v1 === v2 ? options.fn(this) : options.inverse(this);
});

/* Setup memcached */
// TODO: put this into a manager
cacheNodes = [];
app_memcached = null;

cacheNodes.push( env.current.memcachedEndpoint );
app_memcached = new Memcached( cacheNodes );
app_memcached.on('failure', function( details ){ sys.error( "Server " + details.server + "went down due to: " + details.messages.join( '' ) ) });

// auth stuff
passport.serializeUser(function( email, done ) {
  done( null, email );
});

passport.deserializeUser( function( email, done ) {
  done( null, email );
});

passport.use(new LocalStrategy(
  function( email, password, done ) {
    console.log( 'checking password...')
    email = email.toLowerCase();
    UserPasswordManager.checkUserRole(email, function(err, role) {
      if(err) {
        console.log(err);
        return done(err, null);
      }
      if(!role) {
        console.log("Missing Role")
        return done( null, false, { message: "User not whitelisted." } );
      }
      UserPasswordManager.checkAdminPassword( email, password, function( err, isVerified ) {
        if( err ) {
          console.log(err);
          return done( err, null );
        }
        if( isVerified ) {
          return done( null, email );
        } else {
          return done( null, false, { message: "Invalid username or password" } );
        }
      });
    });
  }
));


// all environments
app.set('port', process.env.PORT || 3060);
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());

var sessionStore = new DualCacheDbStore({});
var cookieValidTime = 1000 * 60 * 60 * 24 * 365;
app.use(session({
  secret: '5anFrancisc0',
  store: sessionStore,
  saveUninitialized: true,
  resave: true,
  cookie: {
    maxAge: cookieValidTime,
    expires: new Date(Date.now() + cookieValidTime)
  }
}));

if( env.name != "development" ) {

  rollbar.init("48ea3e1d425542169539bddcd2e27c78", {
    environment: env.name
  });
  app.use(rollbar.errorHandler('48ea3e1d425542169539bddcd2e27c78'));
  var rollBarOptions = {
    // Call process.exit(1) when an uncaught exception occurs but after reporting all
    // pending errors to Rollbar.
    //
    // Default: false
    exitOnUncaughtException: true
  };
  rollbar.handleUncaughtExceptions("48ea3e1d425542169539bddcd2e27c78", rollBarOptions);
}

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use( ensureAuthenticated );

// require all of the files in the routes folder
var normalizedPath = require("path").join(__dirname, "routes-admin");
fs.readdirSync(normalizedPath).forEach(function(file) {
  require("./routes-admin/" + file)(app, express);
});

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    switch( req.path ) {
      case "/login" :
      case "/forgotpassword":
      case "/resetpassword":
      case "/checkme":
      case "/typeform/update/EPf23h":
      case "/typeform/update/EL7VfM":
      case "/typeform/update/YXSviA":
      case "/typeform/update/sMxukk":
        next();
        break;
      default:
        res.redirect('/login')
    }
  }
}
