env = require('./env');

var JobManager = require('./lib/managers/JobManager')
    , AWS = require('aws-sdk')
    , Memcached = require('memcached')
    , express = require('express')
    , app = express()
    , errorhandler = require('errorhandler')
    ;

rollbar = require('rollbar');

AWS.config.update({apiVersion:"2012-08-10"});
AWS.config.update({sslEnabled:false});
AWS.config.update({region:env.current.aws.region});
if( env.current.aws.endpoint ) {
    AWS.config.update({endpoint:env.current.aws.endpoint});
}

dynamodb = new AWS.DynamoDB();
docClient = new AWS.DynamoDB.DocumentClient();

cacheNodes = [];
app_memcached = null;

cacheNodes.push( env.current.memcachedEndpoint );
app_memcached = new Memcached( cacheNodes );
app_memcached.on('failure', function( details ){ sys.error( "Server " + details.server + "went down due to: " + details.messages.join( '' ) ) });

app.set('port', process.env.PORT || 3080);
app.get('/jobrunner', function(req, res) {
    JobManager.runJobs(function() { console.log("Finished running jobs."); res.sendStatus(200); });
});

app.get('/checkme', function(req, res) {
    res.success({status: "ok"});
});

if( env.name != "development" ) {
    rollbar.init("7bfa52938606455c87d52ed1909f9bfd", {
        environment: env.name
    });
    app.use(rollbar.errorHandler('7bfa52938606455c87d52ed1909f9bfd'));
    var rollBarOptions = {
        // Call process.exit(1) when an uncaught exception occurs but after reporting all
        // pending errors to Rollbar.
        //
        // Default: false
        exitOnUncaughtException: true
    };
    rollbar.handleUncaughtExceptions("7bfa52938606455c87d52ed1909f9bfd", rollBarOptions);
} else {
  app.use(errorhandler());
}

var server = app.listen(app.get('port'), function() {
    console.log('Listening on port %d', server.address().port);
});


var typeformConfig = require( './lib/managers/typeform/typeform-config.json')
, quizConfigs = typeformConfig.quizConfigs
, TypeformManager = require('./lib/managers/TypeformManager.js')
;


var quizIds = [];
for(var quizId in quizConfigs) {
  quizIds.push(quizId);
}
setInterval(function(){
    "use strict";
    for( let quizId of quizIds ) {
        TypeformManager.updateQuizById(quizId, (err, data)=>{
          if(err) {
            console.log(err.message);
          }
          if(data) {
            console.log(data);
          }
        });
    }
    JobManager.runJobs(function() { console.log("Finished running jobs."); });
}, 15 * 1000);
