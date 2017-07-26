var React = require('react')
    , UserStore = require('../../store/swell/SwellUserStore.js')
    , UserProfileActions = require('../../actions/swell/SwellUserProfileActions.js')
    ;

var UserDashboardChangeEmailView = React.createClass({
    getInitialState: function() {
        var user = UserStore.getUserData();
        var email = "";
        if (user){
            email = user.email ? user.email : "";
        }
        return {name: email};
    },
    handleEmailChange: function(e) {
        this.setState({name: e.target.value});
    },

    render: function () {        
        return (
            <div>
                <div className="Progress-header">
                    <h6>Account > Change Email</h6>
                </div>
                <form ref="emailForm" className="Settings-form">
                    <div className="Settings-input-group">
                        <p className="Settings-label">Email :</p>
                        <input type="text" ref="email" value={this.state.name} className="Settings-input" onChange={this.handleEmailChange}/>
                    </div>
                    <button className="Button" onClick={this._onUpdate}> Update </button>
                    <button onClick={this.props.goToHome} className="Button"> Cancel</button>
                </form>
            </div>
        );
    },
    _onUpdate: function(event) {
        event.preventDefault();
        var user = UserStore.getUserData();
        var updatedProfile = user;
        this.state ? updatedProfile.email = this.state.name : updatedProfile.email = user.email;
        UserProfileActions.setUserEmail(updatedProfile);
        this.props.goToHome();
    }
});

module.exports = UserDashboardChangeEmailView;