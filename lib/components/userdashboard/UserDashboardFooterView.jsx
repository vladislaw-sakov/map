var React = require('react'),
    SessionActions = require('../../actions/auth/SwellSessionActions.js')
    ;

var UserDashboardFooterView = React.createClass({
    render: function () {
        return (
            <footer>
                <div className="container">
                    <div className="row footRow">
                        <div className="col-md-1 col-md-offset-5"><a href="http://www.swellist.com/">HOME</a></div>
                        <div className="col-md-1"><a href="http://www.swellist.com/about-1/">ABOUT</a></div>
                        <div className="col-md-1"><a onClick={this._logout}>LOGOUT</a></div>
                    </div>
                </div>
            </footer>
        );
    },

  _logout: function() {
    SessionActions.logout();
  }
});

module.exports = UserDashboardFooterView;
