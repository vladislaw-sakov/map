import React from 'react';
import SwellUserStore from '../../store/swell/SwellUserStore.js';

class AccountConnectForm extends React.Component {
  constructor(props) {
      super(props);
      this.handleNotepadClick = this.handleNotepadClick.bind(this);
      this.handleWunderlistConnectClick = this.handleWunderlistConnectClick.bind(this);
      this.handleUploadListClick = this.handleUploadListClick.bind(this);
      this.handleRemindersClick = this.handleRemindersClick.bind(this);
      this.handleEvernoteClick = this.handleEvernoteClick.bind(this);
      this.handleCancelClick = this.handleCancelClick.bind(this);
  }

  handleNotepadClick(event) {
    event.preventDefault();
    this.props.tracker.track("ConnectAccountPage_Click", {"target":"wunderlist"});
    this.props.handleViewComplete();
  }

  handleWunderlistConnectClick(event) {
    event.preventDefault();
    this.props.handleViewComplete();
    window.location = "/wunderlist/auth?next=dashboard"
    this.props.tracker.track("ConnectAccountPage_Click", {"target":"wunderlist"});
  }

  handleUploadListClick(event) {
    event.preventDefault();
    var typeformLink = "https://swellist.typeform.com/to/YXSviA?uid=" + SwellUserStore.getUid() + "&email=" + SwellUserStore.getEmail();
    window.location = typeformLink;
    this.props.tracker.track("ConnectAccountPage_Click", {"target":"upload"});
  }

  handleGoogleClick(event) {
    event.preventDefault();
    var googleLink = "/auth/google?nextHash=profile";
    window.location = googleLink;
    this.props.tracker.track("ConnectAccountPage_Click", {"target":"upload"});
  }

  handleRemindersClick(event){
    event.preventDefault();
    mixpanel.track("ConnectAccountPage_Click", {"target":"iosreminders"});
    this.props.handleViewComplete();
  }

  handleEvernoteClick(event){
    event.preventDefault();
    mixpanel.track("ConnectAccountPage_Click", {"target":"evernote"});
    this.props.handleViewComplete();
  }

  handleCancelClick(event) {
    event.preventDefault();
    this.props.handleViewComplete();
    mixpanel.track("ConnectAccountPage_Click", {"target":"cancel"});
  }

  render() {
      return (
        <div className="form-box" style={{"padding": "0px"}}>
            <img className="step-3" src="http://static.swellist.com/images/ftue/step-2.png" alt="progress-image"/>
            <h1 className="form-signin-heading text-center ">Sync Your Accounts</h1>
            <p className="form-signin-subtitle text-center sync-text ">Now connect your existing accounts or take a photo of any notes you would like to share with us.</p>
            <ul className="account-connect-table">
              <li><div className="sync-gcal" alt="upload"></div><h6>Google Cal</h6><button onClick={this.handleGoogleClick} className="sync-button">Sync</button></li>
              <li><div className="sync-upload" alt="upload"></div><h6>Screenshot</h6><button onClick={this.handleUploadListClick} className="sync-button">Upload</button></li>
              <li><div className="sync-wunderlist" alt="wunderlist"></div><h6>Wunderlist</h6><button onClick={this.handleWunderlistConnectClick} className="sync-button">Sync</button></li>
              <li><div className="sync-reminders" alt="reminders"></div><h6>iOS Reminders</h6><p className="coming-soon">Coming<br></br>Soon</p></li>
            </ul>
            <button onClick={this.handleCancelClick} key="secondary-button-1" className="sync-button big-button">Finish</button>
        </div>
      );
  }
}
module.exports = AccountConnectForm;
