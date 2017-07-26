var React = require('react')
    , TaskStore = require('../../../lib/store/wunderlist/WunderlistDashboardStore.js')
    , moment = require('moment')
    ;

var UserDashboardInsightTrendsView = React.createClass({
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
        var productiveDay = TaskStore.getMostProductiveDay(true);
        var totalAll =TaskStore.getTasksInTimeRange(startHistory, now).length;
        var oldestTask = TaskStore.getOldestTask();
        var oldestTaskTime = moment(oldestTask.created_at).fromNow();
        var oldestTaskTitle = oldestTask.title;

        return (
            <div className="trendsView">
               <h4 className="chartHead">More Productivity Trends</h4>
                <div className="row">
                    <div className="col-md-3">
                        <img src="img/trenda.png" className="img-responsive"/>
                        <h2 className="bleedLabel">{productiveDay}</h2>
                        <h3 className="caption text-center" >Most Productive Day</h3>
                    </div>
                    <div className="col-md-3">
                        <img src="img/trendb.png" className="img-responsive"/>
                        <h2 className="bleedLabel">{totalAll}</h2>
                        <h3 className="caption text-center" >Lifetime Total Tasks</h3>
                    </div>
                    <div className="col-md-6">
                        <img src="img/trendc.png" className="img-responsive center-block"/>
                        <div className="bleedLabel text-center">
                            <h4>"{oldestTaskTitle}"</h4>
                            <p>{oldestTaskTime}</p>
                        </div>
                        <h3 className="captionRect text-center">Oldest Incomplete</h3>
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
        listCount: TaskStore.getListCount()
    }
}

module.exports = UserDashboardInsightTrendsView;
