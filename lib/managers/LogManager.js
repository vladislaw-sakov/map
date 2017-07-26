var Slack = require('node-slack')
    , slack = new Slack( 'simplelabs', env.current.slack.key );

LOG_LEVEL_CONSOLE = 0;
LOG_LEVEL_ROLLBAR = 1;
LOG_LEVEL_SLACK = 2;
module.exports.LOG_LEVEL_ROLLBAR = LOG_LEVEL_ROLLBAR;
module.exports.LOG_LEVEL_SLACK = LOG_LEVEL_SLACK;
module.exports.LOG_LEVEL_CONSOLE = LOG_LEVEL_CONSOLE;

var log = function (msg, level) {
    switch(level) {
        case 2:
            slack.send({text: msg, channel: "#ops", username: "LogManager"});
        case 1:
            if(env.name != "development") { rollbar.reportMessage(msg); }
        default:
            console.log(msg);
    }
}
module.exports.log = log;

var logError = function( message, error ) {
    if( !error ) {
        error = new Error("default error");
    }
    message += "\n" + error.message;
    message += "\n" + error.stack;
    log( message, LOG_LEVEL_ROLLBAR );
}
module.exports.logError = logError;
