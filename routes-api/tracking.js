var Slack = require('node-slack')
, slack = new Slack( 'simplelabs', env.current.slack.key )
, request = require('request-json')
, zapierClient = request.createClient('https://zapier.com')
;

module.exports = function( app, express ) {
  app.post( '/:version/trackevent', function( req, res ) {
    var version = req.params.version;
    if(version == 'v3'){
      function sendSlackMessage(message) {
        slack.send({
          text: message,
          channel: "#user_actions",
          username: "SimpleTrack"
        });
      }
      function sendToZapier(eventName, props) {
        //https://zapier.com/hooks/catch/592021/278f0y/
        var zapData = Object.assign({"event": eventName}, props);
        zapierClient.post('/hooks/catch/592021/278f0y/', zapData, (err, res, body)=>{
          if(err) {
            console.log(err);
          }
          if(body) {
            console.log(body);
          }
        });
      }
      var events = req.body.events || [];
      for(event of events) {
        var eventName = event.event;
        var props = event.properties;
        var uid = props.uid;
        switch(eventName) {
          case "Dashboard_Click":
            var target = props.target;
            switch(target) {
              case "rating":
              case "nav_feed":
                sendToZapier(eventName, props);
                var message = "";
                message = eventName + " - " + JSON.stringify(props || {});
                message += "\n<"+env.current.admin_url+"/user/"+ uid +"/feeddashboard>";
                sendSlackMessage(message);
                break;
            }
            break;
          case "Notepad_Action":
            sendToZapier(eventName, props);
            var message = eventName + " - " + JSON.stringify(props || {});
            message += "\n<"+env.current.admin_url+"/user/"+ uid +"/feeddashboard>";
            sendSlackMessage(message);
          default:
          break;
        }
      }
    }
    res.success();
  });
};
