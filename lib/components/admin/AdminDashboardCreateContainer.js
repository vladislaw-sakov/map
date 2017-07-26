'use strict';
import React from 'react';
import TipView from '../tipcreator/TipCreatorView.js';
import BotLauncherView from './AdminDashboardBotLauncherView.js';
import DigestView from './AdminDashboardDigestCreatorView.js'

var AdminDashboardCreateContainer = React.createClass({
  getInitialState: function () {
    return {
      view: "tips"
    }
  },
  handleTipsClick: function (event) {
    this.setState({view: "tips"});
  },
  handleBotsClick: function (event) {
    this.setState({view: 'bots'});
  },
  handleDigestClick: function (event) {
    this.setState({view: 'digest'});
  },
  render: function () {
    if (this.state.view == "bots") {
      return (
        <div className="uselessholdingdiv">
          <nav>
            <div className='col-sm-1'></div>
            <ul className="nav nav-tabs">
              <li role="presentation"><a className='tab-headers' onClick={this.handleTipsClick}>Tips</a></li>
              <li role="presentation" className="active"><a className='tab-headers'>Bots</a></li>
              <li role="presentation" className="tab-headers" onClick={this.handleDigestClick}><a
                className='tab-headers'>Digest</a></li>
            </ul>
          </nav>
          <BotLauncherView />
        </div>
      )
    } else if (this.state.view == "digest") {
      return (
        <div className="uselessholdingdiv">
          <nav>
            <div className='col-sm-1'></div>
            <ul className="nav nav-tabs">
              <li role="presentation"><a className='tab-headers' onClick={this.handleTipsClick}>Tips</a></li>
              <li role="presentation"><a className='tab-headers active' onClick={this.handleBotsClick}>Bots</a></li>
              <li role="presentation" className="active"><a className='tab-headers'>Digest</a></li>
            </ul>
          </nav>
          <DigestView />
        </div>
      )
    } else {
      return (
        <div className="uselessholdingdiv">
          <nav>
            <div className='col-sm-1'></div>
            <ul className="nav nav-tabs">
              <li role="presentation" className="active"><a className='tab-headers'>Tips</a></li>
              <li role="presentation"><a className='tab-headers active' onClick={this.handleBotsClick}>Bots</a></li>
              <li role="presentation" className="tab-headers" onClick={this.handleDigestClick}><a
                className='tab-headers'>Digest</a></li>
            </ul>
          </nav>
          <TipView />
        </div>
      )
    }
  }
});

module.exports = AdminDashboardCreateContainer;