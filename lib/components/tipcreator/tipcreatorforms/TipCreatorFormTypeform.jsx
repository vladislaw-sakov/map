var React = require('react')
  , TipCreatorActions = require('../TipCreatorActions.js')
  , TipCreatorFormButtons = require('./TipCreatorFormButtons.jsx')
  , TipCreatorStore = require('../TipCreatorStore.js')
  ;

var TipCreatorFormTypeform = React.createClass({
  getInitialState: function () {
    var result = TipCreatorStore.getPreviewContent();
    if (!result) {
      result = {
        type: "typeformQuiz",
        quizId: "",
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
  handleQuizIdChange: function (event) {
    this.setState({quizId: event.target.value});
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
          "type": "typeformQuiz",
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
      currentStreamObject = {
        "uid": UID,
        "type": "typeformQuiz",
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
          <h3 className="panel-title">Typeform Tip</h3>
        </div>
        <div className="panel-body">
          <TipCreatorFormButtons
            handlePreviewClick={this.handlePreviewClick}
            handleDeleteClick={this.handleDeleteClick}
            handleSubmitClick={this.handleSubmitClick}
            handleSendCheckToggle={this.handleSendCheckToggle}
          />
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Quiz Id: </span>
            <input type="text" className="form-control" placeholder="Quiz Id" id="quizId" value={this.state.quizId} onChange={this.handleQuizIdChange}/>
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
      userTipData.type = "typeformQuiz";
      return userTipData;
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
    result.isLoading = TipCreatorStore.getIsScraping();
    result.isSendChecked = this.state.isSendChecked;
    return result;
  },
  getCurrentTipObject: function () {
    var object = {
      quizId: this.state.quizId,
      type: this.state.type,
      title: this.state.title,
      text: this.state.text,
      buttonCopy: this.state.buttonText,
      name: this.state.name ? this.state.name : this.state.title,
      images: this.state.images
    };
    return object;
  }
});

module.exports = TipCreatorFormTypeform;
