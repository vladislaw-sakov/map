var React = require('react')
, ReactDateTime = require('react-datetime')
, TipCreatorActions = require('../TipCreatorActions.js')
, TipCreatorStore = require('../TipCreatorStore.js')
;

var TipCreatorFormButtons = React.createClass({
  getInitialState: function() {
    return {
      isSendChecked: false,
      targetCopyIds: "",
      isError: false
    }
  },

  handleSendCheckToggle: function() {
    var isChecked = !this.state.isSendChecked;
    this.setState({isSendChecked:isChecked});
    this.props.handleSendCheckToggle(isChecked);
  },

  handleTargetCopyIdsChange: function(event) {
    this.setState({targetCopyIds:event.target.value});
  },

  handleSubmitClick: function(event) {
    var options = {};
    if(this.state.publishDate) {
      var publishDate = Math.round(this.state.publishDate.getTime() / 1000);
      options = {publishDate: publishDate};
    }
    this.props.handleSubmitClick(options);
  },

  handleCopySubmitClick: function(event) {
    this.setState({isError: false});

    if(this.state.targetCopyIds == "" || this.state.targetCopyIds == null) {
      this.setState({isError: true});
      return;
    }
    var options = {};
    if(this.state.publishDate) {
      options.publishDate = Math.round(this.state.publishDate.getTime() / 1000);
    }
    var currentStreamObject = TipCreatorStore.getCurrentStreamObject();
    TipCreatorActions.copyStreamObjectWithSourceUidIdToTargetUids(currentStreamObject.uid, currentStreamObject.id, this.state.targetCopyIds, options);

    if(this.props.handleCopySubmitClick) {
      var targetUidsRaw = this.state.targetCopyIds;
      var targetUids = targetUidsRaw.split(',');
      var targetCopyUids = [];
      for( let targetUidRaw of targetUids ) {
        var targetUid = targetUidRaw.trim();
        if( targetUid ) {
          targetCopyUids.push(targetUid);
        }
      }
      this.props.handleCopySubmitClick(targetCopyUids);
    }
  },

  publishDateChanged: function(moment) {
    this.setState({publishDate: moment.toDate()});
  },

  render: function () {
    var copyWidget = null;
    var currentStreamObject = TipCreatorStore.getCurrentStreamObject();
    if( currentStreamObject ) {
      var errorMessage = null;
      if( this.state.isError ) {
        errorMessage = (
          <div className="input-group btn-block text-center">
            <div className="alert alert-danger text-center">Please input recipient IDs</div>
          </div>
        )
      }
      copyWidget = (
        <div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Copy to Ids:</span>
            <input type="input" onChange={this.handleTargetCopyIdsChange} value={this.state.targetCopyIds} placeholder="Ex: 1001001, 1001002" className="form-control" />
            <span className='input-group-btn'>
              <button type="button" className="btn btn-default" onClick={this.handleCopySubmitClick}>Copy</button>
            </span>

          </div>
          {errorMessage}
        </div>
      )
    }
    return (
      <div className="tipButtonRow">
        {copyWidget}
        <div className="well well-sm">
        <input type="checkbox" checked={this.state.isSendChecked} onChange={this.handleSendCheckToggle}/><span className="check-label">Send Tip Email</span>
        </div>
        <div className="well well-sm">
          <span className="publish-time-label input-group-addon" id="basic-addon1">Publish Time: </span>
          <div style={{"marginLeft": "100px"}}>
            <ReactDateTime value={this.state.publishDate} onChange={this.publishDateChanged} />
          </div>
        </div>
        <div className="tipButtons text-center">
          <button type="button" className="btn btn-default" onClick={this.props.handleDeleteClick}>Delete</button>
          <button type="button" className="btn btn-default" onClick={this.props.handlePreviewClick}>Preview</button>
          <button type="button" className="btn btn-success" onClick={this.handleSubmitClick}>Submit</button>
        </div>
        <hr></hr>
      </div>
    );
  }
});

module.exports = TipCreatorFormButtons;
