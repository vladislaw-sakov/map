var React = require('react')
  , TipCreatorActions = require('../TipCreatorActions.js')
  , TipCreatorFormButtons = require('./TipCreatorFormButtons.jsx')
  , TipCreatorStore = require('../TipCreatorStore.js')
  ;

var TipCreatorFormInternal = React.createClass({
  getInitialState: function () {
    var result = TipCreatorStore.getPreviewContent();
    if (!result) {
      result = {
        type: "internal",
        link: "",
        title: "",
        images: [{"url": ""}],
        text: "",
        buttonCopy: "",
        name: "",
        isSendChecked: false
      }
    }
    return result;
  },
  handleLinkChange: function (event) {
    this.setState({link: event.target.value});
  },
  handleTitleChange: function (event) {
    this.setState({title: event.target.value});
  },
  handleTextChange: function (event) {
    this.setState({text: event.target.value});
  },
  handleImageUrlChange: function (event) {
    this.setState({images: [{"url": event.target.value}]});
  },
  handleButtonCopyChange: function (event) {
    this.setState({buttonCopy: event.target.value});
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
        currentStreamObject = {
          "uid": UID,
          "type": "internal",
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
    var sendOptions = this.getCurrentContentOptions();
    sendOptions.uids = [UID];
    sendOptions.publishDate = params.publishDate;
    if (!currentStreamObject) {
      currentStreamObject = TipCreatorStore.getPreviewStreamObject();
    }
    if (!currentStreamObject) {
      currentStreamObject = {
        "uid": UID,
        "type": "internal",
      };
      sendOptions = {
       "uids": [UID],
       "publishDate": params.publishDate,
      };
    }
    var options = {
      sendOptions: sendOptions,
      shouldSendTipCreateNotification: this.state.isSendChecked
    };
    currentStreamObject = Object.assign(currentStreamObject, this.state);
    delete currentStreamObject.isSendChecked;

    if (currentStreamObject.id) {
      TipCreatorActions.updateTip(currentStreamObject, options);
    } else {
      TipCreatorActions.createTip(currentStreamObject, options);
    }
    if (this.state.isSendChecked) {
      TipCreatorActions.sendTipCreateNotification(currentStreamObject, {"uids": [UID]});
    }
  },
  render: function () {
    var selectedImageUrl = "";
    var selectedImageAttributes;
    if (this.state.images && this.state.images.length > 0) {
      var selectedImage = this.state.images[0];
      selectedImageUrl = selectedImage.url;
    }
    var selectedImageAttributes = (
      <div className='input-group'>
        <span className="input-group-addon" id="basic-addon1">Image URL: </span>
        <input type="text" className="form-control" placeholder="Swellist-web URL" id="linkText" value={selectedImageUrl} onChange={this.handleImageUrlChange}/>
      </div>
    );
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Internal Tip</h3>
        </div>
        <div className="panel-body">
          <TipCreatorFormButtons
            handlePreviewClick={this.handlePreviewClick}
            handleDeleteClick={this.handleDeleteClick}
            handleSubmitClick={this.handleSubmitClick}
            handleSendCheckToggle={this.handleSendCheckToggle}
          />
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Link: </span>
              <select value={this.state.link} onChange={this.handleLinkChange} className="form-control">
                <option value="">Select Internal Location</option>
                <option value="notepad">Notepad</option>
                <option value="profile">Profile</option>
                <option value="team">Team</option>
                <option value="example">Example</option>
                <option value="blog">Blog</option>
                <option value="feed">Feed</option>
              </select>
          </div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Title: </span>
            <input type="text" className="form-control" placeholder="Title" id="quizTitle" value={this.state.title} onChange={this.handleTitleChange}/>
          </div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Text: </span>
            <input type="text" className="form-control" placeholder="Text" id="quizDescriptionText" value={this.state.text} onChange={this.handleTextChange}/>
          </div>
          {selectedImageAttributes}
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Button Text: </span>
            <input type="text" className="form-control" placeholder="Button Text" id="buttonCopy" value={this.state.buttonCopy} onChange={this.handleButtonCopyChange}/>
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
      var userTip = Object.assign(currentStreamObject, userTipData);
      return userTip;
    } else {
      var userTipData = this.getCurrentTipObject();
      userTipData.uid = UID;
      userTipData.type = "internal";
      return userTipData;
    }
  },
  getCurrentContentOptions() {
    var curSelected = this.state.images[0];
    var imageUrl = (curSelected && curSelected.url) || "";
    var link = this.state.link;
    var header = this.state.name;
    var title = this.state.title;
    var text = "";
    var textArray = [];
    if (this.state.text) {
      textArray = this.state.text.split(" ");
    }
    if (textArray.length > 28) {
      var dots = "...";
      text = textArray.slice(0, 26).join(" ").concat(dots);
    } else {
      text = this.state.text;
    }
    var subject = "You have a new message from Swellist!";
    var options = {
      "substitutions": {
        "%imageUrl%": [imageUrl],
        "%link%": [link],
        "%header%": [header],
        "%title%": [title],
        "%text%": [text],
        "%subject%": [subject]
      },
      "subject": subject
    }
    return options;
  },
  _onChange: function () {
    this.setState(this.getState());
  },
  getState: function () {
    var result = TipCreatorStore.getPreviewContent();
    if (!result) {
      result = this.getCurrentTipObject();
    }
    result.isLoading = TipCreatorStore.getIsScraping();
    result.isSendChecked = this.state.isSendChecked;
    return result;
  },
  getCurrentTipObject: function () {
    var object = {
      link: this.state.link,
      type: "internal",
      title: this.state.title,
      text: this.state.text,
      buttonCopy: this.state.buttonCopy,
      name: this.state.name ? this.state.name : this.state.title,
      images: this.state.images
    };
    return object;
  }
});

module.exports = TipCreatorFormInternal;
