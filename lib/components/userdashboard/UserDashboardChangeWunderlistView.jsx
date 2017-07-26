var React = require('react')
    ;

var UserDashboardChangeWunderlistView = React.createClass({
    handleDisconnectClick : function(event){
        window.location.href="https://www.wunderlist.com/account/applications"
    },
    render: function () {
        return (
            <div>
                <div className="Progress-header">
                    <h6>Account > Change Wunderlist</h6>
                </div>
                <div ref="passwordForm" className="Settings-form">
                    <p>Should you no longer wish to share your Wunderlist with Swellist, you may disconnect your account through the Wunderlist API client.</p>
                    <p>Click the link below and remove Swellist from your list of authorized apps.</p>
                </div>
                <div className="Settings-links">
                    <button onClick={this.handleDisconnectClick} className="Button">Remove</button>
                    <button onClick={this.props.goToHome} className="Button">Cancel</button>
                </div>
            </div>
        );
    }
});

module.exports = UserDashboardChangeWunderlistView;