var React = require('react')
    , UserStore = require('../../store/swell/SwellUserStore.js')
    , UserProfileActions = require('../../actions/swell/SwellUserProfileActions.js')
    ;

var UserDashboardChangeLocationView = React.createClass({
    getInitialState: function() {
        var user = UserStore.getUserData();
        var location_name = "";
        if (user){
            location_name = user.location_name ? user.location_name : "";
        }
        return {location_name: location_name};
    },
    handleLocationNameChange: function(e) {
        this.setState({location_name: e.target.value});
    },
    render: function () {
        return (
            <div>
                <div className="Progress-header">
                    <h6>Account > Change Location</h6>
                </div>
                <form ref="locationForm" className="Settings-form">
                    <div className="Settings-input-group">
                        <p className="Settings-label">Location Name:</p>
                        <input type="text" ref="location_name" value={this.state.location_name} className="Settings-input" onChange={this.handleLocationNameChange}/>
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
        this.state ? updatedProfile.location_name = this.state.location_name : updatedProfile.location_name = user.location_name;
        UserProfileActions.setUserLocationName(updatedProfile);
        this.props.goToHome();
    }
});

module.exports = UserDashboardChangeLocationView;