/**
 * Created by liztron on 5/27/16.
 */

var React = require('react')
  , SwellUserStore = require('../../store/swell/SwellUserStore.js')
  , UserDashboardDeeplinkConstants = require('../../constants/dashboard/UserDashboardDeeplinkConstants.js')
  , CampaignUtilities = require('../../utilities/CampaignUtilities.js')
  , CampaignConstants = require('../../constants/CampaignConstants.js')
  ;

var UserDashboardOnboardingSuccessView = React.createClass({
  componentDidMount: function() {
    mixpanel.track("OnboardingSuccess_View");
  },
  componentWillUnmount: function() {
  },
  handleNextClick: function(event) {
    event.preventDefault();
    this.props.tracker.track("OnboardingSuccess_Click", {"target":"feed"});
    this.props.handleViewComplete({"nextRoute":UserDashboardDeeplinkConstants.TIPS});
  },
  render: function () {
    var backgroundImage = {'backgroundImage': "url('http://static.swellist.com/images/signup-background@1x.png')", 'backgroundSize': "cover", 'backgroundPosition': 'center bottom'};
    return (
      <div className="onboarding-holding-box" style={backgroundImage}>
        <div className="onboarding-box" style={{"backgroundColor": "transparent"}}>
          <div className="form-box" style={{"backgroundColor": "transparent"}}>
            <img className="step-1" src="http://static.swellist.com/images/ftue/step-3.png" alt="progress-image"/>
            <h1 className="form-signin-heading text-center ">HOW TO USE SWELLIST</h1>
            <img className="how-to-gif" src="http://static.swellist.com/images/feed/success-1.gif" alt="progress-image" style={{"backgroundColor": "rgba(255,255,255, 0.5)", "marginTop": "24px", "marginBottom": "24px", "maxWidth": "100%"}}/>
            <button onClick={this.handleNextClick} key="secondary-button-1" className="sync-button big-button">View Feed</button>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = UserDashboardOnboardingSuccessView;
