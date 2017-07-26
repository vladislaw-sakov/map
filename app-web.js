/**
* Module dependencies.
*/

env = require('./env');

var express = require('express')
, http = require('http')
, morgan = require('morgan')
, bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, methodOverride = require('method-override')
, session = require('express-session')
, errorhandler = require('errorhandler')
, path = require('path')
, fs = require('fs')
, Memcached = require('memcached') //require('lifelist-common').Memcached for mock object
, DualCacheDbStore = require('./lib/store/DualCacheDbStore')(session)
, passport = require('passport')
, flash = require('connect-flash')
, hbs = require('hbs')
, favicon = require('serve-favicon')
, ErrorConsts = require('./lib/store/ErrorConsts')
, AWS = require('aws-sdk');
rollbar = require('rollbar');

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
// TODO: put this into a manager
cacheNodes = [];
app_memcached = null;

cacheNodes.push( env.current.memcachedEndpoint );
console.log( 'cacheNodes = ' + cacheNodes );

app_memcached = new Memcached( cacheNodes );
app_memcached.on('failure', function( details ){ sys.error( "Server " + details.server + "went down due to: " + details.messages.join( '' ) ) });

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// all environments
app.set('port', process.env.PORT || 3030);
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
// var partialsPath = __dirname + '/views-web/partials';
// hbs.registerPartials(partialsPath);

app.use(favicon(__dirname+'/public/images/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());
var sessionStore = new DualCacheDbStore({});
app.use(session({
  secret: 'n3wy0rkf17ckinc1ty',
  store: sessionStore,
  saveUninitialized: true,
  resave: true
}));

// this must be above the ensureAuthenticated so that public files are served
app.use(express.static(path.join(__dirname, 'public-web')));
app.use(express.static('app'));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Force https for get requests on prod
// app.use(function(req, res, next) {
//   //console.log(env.name, req.get('X-Forwarded-Proto'), req.method, 'https://' + req.get('Host') + req.url);
//   return next();
//   if( env.name == "production" && (req.get('X-Forwarded-Proto') !== 'https') && req.method == 'GET' ) {
//     res.redirect('https://' + req.get('Host') + req.url);
//   }  else {
//     next();
//   }
// });

app.use((req, res, next)=>{
  if( req.query.campaign ) {
    res.cookie('campaign', req.query.campaign, {"path":'/'});
  }
  return next();
});

app.use( ensureAuthenticated );

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// require all of the files in the routes folder
var normalizedPath = require("path").join(__dirname, "routes-web");
fs.readdirSync(normalizedPath).forEach(function(file) {
  require("./routes-web/" + file)(app, express);
});
app.all('*', function(req, res) { //if no route is found
  res.render('404.hbs');
});

if( env.name != "development" ) {
  rollbar.init("d10a6bc838ae4a64b5c2a20de937ffd5", {
    environment: env.name
  });
  app.use(rollbar.errorHandler('d10a6bc838ae4a64b5c2a20de937ffd5'));
  var rollBarOptions = {
    // Call process.exit(1) when an uncaught exception occurs but after reporting all
    // pending errors to Rollbar.
    //
    // Default: false
    exitOnUncaughtException: true
  };
  rollbar.handleUncaughtExceptions("d10a6bc838ae4a64b5c2a20de937ffd5", rollBarOptions);
}

http.createServer(app).listen(app.get('port'), function(){
  //console.log(require('lifelist-common').UserPasswordManager.encrypt("PAD1:8"));
  console.log('Express server listening on port ' + app.get('port'));
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  return next();
  if (req.isAuthenticated()) {
    return next();
  } else {
    switch(req.path) {
      case "/":
      case "/checkme":
      case "/dashboard":
      case "/redirect":
      case "/forgotpassword":
      case "/resetpassword":
      case "/swellist":
      case "/landing":
      case "/terms":
      case "/faqs":
      case "/how":
      case "/what":
      case "/createpassword":
      case "/wunderlist":
      case "/wunderlist/auth":
      case "/wunderlist/signup":
      case "/wunderlist/update":
      case "/wunderlist/callback":
      case "/wunderlist/user":
      case "/wunderlist/success":
        next();
        break;
      default:
      res.render('404.hbs');
    }
  }
}

// Add success and fail methods to response
express.response.success = function(data) {
  this.json({success: true, "data": data});
};
express.response.fail = function(code, message) {
  this.json({success: false, "code": code, "message": message});
};
