var React = require('react')
, UserDashboardProfileProgressView = require('./UserDashboardProfileProgressView.jsx')
, UserDashboardSettingsView = require('./UserDashboardSettingsView.jsx')
;

var UserDashboardProfileContainerView = React.createClass({
  render: function () {
    return (
      <div className="profile">
        <div className="Profile-container container">
            <UserDashboardProfileProgressView tracker={this.props.tracker}/>
            <UserDashboardSettingsView tracker={this.props.tracker}/>
        </div>
      </div>
    );
  }
});

module.exports = UserDashboardProfileContainerView;
