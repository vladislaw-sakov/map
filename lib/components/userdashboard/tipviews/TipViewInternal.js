var React = require('react')
, TipTypeformStyles = require('./TipTypeformStyles.js')
, UserDashboardDeeplinkConstants = require('../../../constants/dashboard/UserDashboardDeeplinkConstants.js')
;

var TipViewInternal = React.createClass({
  handleInternalClick: function(event) {
    event.preventDefault();
    var content = this.props.streamObject;
    switch(content.link) {
    case "notepad":
        location.hash = "#" + UserDashboardDeeplinkConstants.NOTEPAD;
        break;
    case "profile":
        location.hash = "#" + UserDashboardDeeplinkConstants.PROFILE;
        break;
    case "team":
        location.href = "https://swellist.com/team";
        break;
    case "example":
        location.href = "https://swellist.com/example";
        break;
    case "blog":
        location.href = "http://blog.swellist.com/blog/2016/1/13/our-mission";
        break;
    default:
        location.hash = "#" + UserDashboardDeeplinkConstants.TIPS;
    }
  },

  render: function () {
    var content = this.props.streamObject;
    var textArray = [];
    if (content.text) {
      textArray = content.text.split(" ");
    }
    var showText = "";
    if (textArray.length > 28) {
      var dots = "...";
      showText = textArray.slice(0, 26).join(" ").concat(dots);
    } else {
      showText = content.text;
    }
    return (
      <div className="tipBox">
        <img className="tileImg" style={TipTypeformStyles.image} src={content.images[0].url}/>
        <p className="tileTitle" style={TipTypeformStyles.title}>{content.title}</p>
        <p className="tileText" style={TipTypeformStyles.text}>{showText}</p>
        <button className="tileButton" style={TipTypeformStyles.button} onClick={this.handleInternalClick}>{content.buttonCopy}</button>
      </div>
    );
  }
});

module.exports = TipViewInternal;
