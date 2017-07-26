var React = require('react')
, SessionActions = require('../../actions/auth/SwellSessionActions.js')
;

var UserDashboardNavbarView = React.createClass({
  handleSwellistClick: function(event) {
    this.props.goToFeed();
    this.props.tracker.track("Dashboard_Click", {"target":"nav_feed", "uid":this.props.uid});
  },
  handleProfileClick: function(event) {
    this.props.goToProfile();
    this.props.tracker.track("Dashboard_Click", {"target":"nav_profile", "uid":this.props.uid});
  },
  handleNotepadClick: function(event) {
    this.props.goToNotepad();
    this.props.tracker.track("Dashboard_Click", {"target":"nav_notepad", "uid":this.props.uid});
  },
  render: function () {
    var left = "Navbar-left";
    var center = "Navbar-center";
    var right = "Navbar-right";
    switch (this.props.view) {
      case "notepad":
        left = "Navbar-left Navbar-active";
        break;
      case "feed":
        center = "Navbar-center Navbar-active";
        break;
      case "profile":
        right = "Navbar-right Navbar-active";
        break;
    }
    var imageUrl = "/img/swellist/profile-icon-thin.png";
    return (
      <div className="Navbar-container">
        <div className="Navbar-barwrapper">
          <div className="Navbar-inner">
            <nav className="Navbar">
              <div className="Navbar-logo-feed" onClick={this.handleNotepadClick}>
                <div className="swellist-logo">Swellist</div>
              </div>
              <div className={left} onClick={this.handleNotepadClick}>
                <h2 className="Navbar-text">Notes</h2>
              </div>
              <div className={center}>
                <h2 className="Navbar-text" onClick={this.handleSwellistClick}>Tips</h2>
              </div>
              <div className={right}>
                <h2 className="Navbar-text" onClick={this.handleProfileClick}>Profile</h2>
              </div>
            </nav>
            </div>
        </div>
      </div>
    );
  }
});

module.exports = UserDashboardNavbarView;


// passed as props, view: feed, profile, notebook
