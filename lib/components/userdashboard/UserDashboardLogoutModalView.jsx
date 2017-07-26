var React = require('react')
, SwellistModal = require('../modal/swellist-modal.js')
;

var UserDashboardLogoutModalView = React.createClass({
  getInitialState: function() {
    return {
      isModalOpen: false
    }
  },
  openModal: function() {
    this.setState({ isModalOpen: true });
  },
  closeModal: function() {
    this.setState({ isModalOpen: false });
  },
  componentDidMount: function() {
  },
  componentWillUnmount: function() {
  },
  render: function() {
    return (
      <SwellistModal isOpen={this.state.isModalOpen} transitionName="modal-anim" ref="featuredTip">
        <div className="modal-wrapper"onClick={this.closeModal} >
          <div className="modal-body">
            <div className="modal-header"><a onClick={this.closeModal}>X</a></div>
            <h5 className="modal-title">LOGOUT</h5>
            <h7>Are you sure you want to logout?</h7>
            <div className="settings-links-dialog">
              <button className="Button-inverse" onClick={this.props._logout}>Logout</button>
            </div>
          </div>
        </div>
      </SwellistModal>

    );
  }
});


module.exports = UserDashboardLogoutModalView;
