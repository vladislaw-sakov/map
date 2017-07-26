var React = require('react')
    , ReactDOM = require('react-dom')
    , piechart = require('../piechart/piechart.js')
    , WunderlistDashboardStore = require('../../store/wunderlist/WunderlistDashboardStore.js')
    ;

var UserDashboardInsightHeroView = React.createClass({
    componentDidMount: function() {
        WunderlistDashboardStore.addChangeListener(this._onChange);
        //call to the store with a change listener
        var dataVeg = [
            {label:"broccoli", value:10},
            {label:"carrots", value:5},
            {label:"kale", value:3},
            {label:"asparagus", value:2},
        ];
        piechart.init( ReactDOM.findDOMNode(this), dataVeg );
    },
    componentWillUnmount: function() {
    //    use this with the store
    },

    render: function () {
        return (
            <div className="piechart">
            </div>
        );
    },
    _onChange: function() {
        //reiterate call to the original store method
        piechart.change( ReactDOM.findDOMNode(this), dataVeg );
    }
});

module.exports = UserDashboardInsightHeroView;
