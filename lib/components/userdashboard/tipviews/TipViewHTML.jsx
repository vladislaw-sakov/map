var React = require('react')
  ;

var TipViewHTML = React.createClass({
  render: function () {
    var streamObject = this.props.streamObject;
    var tipString = "";
    try {
      tipString = decodeURIComponent(streamObject.content);
    } catch (e) {
      console.log(e);
      console.log(streamObject.uid, streamObject.id);
    }

    return (
      <div className="tipBox" dangerouslySetInnerHTML={{__html: tipString}}></div>
    );
  }
});

module.exports = TipViewHTML;
