var React = require('react')
  ;

var UserDashboardOnboardingNavView = React.createClass({
  handleSwellistClick: function(event){
      location.href = '/swellist';
  },
  render: function () {
    var imageUrl = "/img/swellist/profile-icon.png";
    return (
      <nav className="Navbar-onboard">

        <div className="Navbar-mid">
          <h2 className="swellistLogo" >SWELLIST</h2>
        </div>

      </nav>

    );
  }
});

module.exports = UserDashboardOnboardingNavView;