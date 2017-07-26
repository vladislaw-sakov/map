var React = require('react')
    , TipCreatorStore = require('./TipCreatorStore.js')
    , TipCreatorActions = require('./TipCreatorActions.js')
    , TipCreatorFormSelector = require('./tipcreatorforms/TipCreatorFormSelector.jsx')
    , TipCreatorFormHTML = require('./tipcreatorforms/TipCreatorFormHTML.jsx')
    , TipCreatorFormLink = require('./tipcreatorforms/TipCreatorFormLink.jsx')
    , TipCreatorFormTypeform = require('./tipcreatorforms/TipCreatorFormTypeform.jsx')
    , TipCreatorFormVideo = require('./tipcreatorforms/TipCreatorFormVideo.jsx')
    , TipCreatorFormInternal = require('./tipcreatorforms/TipCreatorFormInternal.js')
    ;

var TipCreatorFormContainer = React.createClass({
    getInitialState: function() {
        return getState();
    },
    componentDidMount: function() {
        TipCreatorStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        TipCreatorStore.removeChangeListener(this._onChange);
    },

    handleTipTypeSelectionChange: function(value) {
        TipCreatorActions.setCreatorFormType(value);
    },
    render: function () {
        var content = null;
        if( this.state.formType ) {
            content = getFormViewForType(this.state.formType);
        } else {
            content = <TipCreatorFormSelector typeSelectionHandler={this.handleTipTypeSelectionChange}/>;
        }

        return (
            <div className="col-md-5" style={{"marginTop": "30px"}} >
                {content}
            </div>
        )
    },
    _onChange: function() {
        this.setState(getState());
    }
});

function getFormViewForType(type) {
    switch(type) {
        case "Article":
        case "html":
            return <TipCreatorFormHTML />;
        case "Link":
        case "link":
            return <TipCreatorFormLink />;
        case "typeformQuiz":
            return <TipCreatorFormTypeform />;
        case "video":
          return <TipCreatorFormVideo />;
        case "internal": 
            return <TipCreatorFormInternal />;
    }
}

function getState() {
    var formType = TipCreatorStore.getCurrentTipCreatorFormType();
    return {
        "mode": TipCreatorStore.getCurrentMode(),
        "formType": formType
    }
}

module.exports = TipCreatorFormContainer;
