/**
 * Created by robby on 2/3/16.
 */

var SignupFeedInitializeBot = require('../lib/bots/SignupFeedInitializeBot.js')
    ;

module.exports = function(app, express) {
    app.get('/:version/user/:uid/bots/run/:botId', (req, res) => {
        var uid = req.params.uid;
        var botId = req.params.botId;
        var bot;
        switch( botId ) {
            case 'ftue':
                break;
            case 'wunderlist':
                bot = new SignupFeedInitializeBot(uid);
                break;
        }
        if( typeof bot.run == 'function' ) {
            bot.run();
        }

        res.success({});
    });
};
