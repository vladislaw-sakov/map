var React = require('react')
    , UserStore = require('../../store/swell/SwellUserStore.js')
    , UserProfileActions = require('../../actions/swell/SwellUserProfileActions.js')
    ;

var UserDashboardChangeNameView = React.createClass({
    getInitialState: function() {
        var user = UserStore.getUserData();
        var name = "";
        if (user){
            name = user.name ? user.name : "";
        }
        return {name: name};
    },
    handleNameChange: function(e) {
        this.setState({name: e.target.value});
    },

    render: function () {
        return (
            <div>
                <div className="Progress-header">
                    <h6>Account > Change Name</h6>
                </div>
                <form ref="nameForm" className="Settings-form">
                    <div className="Settings-input-group">
                        <p className="Settings-label">Name:</p>
                        <input type="text" ref="name" value={this.state.name} className="Settings-input" onChange={this.handleNameChange} />
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
        this.state ? updatedProfile.name = this.state.name : updatedProfile.name = user.name;
        UserProfileActions.setUserName(updatedProfile);
        this.props.goToHome();
    }
});

module.exports = UserDashboardChangeNameView;