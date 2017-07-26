var React = require('react')
    , SwellUserStore = require('../../store/swell/SwellUserStore.js')
    , UserDashboardDeeplinkConstants = require('../../constants/dashboard/UserDashboardDeeplinkConstants.js')
    , CampaignUtilities = require('../../utilities/CampaignUtilities.js')
    , CampaignConstants = require('../../constants/CampaignConstants.js')
    ;

var UserDashboardOnboardingQuiz = React.createClass({
    getInitialState: function() {
        return {
            uid: SwellUserStore.getUid(),
            isLoading: true
        };
    },
    componentDidMount: function() {
        mixpanel.track("SignUpQuiz_View");
        SwellUserStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        SwellUserStore.removeChangeListener(this._onChange);
    },
    render: function () {
        // TODO: Pull these from typeform-config.json

        var baseTypeformLink = "https://swellist.typeform.com/to/";
        var quizId = "z8O3tE";
        switch(CampaignUtilities.getBaseCampaignKey(SwellUserStore.getCampaign())) {
          case CampaignConstants.GOAL_RUNNING:
            quizId = "Ba4KKi";
            break;
          case CampaignConstants.GOAL_PRODUCTIVITY:
            quizId = "cDBkJO";
            break;
          default:
            break;
        }
        var typeformLink = baseTypeformLink + quizId + "?uid="+SwellUserStore.getUid()+"&email="+SwellUserStore.getEmail();
        var loadSpinner;
      if (this.state.isLoading) {
        loadSpinner = (
          <div className="fade-in" style={{display:"flex", alignItems: "center", justifyContent: "center", paddingTop: "100px", paddingBottom: "100px",  height: "100%", width: "100%"}}>
            <img src="http://static.swellist.com/images/swellist-circle-loader.gif"
                 style={{width:"100px", height:"100px"}}/>
          </div>
        );
      } else {
        loadSpinner = ("");
      }
        return (
            <div className="onboarding-holding-box">
                {loadSpinner}
                <iframe id="typeform-full" width="100%" height="100%" frameBorder="0" src={typeformLink} onLoad={this._iframeLoaded}></iframe>
            </div>
        );
    },
   _iframeLoaded: function() {
     this.setState({
       isLoading: false
     })
   },
    _onChange: function() {
        this.setState({
            uid: SwellUserStore.getUid()
        });
    }
});

module.exports = UserDashboardOnboardingQuiz;
