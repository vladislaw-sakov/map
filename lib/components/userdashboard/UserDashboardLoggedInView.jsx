var React = require('react')
, UserDashboardActions = require('../../actions/dashboard/UserDashboardActions.js')
, UserDashboardDeeplinkConstants = require('../../constants/dashboard/UserDashboardDeeplinkConstants.js')
, Navbar = require('./UserDashboardNavbarView.jsx')
, Feed = require('./UserDashboardFeedContainerView.jsx')
, Profile = require('./UserDashboardProfileContainerView.jsx')
, NotepadView = require('../notes/NotepadView.js')
, NotesStore = require('../../store/notes/NotesStore.js')
, SwellUserStore = require('../../store/swell/SwellUserStore.js')
, TipModalView = require('./tipviews/TipModalView.jsx')
, UserDashboardPaymentView = require('./UserDashboardPaymentView.js')
;

var UserDashboardLoggedInView = React.createClass({
  getInitialState: function() {
    var route = this.props.route;
    return {
      route: route
    }
  },
  componentDidMount: function() {
    // we need to fetch the user data here because many child components use it.
    UserDashboardActions.fetchUserData();
  },
  goToFeed : function() {
    //this.setState({view: "Feed"});
    location.hash = "#" + UserDashboardDeeplinkConstants.TIPS;
  },
  goToProfile : function(){
    //this.setState({view : "Profile"});
    location.hash = "#" + UserDashboardDeeplinkConstants.PROFILE;
  },
  goToNotepad: function() {
    location.hash = "#" + UserDashboardDeeplinkConstants.NOTEPAD;
  },
  handleViewComplete: function() {
    this.goToProfile();
  },
  render: function () {
    var uid = SwellUserStore.getUid();
    if (this.props.route.includes(UserDashboardDeeplinkConstants.PROFILE)) {
      this.props.tracker.track("Dashboard_View", {"target": "profile", "uid": uid});
      return (
        <div className="userDash">
          <div className="Profile-View">
            <Navbar view="profile" goToProfile={this.goToProfile} goToFeed={this.goToFeed} goToNotepad={this.goToNotepad} uid={uid} tracker={this.props.tracker}/>
            <Profile uid={uid} tracker={this.props.tracker}/>
          </div>
        </div>
      )
    } else if(this.props.route.includes(UserDashboardDeeplinkConstants.TIPS)) {
      this.props.tracker.track("Dashboard_View", {"target": "feed", "uid": uid});
      var id = this.props.route.split('/')[2];
      return (
        <div className="userDash">
          {id ? <TipModalView objectId={id} uid={uid} tracker={this.props.tracker} email={SwellUserStore.getEmail()} /> : false}
          <div className={id ? "Feed-view-fixed" : "Feed-View" }>
            <Navbar view="feed" goToProfile={this.goToProfile} goToFeed={this.goToFeed} goToNotepad={this.goToNotepad} uid={uid} tracker={this.props.tracker}/>
            <Feed goToProfile={this.goToProfile} uid={uid} tracker={this.props.tracker} email={SwellUserStore.getEmail()}/>
          </div>
        </div>
      );
    } else if(this.state.route.includes("/payment")) {
      return (
        <div className="userDash">
          <div className="Profile-View">
            <Navbar view="profile" goToProfile={this.goToProfile} goToFeed={this.goToFeed} goToNotepad={this.goToNotepad} uid={uid} tracker={this.props.tracker}/>
            <UserDashboardPaymentView uid={uid} tracker={this.props.tracker} handleViewComplete={this.handleViewComplete} />
          </div>
        </div>
      );
    } else {
      this.props.tracker.track("Dashboard_View", {"target": "notepad", "uid": uid});
      return (
        <div className="userDash">
          <div className="Notepad-View">
            <Navbar view="notepad" goToProfile={this.goToProfile} goToFeed={this.goToFeed} goToNotepad={this.goToNotepad} uid={uid} tracker={this.props.tracker}/>
            <NotepadView uid={uid} tracker={this.props.tracker} notesStore={NotesStore} useLocal={true} />
          </div>
        </div>
      );
    }
  }
});

module.exports = UserDashboardLoggedInView;
