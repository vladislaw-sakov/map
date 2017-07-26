var React = require('react')
, SimpleRequest = require('../../utilities/SimpleRequest.js')
, EmailConstants = require('../../constants/email/EmailConstants.js')
;

var simpleRequest = new SimpleRequest();

var AdminBotLauncherView = React.createClass({
    handleFTUETilesClick: function(event) {
        event.preventDefault();
        simpleRequest.get('/v1/user/'+UID+'/bots/run/ftue', {}, ()=>{
            alert("FTUE Tiles bot has been run.")
        });
    },
    handleEmailSend(templateId) {
      simpleRequest.post('/v1/notifications/send', {"uids": [UID], "templateId": templateId}, ()=>{
          var emailType = "";
          switch (templateId) {
            case EmailConstants.NOTES_TEMPLATE_ID:
              emailType = "Notes";
              break;
            case EmailConstants.COMPLETE_PROFILE_TEMPLATE_ID:
              emailType = "Complete Profile";
              break;
            case EmailConstants.UPLOAD_IMAGE_TEMPLATE_ID:
              emailType = "Upload Photo";
              break;
            case EmailConstants.WELCOME_TEMPLATE_ID:
              emailType = "Welcome";
              break;
            case EmailConstants.NEW_TIPS_TEMPLATE_ID:
              emailType = "NewTips";
              break;
            case EmailConstants.ADD_TO_HOMESCREEN_TEMPLATE_ID:
              emailType = "Add to Homescreen";
              break
            case EmailConstants.LAPSED_USER_TEMPLATE_ID:
              emailType = "Lapsed user";
              break
             case EmailConstants.USER_OWN_NOTES_EMAIL:
              emailType = "User own notes";
              break;
            case EmailConstants.USER_SHOW_TIPS_TEMPLATE_ID:
              emailType = "Show tips";
              break;
            case EmailConstants.TRENDING_TIPS_TEMPLATE_ID:
              emailType = "Trending tips";
              break;
            case EmailConstants.WEEK_AHEAD_TEMPLATE_ID:
              emailType = "Week Ahead";
              break;
            case EmailConstants.ALMOST_THERE_TEMPLATE_ID:
              emailType = "Almost There";
              break;
          };
          alert( emailType + " email has been sent.")
      });
    },
    render: function () {
        return (
            <div className="container bots-container">
              <div className="row">
                <div className='col-md-4'>
                  <ul className="list-group">
                    <li className="list-group-item disabled">Generate User Tiles</li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading">FTUE Tile Generator</span>
                      <button type="button" className="btn btn-default send-button" onClick={this.handleFTUETilesClick}>Send</button>
                    </li>
                  </ul>
                </div>
                <div className='col-md-4'>
                  <ul className="list-group">
                    <li className="list-group-item disabled">Send User Email</li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading">Notes Email</span>
                      <button type="button" className="btn btn-default send-button" onClick={()=>{this.handleEmailSend(EmailConstants.NOTES_TEMPLATE_ID)}}>Send</button>
                    </li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading">Complete Profile Email</span>
                      <button type="button" className="btn btn-default send-button" onClick={()=>{this.handleEmailSend(EmailConstants.COMPLETE_PROFILE_TEMPLATE_ID)}}>Send</button>
                    </li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading">Upload Photo Email</span>
                      <button type="button" className="btn btn-default send-button" onClick={()=>{this.handleEmailSend(EmailConstants.UPLOAD_IMAGE_TEMPLATE_ID)}}>Send</button>
                    </li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading">Welcome Email</span>
                      <button type="button" className="btn btn-default send-button" onClick={()=>{this.handleEmailSend(EmailConstants.WELCOME_TEMPLATE_ID)}}>Send</button>
                    </li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading">New Tips Email</span>
                      <button type="button" className="btn btn-default send-button" onClick={()=>{this.handleEmailSend(EmailConstants.NEW_TIPS_TEMPLATE_ID)}}>Send</button>
                    </li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading">Add to Homescreen</span>
                      <button type="button" className="btn btn-default send-button" onClick={()=>{this.handleEmailSend(EmailConstants.ADD_TO_HOMESCREEN_TEMPLATE_ID)}}>Send</button>
                    </li>
                    <li className="list-group-item send-group">
                    <span className="list-group-heading">Lapsed User</span>
                      <button type="button" className="btn btn-default send-button" onClick={()=>{this.handleEmailSend(EmailConstants.LAPSED_USER_TEMPLATE_ID)}}>Send</button>
                    </li>
                  </ul>
                </div>
                <div className='col-md-4'>
                  <ul className="list-group">
                    <li className="list-group-item disabled">Send Custom User Email</li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading">Almost There Email</span>
                      <button type="button" className="btn btn-default send-button" onClick={()=>{this.handleEmailSend(EmailConstants.ALMOST_THERE_TEMPLATE_ID)}}>Send</button>
                    </li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading"><s>Current User Notes Email</s></span>
                      <button type="button" className="btn btn-disabled send-button"><s>Send</s></button>
                    </li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading"><s>Current User Tips Email</s></span>
                      <button type="button" className="btn btn-disabled send-button"><s>Send</s></button>
                    </li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading"><s>Trending Tips Email</s></span>
                      <button type="button" className="btn btn-disabled send-button"><s>Send</s></button>
                    </li>
                    <li className="list-group-item send-group">
                      <span className="list-group-heading"><s>Week Ahead Email</s></span>
                      <button type="button" className="btn btn-disabled send-button"><s>Send</s></button>
                    </li>

                  </ul>
                </div>
              </div>
            </div>
        );
    }
});

module.exports = AdminBotLauncherView;
