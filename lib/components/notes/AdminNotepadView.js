
import React from 'react';
import moment from 'moment';

class AdminNotepadView extends React.Component {
  constructor(props) {
    super(props);
    this.noteKey = this.props.uid + ":1";
    this.handleNotesUpdate = this.handleNotesUpdate.bind(this);
    this.props.notesStore.addChangeListener(this.handleNotesUpdate);
    var note = this.props.notesStore.getNoteWithKey(this.noteKey);
    this.state = {note: note};
  }

  handleNotesUpdate() {
    var note = this.props.notesStore.getNoteWithKey(this.noteKey);
    if( !note ) {
      return;
    }
    this.setState({note:note});
  }

  render() {
    var blockViews = [];
    if(!this.state.note || !this.state.note.blocks || !this.state.note.blocks.length) {
      return <div>No User Notes</div>
    }
    var blocks = this.state.note.blocks;
    for(let block of blocks) {
      if(block.text) {
        var blockStyle = {"font-size": "0.5em"};
        var updateTime = block.lastUpdate;
        var timestamp;
        if(updateTime) {
          if(Math.round(new Date().getTime()/1000)-updateTime<86400) {
            blockStyle.backgroundColor = "#66CC88";
          } else if(Math.round(new Date().getTime()/1000)-updateTime<86400*7) {
            blockStyle.backgroundColor = "#CC8833";
          }
          timestamp = <span style={blockStyle}>{moment(updateTime*1000).format('MMMM Do YYYY, h:mm:ss a')}<br/></span>
        }

        blockViews.push(
          <p>{timestamp}<span>{block.text}</span></p>
        );
      }
    }
    return(
      <div className="RichEditor-root">
        {blockViews}
      </div>
    )
  }
}

module.exports = AdminNotepadView;
