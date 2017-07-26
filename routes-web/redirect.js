var Mixpanel = require('mixpanel')
, mixpanel = Mixpanel.init(env.current.mixpanel.token)
, Slack = require('node-slack')
, slack = new Slack( 'simplelabs', env.current.slack.key )
, request = require('request-json')
, zapierClient = request.createClient('https://zapier.com')
;

module.exports = function(app, express) {
  app.get('/r', (req, res)=>{
    var next = decodeURIComponent(req.query.n);
    var event = req.query.event ? req.query.event : "Link_Redirect";
    var uid = req.query.uid ? req.query.uid : "";
    var target = req.query.target ? req.query.target : "";
    var properties = {
      "url": next,
      "uid": uid,
      "distinct_id": uid,
      "target": target
    }
    console.log(properties);
    //TrackingHelper.track("Dashboard_Click", {"target": "tile_link_click", "uid": this.props.streamObject.uid});
    res.redirect(next);

    //https://zapier.com/hooks/catch/592021/278f0y/
    var zapData = Object.assign({"event": event}, properties);
    zapierClient.post('/hooks/catch/592021/278f0y/', zapData, (err, res, body)=>{
      if(err) {
        console.log(err);
      }
      if(body) {
        console.log(body);
      }
    });

    var message = "";
    message = event + " - " + JSON.stringify(properties || {});
    message += "\n<"+env.current.admin_url+"/user/"+ uid +"/feeddashboard>";
    slack.send({
        text: message,
        channel: "#user_actions",
        username: "SimpleTrack"
    });

    mixpanel.track(event, properties);
  });
}
