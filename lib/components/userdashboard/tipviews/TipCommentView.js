var React = require('react')
  , UserFeedActions = require('../../../actions/dashboard/UserFeedActions.js')
  ;

var TipCommentView = React.createClass({
  getInitialState: function() {
    return {
      submitted: false
    };
  },
  handleChange: function() {
    this.setState({value: this.refs.textarea.value});
  },
  handleSubmitClick : function(event){
    var comment = this.state.value;
    this.setState({submitted: true});
    if( this.props.tracker ) {
      this.props.tracker.track('Dashboard_Click', {
        "target": "comment",
        "uid": this.props.uid,
        "id": this.props.id,
        "value": comment
      });
    }
    UserFeedActions.setTipComment(comment, this.props.uid, this.props.id );
  },
  render: function () {
    var header = "Oh Noes!";
    var subtitle = "We're sorry this wasn't helpful. Please let us know how we could do better.";
    var bodyClass = "comment-body";
    if (this.state.submitted ) {
      header = "Thank you";
      subtitle = "We appreciate your feedback!";
      bodyClass = "comment-body-hide";
    } else if (this.props.rating == 1) {
      header= "Thanks,";
      subtitle = "We heart you, too! Please let us know what you thought of this tip.";
      bodyClass = "comment-body";
    }
    return(
      <div className="comment-box">
        <h6 className="comment-header">{header}</h6>
        <h8>{subtitle}</h8>
        <div className={bodyClass}>
          <textarea
            onChange={this.handleChange}
            ref="textarea"
            className="comment-textarea"
            placeholder="Type your comments here!"
            value={this.state.value}
            maxLength={250}
          />
          <button className="sync-button" onClick={this.handleSubmitClick}>Submit</button>
        </div>
      </div>
    );
  }
});

module.exports = TipCommentView;
/**
 * Created by liztron on 5/5/16.
 */
