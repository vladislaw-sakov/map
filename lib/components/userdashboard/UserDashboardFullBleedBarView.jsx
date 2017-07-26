var React = require('react')
    , TaskStore = require('../../../lib/store/wunderlist/WunderlistDashboardStore.js')
    ;

var UserDashboardFullBleedBarView = React.createClass({
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


        return (
            <div className="fullBleed">
                <div className="col-md-12">
                    <div className="container">
                        <div className="col-md-3">
                        <img src="/img/sunrise.jpg" alt="sunrise" className="img-responsive"/>
                            <h2 className="bleedLabel2">{this.state.productiveHour}</h2>
                        </div>
                        <div className="col-md-8 fullbleedcopy">
                            <h4 className="chartHead">Most Productive Hour of the Day</h4>
                            <p className="chartCopy">Write a Stop Doing List. Every productive person obsessively sets To Do Lists. But those who play at world-class also record what they commit to stop doing. Steve Jobs said that what made Apple Apple was not so much what they chose to build but all the projects they chose to ignore. </p>
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
        "productiveHour": TaskStore.getMostProductiveHour(true)
    }
}

module.exports = UserDashboardFullBleedBarView;
