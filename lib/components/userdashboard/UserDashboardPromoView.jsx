var React = require('react')
    , UserStore = require('../../../lib/store/swell/SwellUserStore.js')
    , SwellSessionStore = require('../../store/auth/SwellSessionStore.js')
    ;

var UserDashboardPromoView = React.createClass({
    render: function () {
        var user = UserStore.getUserData();
        if( user.profile ) {
            var uid = user.profile.uid ? user.profile.uid : "";
        }
        var links = "https://tryswell.typeform.com/to/EL7VfM?uid=" + SwellSessionStore.getUid(); + "&email=xxxxx";

        return (
            <div className="promobox">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 promotext">
                            <h2>Create Better Tips</h2>
                            <p>Help us help you by completing your profile</p>
                        </div>
                        <div className="col-md-6 promobutton">
                            <button className="btn btn-success"><a href={links}>Build Profile</a></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = UserDashboardPromoView;
