var React = require('react')
  , UserFeedActions = require('../../../actions/dashboard/UserFeedActions.js')
  ;

var TipHeartView = React.createClass({
  getInitialState : function() {
    if (this.props.rating == 1) {
      return  {
        heartFull: true
      } 
    } else {
      return {
        heartFull: false
      }
    }
  },
  handleHeartToggle : function(event){
    var newHeart = !this.state.heartFull;
    this.setState({heartFull: newHeart});
    var newRating = 1;
    if(this.props.rating == 1) {
      newRating = 0;
    }
    if( this.props.tracker ) {
      this.props.tracker.track('Dashboard_Click', {
        "target": "rating",
        "uid": this.props.uid,
        "id": this.props.id,
        "value": newRating
      });
    }
    UserFeedActions.setTipRating(newRating, this.props.uid, this.props.id );
  },
  render: function () {
    var heartSrc = "";
    var heartClass = "";
    if (this.state.heartFull  == true) {
     heartSrc = '/images/swellist/heart-icon-filled@2x.png';
     heartClass = "heart-filled";
    } else {
      heartSrc = "/images/swellist/heart-icon-empty@2x.png";
      heartClass = "heart-empty";
    }
    return (
      <div className="heart">
        <img src={heartSrc} alt="heart" className={heartClass} onTouchEnd={this.handleHeartToggle}/>
      </div>
    );
  }
});

module.exports = TipHeartView;
