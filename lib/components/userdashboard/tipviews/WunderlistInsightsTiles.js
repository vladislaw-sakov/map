/**
 * Created by robby on 2/11/16.
 */

var React = require('react')
    ;

var insightsTileContainer = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    margin: "20px auto 20px",
    maxWidth: "90%"
};

var rect = {
    backgroundImage: 'url("http://static.swellist.com/images/day_background.png")',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: "1",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover"
};

var insightsTileTitle = {
    fontSize: "3.5em",
    fontFaceName: "Montserrat",
    textTransform: "uppercase",
    letterSpacing: "1px"
};
var insightsTileDescription = {
    fontSize: "1.2em",
    marginTop: "40px"
};

var WunderlistInsightProductiveDayTile = React.createClass({
    render: function() {
        return(
            <div style={insightsTileContainer}>
                <div style={rect}>
                    <div style={insightsTileDescription}><h4>My Most Productive Day:</h4></div>
                    <div style={insightsTileTitle}><h3>{this.props.productiveDay}</h3></div>
                </div>
            </div>
        );
    }
});
module.exports.WunderlistInsightProductiveDayTile = WunderlistInsightProductiveDayTile;

var WunderlistInsightProductiveTimeTile = React.createClass({
    render: function() {
        var newRectStyle = Object.assign(rect, {
            backgroundImage: 'url("http://static.swellist.com/images/hour_background.png")'
        });
        return(
            <div style={insightsTileContainer}>
                <div style={newRectStyle}>
                    <div style={insightsTileDescription}><h4>My Most Productive Hour:</h4></div>
                    <div style={insightsTileTitle}><h3>{this.props.productiveHour}</h3></div>
                </div>
            </div>
        );
    }
});
module.exports.WunderlistInsightProductiveTimeTile = WunderlistInsightProductiveTimeTile;

var WunderlistInsightAmbitiousDayTile = React.createClass({
    render: function() {
        var newRectStyle = Object.assign(rect, {
            backgroundImage: 'url("http://static.swellist.com/images/ambitious_background.png")'
        });
        return(
            <div style={insightsTileContainer}>
                <div style={newRectStyle}>
                    <div style={insightsTileDescription}><h4>My Most Ambitious Day:</h4></div>
                    <div style={insightsTileTitle}><h3>{this.props.ambitionDay}</h3></div>
                </div>
            </div>
        );
    }
});
module.exports.WunderlistInsightAmbitiousDayTile = WunderlistInsightAmbitiousDayTile;