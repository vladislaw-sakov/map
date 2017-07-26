import React from 'react';
import SwellistModal from '../modal/swellist-modal.js';

let messageStyle = {
  "padding": "40px"
}

class UserDashboardMessage extends React.Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    if(this.props.message) {
      this.state = {
        isModalOpen: true,
        message: this.props.message
      }
    }
  }

  closeModal() {
    this.setState({ isModalOpen: false });
  }

  render() {
    return (
      <SwellistModal
        isOpen={this.state.isModalOpen}
        transitionName="modal-anim"
        ref="modal">
        <div className="modal-wrapper" onClick={this.closeModal}>
          <div className="modal-header"><a onClick={this.closeModal}>X</a></div>
          <div className="modal-body">
              <div style={messageStyle}>{this.state.message}</div>
          </div>
        </div>
      </SwellistModal>
    )
  }
}

module.exports = UserDashboardMessage;
