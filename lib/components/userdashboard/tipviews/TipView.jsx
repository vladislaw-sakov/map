var React = require('react')
, TipViewHTML = require('./TipViewHTML.jsx')
, TipLinkView = require('./TipViewLink.jsx')
, TipViewTypeform = require('./TipViewTypeform.jsx')
, TipViewVideo = require('./TipViewVideo.js')
, TipViewInternal = require('./TipViewInternal.js')
;

var TipView = React.createClass({
  render: function() {
    var streamObject = this.props.streamObject;
    switch (streamObject.type) {
      case "Article":
        return <TipViewHTML streamObject={streamObject} uid={this.props.uid} tracker={this.props.tracker}/>;
        break;
      case "link":
        return <TipLinkView streamObject={streamObject} uid={this.props.uid} tracker={this.props.tracker}/>;
        break;
      case "typeformQuiz":
        return <TipViewTypeform streamObject={streamObject} uid={this.props.uid} tracker={this.props.tracker} email={this.props.email} />;
        break;
      case "internal":
        return <TipViewInternal streamObject={streamObject} uid={this.props.uid} tracker={this.props.tracker} />;
        break;
      case "video":
        return <TipViewVideo streamObject={streamObject} uid={this.props.uid} tracker={this.props.tracker} />;
        break;
      default:
        return false;
    }
  }
});

module.exports = TipView;
