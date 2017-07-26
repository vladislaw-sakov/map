var React = require('react')
, TipCreatorActions = require('../TipCreatorActions.js')
, TipCreatorFormButtons = require('./TipCreatorFormButtons.jsx')
, TipCreatorStore = require('../TipCreatorStore.js')
;

var TipCreatorFormLink = React.createClass({
  getInitialState: function() {
    var result = TipCreatorStore.getPreviewContent();
    if( !result ) {
      result = {
        link: "",
        title: "",
        name: "",
        type: "link",
        header: "Swellist Tip",
        text: "",
        framing: "",
        buttonText: "Go",
        images: []
      }
    }
    result.isLoading = TipCreatorStore.getIsScraping();
    result.isSendChecked = false;
    return result;
  },
  componentDidMount: function() {
    TipCreatorStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    TipCreatorStore.removeChangeListener(this._onChange);
  },
  handleLinkChange: function(event) {
    this.setState({link:event.target.value});
  },
  handleScrapedImageClick: function(index) {
    var updatedImages = this.state.images.slice();
    var selectedObjects = updatedImages.splice(index, 1);
    if( selectedObjects && selectedObjects.length ) {
      updatedImages.unshift(selectedObjects[0]);
      this.setState({images:updatedImages});
    }
  },
  handleTitleChange: function(event) {
    this.setState({title: event.target.value});
  },
  handleTextChange: function(event) {
    this.setState({text: event.target.value});
  },
  handleButtonTextChange: function(event) {
    this.setState({buttonText: event.target.value});
  },
  handleFramingChange: function(event) {
    this.setState({framing: event.target.value});
  },
  handleHeaderChange: function(event){
    this.setState({header: event.target.value});
  },
  handleNameChange: function(event) {
    this.setState({name: event.target.value});
  },
  handleImageUrlChange: function(event) {
    var newUrl = event.target.value;
    if(!this.state.images || this.state.images.length < 1) {
      this.state.images = [{}];
    }
    var curSelected = this.state.images[0];
    curSelected.url = newUrl;
    this.setState({images: this.state.images});
  },
  handleScrapeSubmit: function(event) {
    TipCreatorActions.scrapeLink(this.state.link);
  },
  handleSendCheckToggle: function(isToggled) {
    this.setState({isSendChecked: isToggled});
  },
  handleSendSingleTipEmail: function() {
    var options = this.getCurrentContentOptions();
    options.uids = [UID];
    TipCreatorActions.sendSingleTipNotification(options);
  },
  handleCopySubmitClick: function(targetCopyUids) {
    if( this.state.isSendChecked ) {
      var options = this.getCurrentContentOptions();
      options.uids = targetCopyUids;
      TipCreatorActions.sendTipCreateNotification(options);
    }
  },
  handleDeleteClick: function(event) {
    TipCreatorActions.deleteTip(this.getCurrentContentObject());
  },
  handlePreviewClick: function(event) {
    TipCreatorActions.previewTip(this.getCurrentContentObject());
  },
  handleSubmitClick: function(params) {
    var streamObject = this.getCurrentContentObject();
    var sendOptions = this.getCurrentContentOptions();
    sendOptions.uids = [UID];
    sendOptions.publishDate = params.publishDate;
    var options = {
      sendOptions: sendOptions,
      shouldSendTipCreateNotification: this.state.isSendChecked

    };
    if( streamObject.id ) {
      TipCreatorActions.updateTip(streamObject, options);
    } else {
      TipCreatorActions.createTip(streamObject, options);
    }
  },
  render: function () {
    var scrapedImageNodes;
    var selectedImage;
    var selectedImageUrl = "";
    var selectedImageAttributes;

    if(this.state.images && this.state.images.length) {
       scrapedImageNodes = this.state.images.map((imageObj, index)=>{
        var imageUrl = imageObj.url;
        var thumbClass = "";
        if (index < 1) {
          thumbClass = "thumbnail img-selected"
        } else {
          thumbClass = "thumbnail"
        }
        return(
          <a key={"scraped-image-"+index} className={thumbClass} >
            <img src={imageUrl} id={"img"+index} className="tip-creator-scraped-image" onClick={(event)=>{this.handleScrapedImageClick(index)}}/>
          </a>
        );
      });

      selectedImage = this.state.images[0];
      selectedImageUrl = selectedImage.url;
    }

    var selectedImageAttributes = (
      <div className='input-group'>
        <span className="input-group-addon" id="basic-addon1">Image URL: </span>
        <input type="text" className="form-control" id="linkText" value={selectedImageUrl} onChange={this.handleImageUrlChange}></input>
      </div>
    );
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">Link Tip</h3>
        </div>
        <div className="panel-body">
          <TipCreatorFormButtons
            handlePreviewClick={this.handlePreviewClick}
            handleDeleteClick={this.handleDeleteClick}
            handleSubmitClick={this.handleSubmitClick}
            handleSendCheckToggle={this.handleSendCheckToggle}
            handleCopySubmitClick={this.handleCopySubmitClick}
          />
          <span hidden={!this.state.isLoading} id="scrapingMessage" className="text-muted">Scraping link...</span>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Link: </span>
            <input type="input" id="link" className="form-control" placeholder="Origin link" value={this.state.link} onChange={this.handleLinkChange}></input>
            <span className="input-group-btn">
              <button className="btn btn-default" type="button" onClick={this.handleScrapeSubmit} hidden={this.state.isLoading}>Scrape</button>
            </span>
          </div>
          <div className="form-group">
            <select value={this.state.header} id="linkHeader"  onChange={this.handleHeaderChange} className="form-control">
              <option value="">Select Header</option>
              <option value="Swellist Tip">Swellist Tip</option>
              <option value="Trending">Trending</option>
              <option value="Weekend Trip">Weekend Trip</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Around NYC">Around NYC</option>
            <option value="Live &#10084; Learn">Live &#10084; Learn</option>
            </select>
          </div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon1">Framing: </span>
            <input type="text" className="form-control" placeholder="Framing (optional)" id="linkFraming" value={this.state.framing} onChange={this.handleFramingChange}/>
          </div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon2">Title: </span>
            <input type="text" className="form-control" placeholder="Title" id="linkTitle" value={this.state.title} onChange={this.handleTitleChange}/>
          </div>
          <div className="input-group">
            <span className="input-group-addon" id="basic-addon3">Text: </span>
             <textarea className="form-control" rows="3" placeholder="Text" id="linkText" value={this.state.text} onChange={this.handleTextChange}></textarea>
          </div>
          <div className="form-group">
            <select value={this.state.buttonText} id="linkButtonTex"  onChange={this.handleButtonTextChange} className="form-control">
              <option value="">Select Button Text</option>
              <option value="Read Now">Read Now</option>
              <option value="Learn More">Learn More</option>
              <option value="Answer">Answer</option>
              <option value="Buy Tickets">Buy tickets</option>
              <option value="Book">Book</option>
              <option value="Go">Go</option>
            </select>
          </div>
         <div className="input-group">
            <span className="input-group-addon" id="basic-addon5">File Name: </span>
            <input type="text" className="form-control" placeholder="File name (optional)" id="linkName" value={this.state.name} onChange={this.handleNameChange}/>
          </div>
          {selectedImageAttributes}
          <div id="scrapedImageGallery" className="create-reco-section" hidden={ scrapedImageNodes && scrapedImageNodes.length ? false : true } >
            <label>Scraped images</label>
            <div id="scrapedImagesRow" className="row">
            {scrapedImageNodes}
            </div>
          </div>
        </div>
      </div>
    );
  },
  getCurrentContentObject() {
    var currentStreamObject = TipCreatorStore.getCurrentStreamObject();
    if( !currentStreamObject ) {
      currentStreamObject = TipCreatorStore.getPreviewStreamObject();
    }
    if( currentStreamObject ) {
      var userTipData = this.getCurrentTipObject();
      if( this.state.name ) {
        userTipData.name = this.state.name;
      }
      var userTip = Object.assign(currentStreamObject, userTipData);
      return userTip;
    } else {
      var userTip = this.getCurrentTipObject();
      userTip.uid = UID;
      return userTip;
    }
  },
  getCurrentContentOptions() {
      var curSelected = this.state.images[0];
      var imageUrl = (curSelected && curSelected.url) || "";
      var link = this.state.link
      var header = this.state.header;
      var title = this.state.title;
      var text = this.state.text;
      // var textArray = [];
      // if (this.state.text) {
      //   var textArray = this.state.text.split(" ");
      // }
      // if (textArray.length > 28) {
      //   var dots = "...";
      //   text = textArray.slice(0, 26).join(" ").concat(dots);
      // } else {
      //   text = this.state.text;
      // }
      var subject = this.state.framing || "You have a new tip!";
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
  _onChange: function() {
    this.setState(this.getState());
  },
  getState: function() {
    var result = TipCreatorStore.getPreviewContent();
    if( !result ) {
      result = this.getCurrentTipObject();
    }
    result.isLoading = TipCreatorStore.getIsScraping();
    result.isSendChecked = this.state.isSendChecked;
    return result;
  },
  getCurrentTipObject: function() {
    var object = {
      link: this.state.link,
      type: "link",
      header: this.state.header,
      title: this.state.title,
      text: this.state.text,
      framing: this.state.framing,
      buttonText: this.state.buttonText,
      name: this.state.name ? this.state.name : this.state.title,
      images: this.state.images
    };
    return object;
  }
});

module.exports = TipCreatorFormLink;
