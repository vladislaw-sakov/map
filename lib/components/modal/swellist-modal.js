var React = require('react')
  , ReactCSSTransitionGroup = require('react-addons-css-transition-group')
  ;

var SwellistModal = React.createClass({
  render: function() {
    if(this.props.isOpen){
      return (
        <ReactCSSTransitionGroup transitionName={this.props.transitionName} transitionEnterTimeout={500} transitionLeaveTimeout={300}>
          <div className="modal">
            {this.props.children}
          </div>
        </ReactCSSTransitionGroup>
      );
    } else {
      return(
        <ReactCSSTransitionGroup transitionName={this.props.transitionName} transitionEnterTimeout={500} transitionLeaveTimeout={300}>
          <div className="modal-hide">
          </div>
        </ReactCSSTransitionGroup>
      );
    }
  }
});

module.exports = SwellistModal;