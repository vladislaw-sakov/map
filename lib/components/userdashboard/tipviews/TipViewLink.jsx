var React = require('react')
  , TipViewStyles = require('./TipViewStyles.js')
  , TipRating = require('./TipRatingView.js')
  ;

var TipImage = React.createClass({
  render: function () {
    return (
      <a onClick={this.props.handleLinkClick} target="_blank">
        <img alt={this.props.title} src={this.props.url} style={TipViewStyles.linkImage}/>
      </a>
    );
  }
});

var TipViewLink;
TipViewLink = React.createClass({
  getInitialState: function() {
    var oldRating = this.props.streamObject.rating ? this.props.streamObject.rating : null;
    if (oldRating) {
      return {
        counter : 1,
      }
    } else {
      return {
        counter : 0, 
      }
    }
  },
  handleLinkClick: function () {
    var link = this.props.streamObject.link;
    window.location.href = "/r?n=" + encodeURIComponent(link) + "&event=Dashboard_Click&target=tile_link_click&uid=" + this.props.uid;
  },
  render: function () {
    var content = this.props.streamObject;
    var imageNode = null;
    if (content.images && content.images.length && content.images[0].url) {
      var imageData = content.images[0];
      imageNode = <TipImage url={imageData.url} width={imageData.width} height={imageData.height} alt={imageData.title}
                            handleLinkClick={this.handleLinkClick}/>
    }
    if (!content.buttonText) {
      content.buttonText = "Go"
    }
    if (!content.header) {
      content.header = "Swellist Tip"
    }
    // var textArray = [];
    // if (content.text) {
    //   var textArray = content.text.split(" ");
    // }
    var showText = showText = content.text;
    // if (textArray.length > 28) {
    //   var dots = "...";
    //   showText = textArray.slice(0, 26).join(" ").concat(dots);
    // } else {
    //   showText = content.text;
    // }
    var ratingTip = this.props.streamObject.rating ? this.props.streamObject.rating : 0;
    var heartView = "heart-hide";
    if (ratingTip == 1 && this.state.counter == 1) {
      heartView = "heart-show"; 
    } 
    return (
      <div className="tipBox">
        <div className="tipHeader">
          <div className="tipHead-left">
            <h2 className="tipType" style={TipViewStyles.header}>{content.header}</h2>
            <p className="tipFraming" style={TipViewStyles.framing}>{content.framing}</p>
          </div>
          <div className="tipHead-right">
            <img className={heartView} src="http://static.swellist.com/images/feedback/heart-filled-dark@2x.png"
                 alt="heart"></img>
          </div>
        </div>
        <hr/>
        <p className="tipHeading" style={TipViewStyles.heading}>{content.title}</p>
        {imageNode}
        <p className="tipText" style={TipViewStyles.descriptionText}>{showText}</p>
        <a onClick={this.handleLinkClick} className="buttonLink" alt={content.title}>
          <button className="linkButton" style={TipViewStyles.linkButton}>{content.buttonText}</button>
        </a>
        <div className="tipFooter">
          <TipRating rating={ratingTip} uid={this.props.streamObject.uid} id={this.props.streamObject.id}
                     key={"id-"+this.props.streamObject.id} tracker={this.props.tracker}/>
        </div>
      </div>
    )
  }
});

module.exports = TipViewLink;
