var React = require('react')
, TipTypeformStyles = require('./TipTypeformStyles.js')
;

var TipViewTypeform = React.createClass({
  handleStartQuizClick: function(event) {
    event.preventDefault();
    var content = this.props.streamObject;
    var typeformLink = "https://tryswell.typeform.com/to/" + content.quizId + "?uid=" + this.props.uid + '&email=' + this.props.email;
    window.location.href="/r?n="+ encodeURIComponent(typeformLink) +"&event=Dashboard_Click&target=tile_typeform_click&uid="+this.props.uid;
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
        <button className="tileButton" style={TipTypeformStyles.button} onClick={this.handleStartQuizClick}>{content.buttonCopy}</button>
      </div>
    );
  }
});

module.exports = TipViewTypeform;
