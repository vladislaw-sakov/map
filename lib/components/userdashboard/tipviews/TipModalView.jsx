var React = require('react')
, TipView = require('./TipView.jsx')
, SwellStreamStore = require('../../../store/swell/SwellStreamStore_v2.js')
, UserDashboardActions = require('../../../actions/dashboard/UserDashboardActions.js')
, SwellistModal = require('../../modal/swellist-modal.js')
;

var TipModalView = React.createClass({
  getInitialState: function() {
    return {
      isLoading: true,
      isModalOpen: true
    }
  },
  openModal: function() {
    this.setState({ isModalOpen: true });
  },
  closeModal: function() {
    this.setState({ isModalOpen: false });
    location.hash = "#/feed";
  },
  componentDidMount: function() {
    SwellStreamStore.addChangeListener(this._onChange);
    UserDashboardActions.fetchFeaturedStreamObject(this.props.objectId);
  },
  componentWillUnmount: function() {
    SwellStreamStore.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState(getState());
    var featuredObject = SwellStreamStore.getFeaturedStreamObject();
    var featuredObjectIsDisplayable = featuredObject && featuredObject.type;
    this.setState({ isModalOpen: featuredObjectIsDisplayable });
  },
  render: function() {
    var modalContent;
    if (this.state.isLoading) {
      modalContent = (
        <div className="modal-loading">
          <div className="fade-in" style={{display:"flex", alignItems: "center", justifyContent: "center", paddingTop: "100px", paddingBottom: "100px"}}>
            <img src="http://static.swellist.com/images/swellist-circle-loader.gif"
                 style={{width:"100px", height:"100px"}}/>
          </div>
        </div>
      )
    } else {
      modalContent = <TipView streamObject={SwellStreamStore.getFeaturedStreamObject()} uid={this.props.uid} tracker={this.props.tracker} email={this.props.email} />;
    }
    return (
        <SwellistModal isOpen={this.state.isModalOpen} transitionName="modal-anim" ref="featuredTip">
          <div className="modal-wrapper" onClick={this.closeModal}>
            <div className="modal-header"><a onClick={this.closeModal}>X</a></div>
            <div className="modal-body">
                {modalContent}
            </div>
          </div>
        </SwellistModal>

    );
  }
});

function getState() {
  return {
    isLoading: SwellStreamStore.getFeaturedStreamObject() === null
  }
}

module.exports = TipModalView;
