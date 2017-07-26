var React = require('react')
  , TipCreatorStore = require('./TipCreatorStore.js')
  , TipCreatorPreviewHTML = require('./tipcreatorpreviews/TipCreatorPreviewHTML.jsx')
  , TipViewLink = require('../userdashboard/tipviews/TipViewLink.jsx')
  , TipViewTypeform = require('../userdashboard/tipviews/TipViewTypeform.jsx')
  , TipViewVideo = require('../userdashboard/tipviews/TipViewVideo.js')
  , TipViewInternal = require('../userdashboard/tipviews/TipViewInternal.js')
  ;

var TipCreatorPreviewContainer = React.createClass({
  getInitialState: function () {
    return getState();
  },
  componentDidMount: function () {
    TipCreatorStore.addChangeListener(this._onChange);
  },
  render: function () {
    var tipNode = null;
    var userComment = null;
    switch (this.state.objectType) {
      case "Article":
      case "html":
        tipNode = <TipCreatorPreviewHTML streamObject={this.state.streamObject}/>
        break;
      case "Link":
      case "link":
        tipNode = <TipViewLink streamObject={this.state.streamObject}/>
        userComment = this.state.streamObject.comment ? this.state.streamObject.comment : "";
        break;
      case "Typeform":
      case "typeformQuiz":
        tipNode = <TipViewTypeform streamObject={this.state.streamObject}/>
        break;
      case "video":
      case "Video":
        tipNode = <TipViewVideo streamObject={this.state.streamObject} />
        userComment = this.state.streamObject.comment ? this.state.streamObject.comment : "";
              case "video":
        break;
      case "internal":
      case "Internal": 
        tipNode = <TipViewInternal streamObject={this.state.streamObject} />
        break;
    }

        return (
          <div className="col-md-4">
            <div className="safari-phone-outer">
              <div className="tip-creator-preview-container">
                {tipNode}
              </div>
              <div className="panel panel-warning user-feedback-admin">
                <div className="panel-heading">User Comment</div>
                <div className="panel-body">
                  {userComment}
                </div>
              </div>
            </div>
          </div>
        );
    }
    ,
    _onChange: function () {
      this.setState(getState());
    }
  });

function getState() {
  var streamObject = TipCreatorStore.getCurrentStreamObject();
  if (!streamObject) {
    streamObject = TipCreatorStore.getPreviewStreamObject();
  }
  var objectType = TipCreatorStore.getCurrentStreamObjectContentType();
  if (!objectType) {
    objectType = TipCreatorStore.getPreviewStreamObjectContentType();
  }
  return {
    streamObject: streamObject,
    objectType: objectType
  }
}
module.exports = TipCreatorPreviewContainer;
