var React = require('react')
, SessionActions = require('../../actions/auth/SwellSessionActions')
, TaskActions = require('../../actions/swell/SwellTaskActions')
, UserDashboardDeeplinkConstants = require('../../constants/dashboard/UserDashboardDeeplinkConstants.js')
, SessionStore = require('../../store/auth/SwellSessionStore')
, CookieStore = require('../../store/CookieStore.js')
;

var UserDashboardLoginSignupView = React.createClass({

  getInitialState: function() {
    var error = SessionStore.getError();
    var errorMessage = '';
    if( error ) {
      errorMessage = error.message;
    }
    return {
      email: '',
      password: '',
      errorMessage: errorMessage,
      view: this.props.view,
      isLoading: false
    };
  },

  componentDidMount: function() {
    SessionStore.addChangeListener(this.onChange);
    var event = "SignUpPage_View";
    if( this.state.view == "login" ) {
      event = "LoginPage_View";
    }
    this.props.tracker.track(event);
  },

  componentWillUnmount: function() {
    SessionStore.removeChangeListener(this.onChange);
  },

  handleEmailKeyPress: function(event) {
    if(event.charCode==13){
      if( this.state.view == "login" ) {
        return this.handleLogin(event);
      }
      this.handleSignup(event);
    }
  },

  handleLoading : function(){
    this.setState({
      isLoading: true
    });
  },

  handlePasswordKeyPress: function(event) {
    if(event.charCode==13){
      if( this.state.view == "login" ) {
        return this.handleLogin(event);
      }
      this.handleSignup(event);
    }
  },
  /**
  * @return {object}
  */
  render: function() {

    var mainButton;
    var secondaryButtons = [];
    var message = "";
    var subtitle = "";
    var mainImage = "";
    var subCopy;
    var backgroundImage = {};

    if (this.state.view == "login" && this.state.isLoading == false) {
      mainImage = <img className="signin-image"></img>
      message = "Sign in now to see your Swellist"
      mainButton = <input type="button" className="Button" onClick={this.handleLogin} value="Login"/>;
      secondaryButtons.push(<a className="auth-link" onClick={this.handleSignupLink} key="secondary-button-1"><h6>Not a
        user? Sign up now</h6></a>);
      secondaryButtons.push(<a className="auth-link" onClick={this.handleForgotPassword} key="secondary-button-2"><h6>
        Forgot password</h6></a>);
    } else if  (this.state.view != "login" && this.state.isLoading == false ){
      backgroundImage = {'backgroundImage': "url('http://static.swellist.com/images/signup-background@1x.png')", 'backgroundPosition': 'bottom'};
      mainImage = <img className="step-1" src="http://static.swellist.com/images/ftue/step-0.png"></img>
      message = "Sign Up";
      subCopy = <p className="form-signin-subheading" style={{"textAlign": "left"}}>Start getting help from Swellist now.</p>
      mainButton = <input type="button" className="Button" onClick={this.handleSignup} value="Sign Up" />;
      secondaryButtons.push(<a className="auth-link" onClick={this.handleLoginLink} key="secondary-button-1"><h6>Already a user? Log in.</h6></a>);
    } else if (this.state.view == "login" && this.state.isLoading == true){
      mainImage = <img className="signin-image"></img>
      message = "Sign in now to see your Swellist";
      mainButton = <input type="button" className="Button" disabled value="loading"/>;
    } else {
      backgroundImage = {'backgroundImage': "url('http://static.swellist.com/images/signup-background@1x.png')", 'backgroundPosition': 'bottom'};
      mainImage = <img className="step-1" src="http://static.swellist.com/images/ftue/step-0.png"></img>
      message = "Sign Up";
      subCopy = <p className="form-signin-subheading">Start getting help from Swellist now.</p>
      mainButton = <input type="button" className="Button" disabled value="loading" />;
    }
    return (

      <section id="auth" className="onboarding-box onboarding-holding-box" style={backgroundImage}>
        <div className="form-box" style={{'background': 'transparent'}}>
          <div className="mainImage">
            {mainImage}
          </div>
          <h6 className="form-signin-heading text-center">{message}</h6>
          {subCopy}
          <div className="rederror">{this.state.errorMessage}</div>
          <form className="password-form">
            <div className="inputbox-container">
              <span className="fa fa-user"></span>
              <input type="email" placeholder="Email" id="email" className="form-control-email" onChange={this.handleEmailChange} onKeyPress={this.handleEmailKeyPress}></input><br/>
            </div>
            <div className="inputbox-container">
              <span className="fa fa-lock"></span>
              <input type="password" placeholder="Password" id="password" className="form-control-password" onChange={this.handlePasswordChange} onKeyPress={this.handlePasswordKeyPress}></input><br/>
            </div>
          </form>
          <div className="signButtons">
            {mainButton}
          </div>
          <div className="auth-Links">
            {secondaryButtons}
          </div>
        </div>

      </section>
    );
  },

  handleSignup: function(event) {
    this.handleLoading();

    var signupOptions = {
      email: this.state.email,
      password: this.state.password
    }
    var campaign = CookieStore.getCookieValueForKey("campaign");
    if(campaign) {
      signupOptions.campaign = campaign;
    }
    SessionActions.signUp(signupOptions);
    this.props.tracker.track("SignUpPage_Click", {"target": "signup"});
  },

  handleLogin: function(event) {
    TaskActions.clear();
    // dispatch a create session action if the token is not in the cookie
    SessionActions.login({
      email: this.state.email,
      password: this.state.password
    });
    this.props.tracker.track("LoginPage_Click", {"target": "login"});
  },

  handleForgotPassword: function(event) {
    location.href='/forgotpassword';
    this.props.tracker.track("LoginPage_Click", {"target": "forgotpassword"});
  },

  handleSignupLink: function(event) {
    this.props.handleViewComplete({
      success:false,
      nextRoute: UserDashboardDeeplinkConstants.SIGNUP
    });
    this.props.tracker.track("LoginPage_Click", {"target": "signup_link"});
  },

  handleLoginLink: function(event) {
    this.props.handleViewComplete({
      success:false,
      nextRoute: UserDashboardDeeplinkConstants.LOGIN
    });
    this.props.tracker.track("SignUpPage_Click", {"target": "login_link"});
  },

  handleEmailChange: function(e) {
    this.setState({email: e.target.value});
  },

  handlePasswordChange: function(e) {
    this.setState({password: e.target.value});
  },

  onChange: function() {
    var isLoggedIn = SessionStore.getIsLoggedIn();
    if (!isLoggedIn) {
      var error = SessionStore.getError();
      var errorMessage = '';
      if( error ) {
        errorMessage = error.message;
      }
      this.setState({errorMessage: errorMessage, isLoading: false});
      var eventName = "SignUpPage_Error";
      if( this.state.view == "login" ) {
        eventName = "LoginPage_Error";
      }
      this.props.tracker.track(eventName, {"message": errorMessage});
    } else {
      this.props.handleViewComplete({success:true});
    }
  }

});

module.exports = UserDashboardLoginSignupView;
