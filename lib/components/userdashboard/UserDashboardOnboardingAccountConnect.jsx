
var React = require('react')
    , SwellUserStore = require('../../store/swell/SwellUserStore.js')
    , UserDashboardDeeplinkConstants = require('../../constants/dashboard/UserDashboardDeeplinkConstants.js')
    , CampaignUtilities = require('../../utilities/CampaignUtilities.js')
    , CampaignConstants = require('../../constants/CampaignConstants.js')
    ;

var UserDashboardOnboardingAccountConnect = React.createClass({
    componentDidMount: function() {
        mixpanel.track("ConnectAccountPage_View");
    },
    componentWillUnmount: function() {
    },
    handleGcalClick: function(event) {
      event.preventDefault();
      this.props.tracker.track("ConnectAccountPage_Click", {"target":"google-cal"});
      this.props.handleViewComplete({"link": "/auth/google"});
    },
    handleWunderlistConnectClick: function(event) {
      event.preventDefault();
      this.props.handleViewComplete({"link":"/wunderlist/auth?next=dashboard"});
      this.props.tracker.track("ConnectAccountPage_Click", {"target":"wunderlist"});
    },
    handleUploadListClick: function(event) {
      event.preventDefault();
      var typeformLink = "https://swellist.typeform.com/to/YXSviA?uid=" + SwellUserStore.getUid() + "&email=" + SwellUserStore.getEmail();
      this.props.tracker.track("ConnectAccountPage_Click", {"target":"upload"});
      this.props.handleViewComplete({"link":typeformLink});
    },
    handleSuccessClick: function(event) {
      event.preventDefault();
      this.props.handleViewComplete({"nextRoute":UserDashboardDeeplinkConstants.SUCCESS});
      mixpanel.track("ConnectAccountPage_Click", {"target":"success"});
    },
    render: function () {
        var backgroundImage = {'backgroundImage': "url('http://static.swellist.com/images/signup-background@1x.png')", 'backgroundSize': "cover", 'backgroundPosition': 'center bottom'};
        return (
            <div className="onboarding-holding-box" style={backgroundImage}>
                <div className="onboarding-box" style={{"backgroundColor": "transparent"}}>
                    <div className="form-box" style={{"backgroundColor": "transparent"}}>
                        <img className="step-3" src="http://static.swellist.com/images/ftue/step-2.png" alt="progress-image"/>
                        <h1 className="form-signin-heading text-center ">Sync Your Accounts</h1>
                        <p className="form-signin-subtitle text-center sync-text ">Now connect your existing accounts or share a photo of your notes so Swellist can personalize your feed.</p>
                        <ul className="account-connect-table">
                          <li><div className="sync-gcal" alt="upload"></div><h6>Google Cal</h6><button onClick={this.handleGcalClick} className="sync-button">Sync</button></li>
                          <li><div className="sync-upload" alt="upload"></div><h6>Screenshot</h6><button onClick={this.handleUploadListClick} className="sync-button">Upload</button></li>
                          <li><div className="sync-wunderlist" alt="wunderlist"></div><h6>Wunderlist</h6><button onClick={this.handleWunderlistConnectClick} className="sync-button">Sync</button></li>
                          <li><div className="sync-reminders" alt="reminders"></div><h6>iOS Reminders</h6><p className="coming-soon">Coming<br></br>Soon</p></li>
                        </ul>
                        <button onClick={this.handleSuccessClick} key="secondary-button-1" className="sync-button big-button">Next</button>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = UserDashboardOnboardingAccountConnect;
