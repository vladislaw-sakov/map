var React = require('react')
, ReactDOM = require('react-dom')
, UserDashboardLoggedInView = require('./UserDashboardLoggedInView.jsx')
, UserDashboardOnboardingFlowContainer = require('./UserDashboardOnboardingFlowContainer.jsx')
, UserDashboardDeeplinkConstants = require('../../constants/dashboard/UserDashboardDeeplinkConstants.js')
, SwellSessionStore = require('../../store/auth/SwellSessionStore.js')
, SessionActions = require('../../actions/auth/SwellSessionActions.js')
, Navbar = require('./UserDashboardNavbarView.jsx')
, OnboardNav = require('./UserDashboardOnboardingNavView.jsx')
, queryString = require('query-string')
, cookie = require('cookie')
, SwellAPIUtils = require('../../api/swell/SwellAPIUtils.js')
, apiUtils = new SwellAPIUtils({baseUrl: API_URL})
, Tracker = require('../../tracking/Tracker.js')
, UserDashboardMessage = require('./UserDashboardMessage')
;

var UserDashboardView = React.createClass({

  getInitialState: function() {
    var cookieData = cookie.parse(document.cookie);
    var isLoggedIn = false;

    if( cookieData.token ) {
      isLoggedIn = true;
    } else {
      isLoggedIn = false;
    }

    var route = window.location.hash.substr(1);
    route = this.validateRoute(route, isLoggedIn);
    return {
      route: route,
      isLoggedIn: isLoggedIn
    }
  },
  componentDidMount: function() {
    window.addEventListener('hashchange', () => {
      var route = window.location.hash.substr(1);
      route = this.validateRoute(route, this.state.isLoggedIn);
      this.setState({
        route: route
      });

    });
  },

  validateRoute: function(route, isLoggedIn) {
    if( route != UserDashboardDeeplinkConstants.SIGNUP &&
        route != UserDashboardDeeplinkConstants.LOGIN &&
        isLoggedIn == false ) {
      route = UserDashboardDeeplinkConstants.LOGIN;
      location.hash ="#" + UserDashboardDeeplinkConstants.LOGIN;
    }
    return route;
  },

  componentWillMount: function() {

    SwellSessionStore.addChangeListener(this._onChange);
    SessionActions.queryCookie();

    var parsed = queryString.parse(location.search);
    if (parsed.hasOwnProperty('uid')) {
      SessionActions.impersonate(parsed.uid);
    }

    this.tracker = new Tracker({
      mixpanel: mixpanel,
      apiUtils: apiUtils
    });

    window.addEventListener('hashchange', () => {
      this.setState({
        route: window.location.hash.substr(1)
      });
    });
  },

  componentWillUnmount: function() {
    SwellSessionStore.removeChangeListener(this._onChange);
  },

  render: function() {
    var userDashboardMessage;
    if(typeof USER_DASHBOARD_MESSAGE !== 'underfined' && USER_DASHBOARD_MESSAGE !== '') {
      var userDashboardMessage = decodeURIComponent(USER_DASHBOARD_MESSAGE);
      USER_DASHBOARD_MESSAGE = '';
      userDashboardMessage = <UserDashboardMessage message={userDashboardMessage} />
    }
    if( this.state.isLoggedIn &&
        this.state.route != UserDashboardDeeplinkConstants.QUIZ &&
        this.state.route != UserDashboardDeeplinkConstants.ACCOUNT_CONNECT &&
        this.state.route != UserDashboardDeeplinkConstants.ONBOARDING_PAYMENT &&
        this.state.route != UserDashboardDeeplinkConstants.SUCCESS &&
        this.state.route != UserDashboardDeeplinkConstants.SIGNUP) {
      return (
        <div>
          <div className="userDash">
            {userDashboardMessage}
            <UserDashboardLoggedInView route={this.state.route} apiUtils={apiUtils} tracker={this.tracker}/>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          {userDashboardMessage}
          <OnboardNav />
          <UserDashboardOnboardingFlowContainer handleOnboardingComplete={this.handleOnboardingComplete} tracker={this.tracker} route={this.state.route}/>
        </div>
      );
    }
  },


  /**
  * Event handler for 'change' events coming from the SessionStore
  */
  _onChange: function() {
    var isLoggedIn = SwellSessionStore.getIsLoggedIn();
    this.setState({
      isLoggedIn: isLoggedIn
    });
  }

});

module.exports = UserDashboardView;

ReactDOM.render(<UserDashboardView />, document.getElementById('react-root'));
