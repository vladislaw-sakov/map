var React = require('react')
    , WunderlistAPIUtils = require('./WunderlistAPIUtils.js')
    , AdminDashboardStore = require('./AdminDashboardStore.js')
    // , WunderlistDashboardProductiveView = require('./WunderlistDashboardProductiveView.jsx')
    // , WunderlistLineupView = require('./WunderlistLineupView.jsx')
    // , TasksCompletedPiechartView = require('./TasksCompletedPiechartView.jsx')
    // , TasksCreatedPiechartView = require('./TasksCreatedPiechartView.jsx')
    // , TaskAgeChartView = require('./TaskAgeChart.jsx')
    // , PercentCompletionBarChartView = require('./PercentCompletionBarChartView.jsx')
    // , TasksCompletedPiechartView = require('./TasksCompletedPiechartView.jsx')
    // , TasksCreatedPiechartView = require('./TasksCreatedPiechartView.jsx')
    ;

var WunderlistDashboardMainVizView = React.createClass({
    getInitialState: function() {
        return {
        // get data here?
        }
    },
    render: function () {
      return (
        <div className="mainviz">
            <div className="row">
                <div className="col-md-12">
                    <h1 className="headerLine">Productivity Habits</h1>
                </div>
            </div>
            <div className="row">
                <hr/>
            </div>
            <div>WunderlistDashboardProductiveView</div>
            <div>WunderlistLineupView</div>
            <div className="row" classID="barchartRow">
                <div className="col-md-6" classID="barchartContainer">
                    <h3 className="barchartHeader">Average Age of Tasks by List</h3>
                        <div>TaskAgeChartView</div>
                </div>
                <div className="col-md-6" classID="barchartContainer">
                    <h3 className="barchartHeader">List % Completion</h3>
                        <div>PercentCompletionBarChartView</div>
                </div>
            </div>
            <div className="row" classID="piechartRow">
                <div className="col-md-6" classID="piechartContainer">
                    <h3 className="piechartHeader">All Tasks</h3>
                    <div className="piechart1">
                        <div>TasksCreatedPiechartView</div>
                    </div>
                </div>
                <div className="col-md-6" classID="piechartContainer">
                    <h3 className="piechartHeader">Completed Tasks</h3>
                    <div className="piechart2">
                        <div>TasksCompletedPiechartView</div>
                    </div>
                </div>
            </div>
        </div>
      );

        // return (
            // <div className="mainviz">
            //     <div className="row">
            //         <div className="col-md-12">
            //             <h1 className="headerLine">Productivity Habits</h1>
            //         </div>
            //     </div>
            //     <div className="row">
            //         <hr/>
            //     </div>
            //     <WunderlistDashboardProductiveView />
            //     <WunderlistLineupView />
            //     <div className="row" classID="barchartRow">
            //         <div className="col-md-6" classID="barchartContainer">
            //             <h3 className="barchartHeader">Average Age of Tasks by List</h3>
            //                 <TaskAgeChartView />
            //         </div>
            //         <div className="col-md-6" classID="barchartContainer">
            //             <h3 className="barchartHeader">List % Completion</h3>
            //                 <PercentCompletionBarChartView />
            //         </div>
            //     </div>
            //     <div className="row" classID="piechartRow">
            //         <div className="col-md-6" classID="piechartContainer">
            //             <h3 className="piechartHeader">All Tasks</h3>
            //             <div className="piechart1">
            //                 <TasksCreatedPiechartView />
            //             </div>
            //         </div>
            //         <div className="col-md-6" classID="piechartContainer">
            //             <h3 className="piechartHeader">Completed Tasks</h3>
            //             <div className="piechart2">
            //                 <TasksCompletedPiechartView />
            //             </div>
            //         </div>
            //     </div>
            // </div>
        // );
    },

});

module.exports = WunderlistDashboardMainVizView;
