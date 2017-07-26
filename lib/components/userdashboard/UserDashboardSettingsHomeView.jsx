var React = require('react')
  , UserDashboardLogoutModalView = require('./UserDashboardLogoutModalView.jsx')
  , Modal = require('../modal/swellist-modal.js')
  , UserStore = require('../../store/swell/SwellUserStore.js')
  , SessionActions = require('../../actions/auth/SwellSessionActions.js')
  ;

var UserDashboardSettingsHomeView = React.createClass({
  handleAboutClick: function (event) {
    event.preventDefault();
    window.open("https://swellist.com/swellist");
    return false;
  },
  handleLogoutClick: function (event) {
    this.refs.logoutModal.openModal();
  },
  handleDialogClose: function(event){
    this.refs.logoutDialog.hide();
  },
  render: function () {
    var actionDialog = {
      borderRadius: '10px',
      backgroundColor: '#fff',
      width: '95%',
      height: '250px',
      marginTop: '-100px',
      marginLeft: '-47%'
    };
    var actionButtonStyle = {
      fontSize: '1.4em',
      right: '0px',
      top: '0px',
      paddingRight: '10px',
      textAlign: 'right',
      backgroundColor: '#5FCFB6',
      width: '100%',
      color: 'white',
      borderRadius: '10px 10px 0 0'
    };
    var user = UserStore.getUserData();
    var phone;
    if (user) {
      var email = user.email ? user.email : "";
      phone = user.phone ? user.phone.slice(4) : "";
      var name = user.name ? user.name : "";
      var location = user.location_name ? user.location_name : "";
      var timeZone = user.timezone ? user.timezone : "";
      var birthday = user.birthday ? user.birthday : "";
    }
    return (
      <div className="Settings-view">
        <div className="SettingsTable">
          <div className="Settings-field" onClick={this.props.goToName}>
            <div className="Settings-copy"><span className="Settings-title">Name:</span> {name}</div>
            <span className="SettingsTable-button"> > </span>
          </div>
          <div className="Settings-field" onClick={this.props.goToEmail}>
            <div className="Settings-copy"><span className="Settings-title">Email:</span> {email}</div>
            <span className="SettingsTable-button"> > </span>
          </div>
          <div className="Settings-field" onClick={this.props.goToLocation}>
            <div className="Settings-copy"><span
              className="Settings-title">Location:</span> {location}</div>
            <span className="SettingsTable-button"> > </span>
          </div>
          <div className="Settings-field" onClick={this.props.goToBirthday}>
            <div className="Settings-copy"><span className="Settings-title">Birthday:</span> {birthday}</div>
            <span className="SettingsTable-button"> > </span>
          </div>
          <div className="Settings-field" onClick={this.props.goToPhone}>
            <div className="Settings-copy"><span className="Settings-title">Phone Number:</span> {phone}</div>
            <span className="SettingsTable-button"> > </span>
          </div>
          <div className="Settings-field" onClick={this.props.goToConnectAccounts}>
            <div className="Settings-copy"><span className="Settings-title">Connect Accounts</span></div>
            <span className="SettingsTable-button"> > </span>
          </div>
          <div className="Settings-field" onClick={this.handleLogoutClick}>
            <div className="Settings-copy"><span
              className="Settings-title">Logout</span></div>
            <span className="SettingsTable-button"> > </span>
          </div>
        </div>
        <UserDashboardLogoutModalView ref="logoutModal" _logout={this._logout} />
      </div>
    );
  },

  _logout: function () {
    SessionActions.logout();
  }
});

module.exports = UserDashboardSettingsHomeView;
