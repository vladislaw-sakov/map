var React = require('react')
    , FullBleedBar = require('./UserDashboardFullBleedBarView.jsx')
    , InsightTrends = require('./UserDashboardInsightTrendsView.jsx')
    , WunderlistAPIUtils = require('../../api/wunderlist/WunderlistAPIUtils')
    ;

var UserDashboardInsightView= React.createClass({
    componentDidMount: function() {
        WunderlistAPIUtils.fetchListData();
    },
    render: function () {
        return (
            <div className="insight">
                <div className="container headerInsight">
                    <h2 className="insightHead text-center">2015 Productivity Insights</h2>
                </div>
                < FullBleedBar />
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                         < InsightTrends />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = UserDashboardInsightView;
