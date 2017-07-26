var React = require('react')
  , SimpleRequest = require('../../utilities/SimpleRequest.js')
  , EmailConstants = require('../../constants/email/EmailConstants.js')
  , TipCreatorActions = require('../tipcreator/TipCreatorActions.js')
  ;

var AdminDashboardDigestCreatorView = React.createClass({
  getInitialState: function () {
    return {
      uids: "",
      ids: "",
      subject: "Tips Digest",
      intro: ""

    }
  },
  handleSubjectChange: function(event) {
    this.setState({subject: event.target.value});
  },
  handleIntroChange: function(event){
    this.setState({intro: event.target.value});
  },
  handleUidsChange: function (event) {
    this.setState({uids: event.target.value});
  },
  handleIdsChange: function (event) {
    this.setState({ids: event.target.value});
  },
  handleSubmitClick: function (event) {
    var digestObject = this.getCurrentDigestObject();
    TipCreatorActions.sendTipDigest(digestObject);
  },

  render: function () {
    return (
      <div className="container bots-container">
        <div className="row">
          <div className='col-md-8 col-md-offset-2'>
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Create an Email Digest</h3>
              </div>
              <div className="panel-body">
                <div className="input-group">
                  <span className="input-group-addon" id="basic-subject">Subject: </span>
                  <input type="text" className="form-control" placeholder="Subject" id="digestSubject" maxLength={250} value={this.state.subject} onChange={this.handleSubjectChange}/>
                </div>
                <div className="input-group">
                  <span className="input-group-addon" id="basic-intro">Intro: </span>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Intro"
                    id="digestIntro"
                    value={this.state.intro}
                    onChange={this.handleIntroChange}>
                  </textarea>
                </div>
                <div className="input-group">
                  <span className="input-group-addon" id="basic-uid">Recipient UID's:</span>
                  <textarea rows="3"
                            className="form-control"
                            placeholder="Ex: 1000100"
                            id="digestUids"
                            value={this.state.uids}
                            onChange={this.handleUidsChange}>

                  </textarea>
                </div>
                <div className="input-group">
                  <span className="input-group-addon" id="basic-id">Tip ID's:</span>
                  <textarea rows="3" className="form-control" placeholder="Ex:1000101:17 - Exactly 3 tips please"
                            id="digestId" value={this.state.ids} onChange={this.handleIdsChange}></textarea>
                </div>
                <div className="panel-footer text-center">
                  <button type="button" className="btn btn-success" onClick={this.handleSubmitClick}>Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  },
  getCurrentDigestObject: function () {
    var targetUidsRaw = this.state.uids;
    var targetUids = targetUidsRaw.split(',');
    var targetDigestUids = [];
    for (let targetUidRaw of targetUids) {
      var targetUid = targetUidRaw.trim();
      if (targetUid) {
        targetDigestUids.push(targetUid);
      }
    }
    var targetIdsRaw = this.state.ids;
    var targetIds = targetIdsRaw.split(',');
    var targetDigestIds = [];
    for (let targetIdRaw of targetIds) {
      var targetId = targetIdRaw.trim();
      if (targetId) {
        targetDigestIds.push(targetId);
      }
    }
    var object = {
      uids: targetDigestUids,
      ids: targetDigestIds,
      subject: this.state.subject,
      intro: this.state.intro
    };
    return object;
  }
});

module.exports = AdminDashboardDigestCreatorView;