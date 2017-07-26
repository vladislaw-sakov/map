/**
 * Created by liztron on 4/15/16.
 */
var React = require('react')
  , TipViewStyles = require('./TipViewStyles.js')
  , TipRating = require('./TipRatingView.js')
  ;

var TipViewVideo = React.createClass({
  onVideoLoaded: function() {
    document.getElementById("video-" + this.props.streamObject.id).style.display = "block";
    document.getElementById("video-loader-" + this.props.streamObject.id).style.display = "none";
  },
  render: function () {
    var content = this.props.streamObject;
    var videoUrl = '';
    if (content.video) {
      videoUrl = "https://www.youtube.com/embed/" + content.video;
    } else {
      videoUrl = "https://www.youtube.com/embed/oabcM9SOF-E";
    }
    if (!content.header){
      content.header = "Swellist Tip"
    }
    var textArray = [];
    if (content.text) {
      var textArray = content.text.split(" ");
    }
    var showText = "";
    if (textArray.length > 28) {
      var dots = "...";
      showText = textArray.slice(0, 26).join(" ").concat(dots);
    } else {
      showText = content.text;
    }
    var ratingTip = this.props.streamObject.rating ? this.props.streamObject.rating : 0;
    var heartView = "heart-hide";
    if (ratingTip == 1) {
      heartView = "heart-show";
    }
    var videoIframeId = "video-" + this.props.streamObject.id;
    var videoLoadingImage = "video-loader-" + this.props.streamObject.id;
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
        <img src="http://static.swellist.com/images/swellist-circle-loader.gif" id={videoLoadingImage} />
        <iframe width="560" height="315" onLoad={this.onVideoLoaded} id={videoIframeId} style={{"display": "none"}} src={videoUrl} frameborder="0" allowfullscreen className="tipVideo"></iframe>
        <p className="tipText" style={TipViewStyles.descriptionText} >{showText}</p>
        <div className="tipFooter">
          <TipRating rating={ratingTip} uid={this.props.streamObject.uid} id={this.props.streamObject.id} key={"id-"+this.props.streamObject.id} tracker={this.props.tracker}/>
        </div>
      </div>
    );
  }
});

module.exports = TipViewVideo;
