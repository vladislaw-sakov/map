var React = require('react')
    , UserStore = require('../../../lib/store/swell/SwellUserStore.js')
    , TaskStore = require('../../../lib/store/wunderlist/WunderlistDashboardStore.js')
    , moment = require('moment')
    ;

var UserDashboardHeaderView = React.createClass({
    getInitialState: function() {
        return getState();
    },
    componentDidMount: function() {
        UserStore.addChangeListener(this._onChange);
        TaskStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        UserStore.removeChangeListener(this._onChange);
        TaskStore.removeChangeListener(this._onChange);
    },
    render: function () {
        var user = UserStore.getUserData();
        var now = moment().format("MM/DD/YY");
        var startHistory = moment().subtract(5, 'years');
        var totalComplete = TaskStore.getTasksInTimeRangeWithCompletion(startHistory, now, true).length;
        var totalAll =TaskStore.getTasksInTimeRange(startHistory, now).length;
        var completeRate = Math.round(((totalComplete/totalAll)* 100));
        if( user.profile ) {
            var imageUrl = user.profile.photoUrl ? user.profile.photoUrl : "";
            var name = user.profile.name ? user.profile.name : "";
        }
        return (
            <div className="header">
                <div className="row promobox">
                    <div className="container">
                        <ul className ="nav navbar-nav navbar-left">
                            <li><a>OVERVIEW</a></li>
                            <li><a>HISTORY</a></li>
                            <li><a>PROFILE</a></li>
                        </ul>
                    </div>
                </div>
                <div className="container">
                    <div className="row userHead">
                        <div className="col-md-1">
                            <img src={imageUrl} className="img-circle"></img>
                        </div>
                        <div className="col-md-7">
                            <h4 className="welcome"><strong>Welcome back, {name}!</strong></h4>
                            <p>{now}</p>
                        </div>
                        <div className="col-md-3 task">
                            <p className="text-center">TASK COMPLETION RATE</p>
                            <h1 className="text-center">{completeRate}%</h1>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    _onChange: function() {
        this.setState(getState());
    }
});

function getState() {
    return {
        user: UserStore.getUserData(),
        now: moment().format("MM/DD/YY"),
    }
}


module.exports = UserDashboardHeaderView;
