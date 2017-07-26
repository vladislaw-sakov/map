var React = require('react')
    , TipCreatorActions = require('../TipCreatorActions.js')
    , TipCreatorStore = require('../TipCreatorStore.js')
    , TipCreatorFormButtons = require('./TipCreatorFormButtons.jsx')
    ;

var CKHolder = React.createClass({
    getInitialState: function() {
        return this.getState();
    },
    componentDidMount: function() {
        const script = document.createElement("script");
        script.src = "/js/ckeditor/ckeditor.js";
        script.async = true;

        document.body.appendChild(script);

        function doCKEditor() {
          if(CKEDITOR) {
            CKEDITOR.replace( 'editor1' );
            window.clearTimeout(timeoutId);
          }
        }
        var timeoutId = window.setTimeout(doCKEditor, 1000);
        TipCreatorStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        TipCreatorStore.removeChangeListener(this._onChange);
    },
    render: function() {
        return (
            <div>
                <textarea name="editor1" id="editor1" rows="10" cols="80" defaultValue={this.state.html}>

                </textarea>
            </div>
        )
    },
    _onChange:function() {
        var state = this.getState();
        this.setState(state);
        CKEDITOR.instances['editor1'].setData(state.html);
    },
    getState: function() {
        var currentStreamObject = TipCreatorStore.getCurrentStreamObject();
        if( !currentStreamObject ) {
            currentStreamObject = TipCreatorStore.getPreviewStreamObject();
        }
        var html = "";
        if( currentStreamObject ) {
            var content = currentStreamObject.content;
            if (content) {
                html = decodeURIComponent(content);
            }
        }
        return {
            html: html
        }
    }
});

var TipCreatorFormHTML = React.createClass({
    getInitialState: function() {
        return this.getState();
    },

    componentDidMount: function() {
        TipCreatorStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        TipCreatorStore.removeChangeListener(this._onChange);
    },

    handleNameChange: function(event) {
        this.setState({name:event.target.value});
    },

    handleSendCheckToggle: function(isToggled) {
        this.setState({isSendChecked: isToggled});
    },

    handleCopySubmitClick: function(targetCopyUids) {
      if( this.state.isSendChecked ) {
        var streamObject = this.getCurrentStreamObject();
        TipCreatorActions.sendTipCreateNotification(streamObject, {"uids": targetCopyUids});
      }
    },

    handleDeleteClick: function(event) {
        TipCreatorActions.deleteTip(this.getCurrentStreamObject());
    },

    handlePreviewClick: function(event) {
        TipCreatorActions.previewTip(this.getCurrentStreamObject());
    },

    handleSubmitClick: function(event) {
        var streamObject = this.getCurrentStreamObject();
        if( streamObject.id ) {
            TipCreatorActions.updateTip(streamObject);
        } else {
            TipCreatorActions.createTip(streamObject);
        }
        if( this.state.isSendChecked ) {
            TipCreatorActions.sendTipCreateNotification(streamObject, {"uids": [UID]});
        }
    },
    render: function () {
        // note that the random key forces CKHolder to reload,
        // we need that to force its content to be correct (unless there's some other way than just
        return (
            <div>
                <CKHolder html={this.state.html}/>
                <label>Name: <input type="text" onChange={this.handleNameChange} value={this.state.name}></input></label>
                <TipCreatorFormButtons
                    handlePreviewClick={this.handlePreviewClick}
                    handleDeleteClick={this.handleDeleteClick}
                    handleSubmitClick={this.handleSubmitClick}
                    handleSendCheckToggle={this.handleSendCheckToggle}
                    handleCopySubmitClick={this.handleCopySubmitClick}
                    />
            </div>
        );
    },

    _onChange:function() {
        this.setState(this.getState());
    },

    getState() {
        var currentStreamObject = TipCreatorStore.getCurrentStreamObject();
        if( !currentStreamObject ) {
            currentStreamObject = TipCreatorStore.getPreviewStreamObject();
        }
        var html = "";
        var name = "";
        if( currentStreamObject ) {
            var content = currentStreamObject.content;
            if( content ) {
                html = decodeURIComponent( content );
            }
            name = currentStreamObject.name ? currentStreamObject.name : name;
        }
        return {
            "html":html,
            "isSendChecked": false,
            "name": name
        }
    },

    getCurrentStreamObject() {
        var currentStreamObject = TipCreatorStore.getCurrentStreamObject();
        if( !currentStreamObject ) {
            currentStreamObject = TipCreatorStore.getPreviewStreamObject();
        }
        if( currentStreamObject ) {
            var userTipData = {
                content: encodeURIComponent(CKEDITOR.instances.editor1.getData())
            };
            if( this.state.name ) {
                userTipData.name = this.state.name;
            }
            var userTip = Object.assign(currentStreamObject, userTipData);
            currentStreamObject = userTip;
            return currentStreamObject;
        } else {
            var object = {
                "uid": UID,
                type: "Article",
                mediaType: "text/html",
                name: "Article : " + UID + Math.round(Math.random()*100).toString(),
                content: encodeURIComponent(CKEDITOR.instances.editor1.getData())
            };
            if( this.state.name ) {
                object.name = this.state.name;
            }

            var newStreamObject = Object.assign(userTipData, object);
            return newStreamObject;
        }
    }
});

module.exports = TipCreatorFormHTML;
