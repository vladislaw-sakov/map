var React = require('react')
    , TaskStore = require('../../../lib/store/wunderlist/WunderlistDashboardStore.js')
    , moment = require('moment')
    ;

var UserDashboardTrendHeroView = React.createClass({
    getInitialState: function() {
        return getState();
    },
    componentDidMount: function() {
        TaskStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        TaskStore.removeChangeListener(this._onChange);
    },
    render: function () {
        var now = moment();
        var startHistory = moment().subtract(5, 'years');
        var startWeek = moment().subtract(7, 'days');
        var productiveDay = TaskStore.getMostProductiveDay(true);
        var productiveHour = TaskStore.getMostProductiveHour(true);
        var createCnt = TaskStore.getTasksInTimeRange(startHistory, now).length;
        var completeCnt = TaskStore.getTasksInTimeRangeWithCompletion(startWeek, now, true).length ;

        if( productiveDay && productiveHour ) {
            return (
                <div className="Trend-hero">
                    <h3 className="Trend-text">In the past 7 days, I created <span className="underline">{createCnt}</span>  tasks and completed <span className="underline">{completeCnt}</span> .<br></br>I am most productive around <span className="underline">{productiveHour}</span> and on <span className="underline">{productiveDay}</span> .</h3>
                </div>
            );
        } else {
            return (
                <div className="Trend-hero">
                    <h3 className="Trend-text">Welcome to your Swellist feed! <br></br>Check back soon for your personalized tips.</h3>
                </div>
            )
        }

    },
    _onChange: function() {
        this.setState(getState());
    }
});

function getState() {
    return {
        listCount: TaskStore.getListCount()
    }
}

module.exports = UserDashboardTrendHeroView;
