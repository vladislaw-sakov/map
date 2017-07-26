var React = require('react')
    ;

var TipCreatorFormSelector = React.createClass({
    getInitialState: function() {
        return {
            "selectedValue": ""
        }
    },
    handleChange: function(event) {
        this.setState({
            "selectedValue": event.target.value
        });
        this.props.typeSelectionHandler(event.target.value);
    },
    render: function () {
        return (
            <div className="form-group">
                <select value={this.state.selectedValue} onChange={this.handleChange} className="form-control">
                        <option value="">Select Tip Type</option>
                        <option value="link">Link</option>
                        <option value="typeformQuiz">Typeform</option>
                        <option value="video">Video</option>
                        <option value="internal">Internal</option>
                        <option value="html">Custom</option>
                </select>
            </div>
        );
    }
});

module.exports = TipCreatorFormSelector;
