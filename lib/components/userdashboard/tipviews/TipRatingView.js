var React = require('react')
  , UserFeedActions = require('../../../actions/dashboard/UserFeedActions.js')
  , TipCommentBar = require('./TipCommentView.js')
  ;

var TipRatingView = React.createClass({
  getInitialState: function () {
    if (this.props.rating > 0) {
      return {
        rated: true,
        rating: this.props.rating
      }
    } else {
      return {
        rated: false,
        rating: 0
      }
    }
  },
  handleIconClick: function (event, rating) {
    var newRating = event.target.value;
    this.setState({ rating: newRating}, ()=>{
        UserFeedActions.setTipRating(newRating, this.props.uid, this.props.id);
    });
    if( this.props.tracker ) {
      this.props.tracker.track('Dashboard_Click', {
        "target": "rating",
        "uid": this.props.uid,
        "id": this.props.id,
        "value": newRating
      });
    }
  },
  render: function () {
    var srcBase = "http://static.swellist.com/images/feedback/"
      , heartSrc = srcBase + "heart-dark@2x.png"
      , mehSrc = srcBase + "meh-dark@2x.png"
      , sadSrc = srcBase + "sad-dark@2x.png"
      , ltheart = srcBase + "heart-filled@2x.png"
    ;
    var sadClass, mehClass, heartClass;
    sadClass = mehClass = heartClass = "icon-empty";
    var hiddenClass = "icon-hide";
    if (this.state.rating === .1) {
      sadSrc = srcBase + "sad-filled-dark@2x.png";
      sadClass = "icon-full pulsing";
    } else if (this.state.rating === .5) {
      mehSrc = srcBase + "meh-filled-dark@2x.png";
      mehClass = "icon-full pulsing";
    } else if (this.state.rating === 1) {
      heartSrc = srcBase + "heart-filled-dark@2x.png";
      heartClass = "icon-full pulsing";
    }
    if (this.state.rated ) {
      return (
        <div className="tip-footer-container">
        </div>
      );
    } else if ( !this.props.rated && this.state.rating == 0) {
     return (
       <div className="tip-footer-container">
         <div className="ratings-bar">
           <img src={sadSrc} value={.1} className={sadClass} onClick={this.handleIconClick}/>
           <img src={mehSrc} value={.5} className={mehClass} onClick={this.handleIconClick}/>
           <img src={heartSrc} value={1} className={heartClass} onClick={this.handleIconClick}/>
         </div>
       </div>
     );
   } else {
     return (
     <div className="tip-footer-container">
       <div className="ratings-bar">
         <img src={sadSrc} value={.1} className={sadClass} onClick={this.handleIconClick}/>
         <img src={mehSrc} value={.5} className={mehClass} onClick={this.handleIconClick}/>
         <img src={heartSrc} value={1} className={heartClass} onClick={this.handleIconClick}/>
       </div>
       <TipCommentBar rating={this.state.rating} uid={this.props.uid} id={this.props.id} key={"id-"+this.props.id} tracker={this.props.tracker}/>
     </div>
    );
   }
  }
});

module.exports = TipRatingView;
/**
 * Created by liztron on 5/5/16.
 */
