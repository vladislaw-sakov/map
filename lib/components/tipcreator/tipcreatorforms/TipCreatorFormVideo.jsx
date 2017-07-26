var React = require('react')
  , TipCreatorActions = require('../TipCreatorActions.js')
  , TipCreatorFormButtons = require('./TipCreatorFormButtons.jsx')
  , TipCreatorStore = require('../TipCreatorStore.js')
  ;

var TipCreatorFormVideo = React.createClass({
  getInitialState: function () {
    var result = TipCreatorStore.getPreviewContent();
    if (!result) {
      result = {
        type: "video",
        header: "Swellist Tip",
        framing: "",
        title: "",
        video: "",
        text: "",
        name: "",
        isSendChecked: false
      }
    }
    return result;
  },
  handleHeaderChange: function(event){
    this.setState({header: event.target.value});
  },
  handleFramingChange: function(event) {
    this.setState({framing: event.target.value});
  },
  handleTitleChange: function (event) {
    this.setState({title: event.target.value});
  },
  handleVideoChange: function (event) {
    var url = event.target.value;
    var videoID = url.split("/")[3];
    this.setState({video: videoID });
  },
  handleTextChange: function (event) {
    this.setState({text: event.target.value});
  },
  handleNameChange: function (event) {
    this.setState({name: event.target.value});
  },
  // boilerplate button handlers

  handleSendCheckToggle: function (isToggled) {
    this.setState({isSendChecked: isToggled});
  },
  handleCopySubmitClick: function(targetCopyUids) {
    if( this.state.isSendChecked ) {
      var currentStreamObject = TipCreatorStore.getCurrentStreamObject();
      if (!currentStreamObject) {
        currentStreamObject = TipCreatorStore.getPreviewStreamObject();
      }
      if (!currentStreamObject) {
        var currentStreamObject = {
          "uid": UID,
          "type": "Create",
        };
      }

      currentStreamObject = Object.assign(currentStreamObject, this.state);
      delete currentStreamObject.isSendChecked;
      TipCreatorActions.sendTipCreateNotification(currentStreamObject, {"uids": targetCopyUids});
    }
  },
  handleDeleteClick: function (event) {
    TipCreatorActions.deleteTip(TipCreatorStore.getCurrentStreamObject());
  },
  handlePreviewClick: function (event) {
    TipCreatorActions.previewTip(this.getCurrentContentObject());
  },
  handleSubmitClick: function (params) {
    var currentStreamObject = TipCreatorStore.getCurrentStreamObject();
    if (!currentStreamObject) {
      currentStreamObject = TipCreatorStore.getPreviewStreamObject();
    }
    if (!currentStreamObject) {
      var currentStreamObject = {
        "uid": UID,
        "type": "Create",
      };
    }

    currentStreamObject = Object.assign(currentStreamObject, this.state);
    delete currentStreamObject.isSendChecked;

    var sendOptions = {};
    sendOptions.publishDate = params.publishDate;
    var options = {
      sendOptions: sendOptions

    };

    if (currentStreamObject.id) {
      TipCreatorActions.updateTip(currentStreamObject);
    } else {
      TipCreatorActions.createTip(currentStreamObject, options);
    }
    if (this.state.isSendChecked) {
      TipCreatorActions.sendTipCreateNotification(currentStreamObject, {"uids": [UID]});
    }
  },
  render: function () {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Video Tip</h3>
        </div>
        <div className="panel-body">
          <TipCreatorFormButtons
            handlePreviewClick={this.handlePreviewClick}
            handleDeleteClick={this.handleDeleteClick}
            handleSubmitClick={this.handleSubmitClick}
            handleSendCheckToggle={this.handleSendCheckToggle}
          />
          <div className="form-group">
            <select value={this.state.header} id="videoHeader"  onChange={this.handleHeaderChange} className="form-control">
              <option value="">Select Header</option>
              <option value="Swellist Tip">Swellist Tip</option>
              <option value="Trending">Trending</option>
            </select>
          </div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Framing: </span>
            <input type="text" className="form-control" placeholder="Framing (optional)" id="videoFraming" value={this.state.framing} onChange={this.handleFramingChange}/>
          </div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Title: </span>
            <input type="text" className="form-control" placeholder="Title" id="videoTitle" value={this.state.title} onChange={this.handleTitleChange}/>
          </div>
          <div className='input-group'>
            <span className="input-group-addon" id="basic-addon1">Video URL </span>
            <input type="text" className="form-control" placeholder="Ex: https://youtu.be/BceHGzsDVLY" id="videoId" value={this.state.video} onChange={this.handleVideoChange}/>
          </div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Text: </span>
            <input type="text" className="form-control" placeholder="Text" id="videoDescriptionText" value={this.state.text} onChange={this.handleTextChange}/>
          </div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">File Name: </span>
            <input type="text" className="form-control" placeholder="File Name" id="tileName" value={this.state.name} onChange={this.handleNameChange}/>
          </div>
        </div>
      </div>
    );
  },
  getCurrentContentObject() {
    var currentStreamObject = TipCreatorStore.getCurrentStreamObject();
    if (!currentStreamObject) {
      currentStreamObject = TipCreatorStore.getPreviewStreamObject();
    }
    if (currentStreamObject) {
      var userTipData = this.getCurrentTipObject();
      if (this.state.name) {
        userTipData.name = this.state.name;
      }
      var userTip = Object.assign(currentStreamObject.object, userTipData);
      currentStreamObject.object = userTip;
      return currentStreamObject;
    } else {
      return this.getCurrentTipObject();
    }
  },
  _onChange: function () {
    this.setState(this.getState());
  },
  getState: function () {
    var result = TipCreatorStore.getPreviewContent();
    if (!result) {
      result = this.getCurrentTipObject();
    }
    result.isSendChecked = this.state.isSendChecked;
    return result;
  },
  getCurrentTipObject: function () {
    var object = {
      uid: UID,
      type: "video",
      header: this.state.header,
      framing: this.state.framing ? this.state.framing : "",
      title: this.state.title,
      video: this.state.video,
      text: this.state.text,
      name: this.state.name ? this.state.name : this.state.title
    };
    return object;
  }
});

module.exports = TipCreatorFormVideo;
