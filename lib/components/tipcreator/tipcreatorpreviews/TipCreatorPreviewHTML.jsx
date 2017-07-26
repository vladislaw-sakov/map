var React = require('react')
    ;

var TipCreatorPreviewHTML = React.createClass({

    render: function () {
        var html = "";
        if( this.props.streamObject ) {
            var content = this.props.streamObject.content;
            if( content ) {
                var html = decodeURIComponent( content );
            }
        }
        return (
            <div>
                <div id="tip-creator-preview" className="tip-creator-preview" dangerouslySetInnerHTML={{__html: html}}></div>
            </div>
        );
    }
});



module.exports = TipCreatorPreviewHTML;
