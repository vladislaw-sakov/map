var React = require('react')
  , UserStore = require('../../store/swell/SwellUserStore.js')
  , Home = require('./UserDashboardSettingsHomeView.jsx')
  , Name = require('./UserDashboardChangeNameView.jsx')
  , Email = require('./UserDashboardChangeEmailView.jsx')
  , Location = require('./UserDashboardChangeLocationView.jsx')
  , Birthday = require('./UserDashboardChangeBirthdayView.jsx')
  , Phone = require('./UserDashboardChangePhoneView.jsx')
  , Unwunderlist = require('./UserDashboardChangeWunderlistView.jsx')
  , AccountConnectForm = require('./AccountConnectForm.js')
  ;

var UserDashboardSettingsView = React.createClass({
  getInitialState: function () {
    return {
      user: UserStore.getUserData(),
      edit: "Home"
    }
  },
  componentDidMount: function () {
    UserStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function () {
    UserStore.removeChangeListener(this._onChange);
  },
  goToHome: function (event) {
    this.setState({"edit": "Home"});
    return false;
  },
  handleViewComplete: function(event) {
    this.setState({"edit": "Home"});
    return false;
  },
  goToName: function (event) {
    this.setState({"edit": "Name"});
    return false;
  },
  goToEmail: function (event) {
    this.setState({"edit": "Email"});
    return false;
  },
  goToPhone: function (event) {
    this.setState({"edit": "Phone"});
    return false;
  },
  goToLocation: function (event) {
    this.setState({"edit": "Location"});
    return false;
  },
  goToBirthday: function (event) {
    this.setState({"edit": "Birthday"});
    return false;
  },
  goToConnectAccounts: function(event) {
    this.setState({"edit": "ConnectAccounts"});
    return false;
  },
  goToUnwunderlist: function (event) {
    this.setState({"edit": "Unwunderlist"});
    return false;
  },
  render: function () {
    if (this.state.edit == "Home") {
      return (
        <div className="Settings-view">
          <div className="Progress-header">
            <h6>Account</h6>
          </div>
          <Home goToName={this.goToName} goToEmail={this.goToEmail} goToLocation={this.goToLocation}
                goToTimezone={this.goToTimezone} goToBirthday={this.goToBirthday} goToPhone={this.goToPhone} goToConnectAccounts={this.goToConnectAccounts}
                goToUnwunderlist={this.goToUnwunderlist}/>
        </div>
      )
    } else if (this.state.edit == "Name") {
      return (
        <div className="Settings-view">
          <Name goToHome={this.goToHome}/>
        </div>
      )
    } else if (this.state.edit == "Email") {
      return (
        <div className="Settings-view">
          <Email goToHome={this.goToHome}/>
        </div>
      )
    } else if (this.state.edit == "Location") {
      return (
        <div className="Settings-view">
          <Location goToHome={this.goToHome}/>
        </div>
      )
    } else if (this.state.edit == "Timezone") {
      return (
        <div className="Settings-view">
          <Timezone goToHome={this.goToHome}/>
        </div>
      )
    } else if (this.state.edit == "Birthday") {
      return (
        <div className="Settings-view">
          <Birthday goToHome={this.goToHome}/>
        </div>
      )
    } else if (this.state.edit == "Phone") {
      return (
        <div className="Settings-view">
          <Phone goToHome={this.goToHome}/>
        </div>
      )
    } else if (this.state.edit == "Unwunderlist") {
      return (
        <div className="Settings-view">
          <Unwunderlist goToHome={this.goToHome}/>
        </div>
      )
    } else if(this.state.edit == "ConnectAccounts") {
      return(
        <div className="Settings-view">
          <AccountConnectForm handleViewComplete={this.handleViewComplete}/>
        </div>
      )
    }
  },
  _onChange: function () {
    this.setState({user: UserStore.getUserData()});
  }
});


module.exports = UserDashboardSettingsView;
