/**
 * Created by liztron on 4/12/16.
 */
var React = require('react')
  ;

var AdminDashboardNavbarView = React.createClass({
  handleNextClick: function(event) {
    event.preventDefault();
    var uid = this.props.uid;
    var nextUser = String((Number(uid) + 1));
    var nextUrl = API_URL + "/user/" + nextUser + "/feeddashboard/#" + this.props.route ;
    location.href = nextUrl;
  },
  render: function() {

    return (
      <header>
        <div>
          <ul className="nav nav-justified">
            <li className="float-left">
              <a href="/admin" className='back-button'><i className="fa fa-arrow-circle-left nav-icon"></i>Back to all users</a>
            </li>
            <li>
              <h2 className="nav-logo">Swellist</h2>
            </li>
            <li className="float-right">
              <a onClick={this.handleNextClick} className='next-button' id="next-user">Next user<i className="fa fa-arrow-circle-right nav-icon"></i></a>
            </li>
          </ul>
        </div>
      </header>

    );
  }
});

module.exports = AdminDashboardNavbarView;