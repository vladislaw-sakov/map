var React = require('react')
    , StreamObjectSelector = require('./StreamObjectSelector.js')
    , TipCreatorFormContainer = require('./TipCreatorFormContainer.js')
    , TipCreatorPreviewContainer = require('./TipCreatorPreviewContainer.js')
    , SwellStreamActions = require('./SwellStreamActions.js')
    ;

var TipCreatorView = React.createClass({
    getInitialState: function() {
        return {};
    },
    componentDidMount: function() {

    },
    componentWillUnmount: function() {

    },

    handleNewClick: function(event) {
        event.preventDefault();
        SwellStreamActions.clearStreamObjectSelection();
    },

    handlePreviewClick: function() {
        var html = CKEDITOR.instances.editor1.getData();
        this.setState({"html": html});
    },

    render: function () {
        return (
            <div id="tip-creator-container" className="container">
                <div className="row">
                    <div className="col-md-3 tip-creator-object-selector-container">
                        <button className="btn btn-default" onClick={this.handleNewClick}>Create New</button>
                        <StreamObjectSelector />
                    </div>
                        <TipCreatorFormContainer />
                        <TipCreatorPreviewContainer />
                </div>
            </div>
        );
    },
    _onChange: function() {

    }
});

module.exports = TipCreatorView;
