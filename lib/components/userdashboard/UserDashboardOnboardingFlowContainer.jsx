var React = require('react')
, UserDashboardLoginSignupView = require('./UserDashboardLoginSignupView.jsx')
, UserDashboardDeeplinkConstants = require('../../constants/dashboard/UserDashboardDeeplinkConstants.js')
, UserDashboardOnboardingQuiz = require('./UserDashboardOnboardingQuiz.jsx')
, UserDashboardOnboardingAccountConnect = require('./UserDashboardOnboardingAccountConnect.jsx')
, UserDashboardOnboardingPaymentView = require('./UserDashboardOnboardingPaymentView.js')
, UserDashboardOnboardingSuccessView = require('./UserDashboardOnboardingSuccessView')
, SwellUserStore = require('../../store/swell/SwellUserStore.js')
, SwellAPIUtils = require('../../api/swell/SwellAPIUtils.js')
, apiUtils = new SwellAPIUtils({baseUrl: API_URL});
;

var UserDashboardOnboardingFlowContainer = React.createClass({

  goToPageByRoute: function(route) {
    location.hash = "#" + route;
  },

  handleViewComplete: function(options) {

    switch(this.props.route) {
      case UserDashboardDeeplinkConstants.SIGNUP:
        if( options.success ) {
          this.goToPageByRoute(UserDashboardDeeplinkConstants.QUIZ);
        } else {
          this.goToPageByRoute(options.nextRoute);
        }
        break;
      case UserDashboardDeeplinkConstants.QUIZ:
        this.goToPageByRoute(UserDashboardDeeplinkConstants.ACCOUNT_CONNECT);
        break;
      case UserDashboardDeeplinkConstants.ACCOUNT_CONNECT:
        if(options && options.link) {
          window.location = options.link;
        } else if(options && options.nextRoute){
          this.goToPageByRoute(options.nextRoute);
        } else {
          this.goToPageByRoute(UserDashboardDeeplinkConstants.SUCCESS);
        }
        break;
      case UserDashboardDeeplinkConstants.SUCCESS:
        this.goToPageByRoute(UserDashboardDeeplinkConstants.TIPS);
        break;
      case UserDashboardDeeplinkConstants.ONBOARDING_PAYMENT:
        this.goToPageByRoute(UserDashboardDeeplinkConstants.TIPS);
        break;
      case UserDashboardDeeplinkConstants.LOGIN:
        if( options.success ) {
          this.goToPageByRoute(UserDashboardDeeplinkConstants.NOTEPAD);
        } else {
          this.goToPageByRoute(options.nextRoute);
        }
        break;
    }
  },
  render: function () {
    var uid = SwellUserStore.getUid();
    switch(this.props.route) {
      case UserDashboardDeeplinkConstants.SIGNUP:
        return <UserDashboardLoginSignupView view="signup" handleViewComplete={this.handleViewComplete} key={"login-"+Math.random()*100} tracker={this.props.tracker}/>;
        break;
      case UserDashboardDeeplinkConstants.QUIZ:
        return <UserDashboardOnboardingQuiz route={this.props.route} handleViewComplete={this.handleViewComplete} tracker={this.props.tracker}/>;
        break;
      case UserDashboardDeeplinkConstants.ONBOARDING_PAYMENT:
        return <UserDashboardOnboardingPaymentView handleViewComplete={this.handleViewComplete} tracker={this.props.tracker} uid={uid} apiUtils={apiUtils}/>;
        break;
      case UserDashboardDeeplinkConstants.ACCOUNT_CONNECT:
        return <UserDashboardOnboardingAccountConnect route={this.props.route} handleViewComplete={this.handleViewComplete} tracker={this.props.tracker}/>;
        break;
      case UserDashboardDeeplinkConstants.SUCCESS:
        return <UserDashboardOnboardingSuccessView route={this.props.route} handleViewComplete={this.handleViewComplete} tracker={this.props.tracker}/>;
        break;
      case UserDashboardDeeplinkConstants.LOGIN:
        return <UserDashboardLoginSignupView view="login" handleViewComplete={this.handleViewComplete} key={"login-"+Math.random()*100} tracker={this.props.tracker}/>;
      break;
    }
  }
});

module.exports = UserDashboardOnboardingFlowContainer;
