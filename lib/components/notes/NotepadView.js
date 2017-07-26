'use strict';

import {
  Editor,
  EditorState,
  ContentState,
  RichUtils,
  convertToRaw,
  convertFromRaw
} from 'draft-js';
import React from 'react';
import NotepadActions from '../../actions/notepad/NotepadActions.js';

// Wait time before kicking off a save.
export const SAVE_INTERVAL = 2000;

class NotepadView extends React.Component {
  constructor(props) {
    super(props);
    var editorState;
    this.noteKey = this.props.uid + ":1";
    var noteRaw = this.props.notesStore.getNoteWithKey(this.noteKey, this.props.useLocal);
    if(noteRaw) {

      // we have to keep a copy of existing lastUpdate times since
      // the draft-js blocks to keep them around
      // if(noteRaw.blocks && noteRaw.blocks.length) {
      //   this.lastUpdates = {};
      //   for(let block of noteRaw.blocks) {
      //     if(block.lastUpdate) {
      //       this.lastUpdates[block.key] = block.lastUpdate;
      //     }
      //   }
      // }
      var contentState = convertFromRaw(noteRaw);
      editorState = EditorState.createWithContent(contentState);
    } else {
      editorState = EditorState.createEmpty();
    }
    this.state = {editorState: editorState};

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => this._handleChange(editorState);
    this.notepadActions = new NotepadActions();

    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.handleNotesUpdate = () => this._handleNotesUpdate();

    this.props.notesStore.addChangeListener(this.handleNotesUpdate);
    this.notepadActions.fetchNoteWithKey(this.noteKey);

    this.updatedBlocks = [];
  }

  componentWillUnmount() {
    if( this.saveIntervalId ) {
      this.saveNote();
      clearInterval(this.saveIntervalId);
    }
  }

  saveNote() {
    let contentState = this.state.editorState.getCurrentContent();
    if(!contentState) {
      return;
    }
    let raw = convertToRaw(contentState);
    if(!raw){
      return;
    }

    let blocks = raw.blocks;
    let now = Math.round(new Date().getTime()/1000);
    let updatedBlocks = {};
    // if(blocks && blocks.length) {
    //   for(let update of this.updatedBlocks) {
    //     let isInRange = false;
    //     for(let block of blocks) {
    //       if(block.key === update.startKey) {
    //         isInRange = true;
    //       }
    //       if(isInRange) {
    //         updatedBlocks[block.key] = now;
    //       }
    //       if(block.key === update.endKey) {
    //         break;
    //       }
    //     }
    //   }
    //   this.updatedBlocks = [];
    // }
    this.notepadActions.saveNote(this.noteKey, raw, updatedBlocks);
    if( this.props.tracker ) {
      this.props.tracker.track("Notepad_Action", {"action": "save", "uid": this.props.uid});
    }
  }

  _handleNotesUpdate() {
    var noteRaw = this.props.notesStore.getNoteWithKey(this.noteKey);
    if( !noteRaw ) {
      return;
    }
    var contentState = convertFromRaw(noteRaw);
    if(!contentState) {
      return;
    }
    var editorState = EditorState.createWithContent(contentState);
    this.setState({editorState:editorState});
  }

  _handleChange(editorState) {
    var selectionState = editorState.getSelection();
    var startKey = selectionState.getStartKey();
    var endKey = selectionState.getEndKey();
    this.updatedBlocks.push({"startKey": startKey, "endKey": endKey});

    this.setState({editorState: editorState});

    if( this.saveIntervalId ) {
      clearInterval(this.saveIntervalId);
    }
    this.saveIntervalId = setInterval(()=>{
      clearInterval(this.saveIntervalId);
      this.saveNote();
    }, SAVE_INTERVAL);
  }

  _handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  render() {
    const {editorState} = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = '';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    var placeholder = "Welcome to your notes!  This is where you can keep all your ideas for things you want to do or plan.  Swellist will analyze your notes daily and update your tips feed with helpful information.";

    return (
      <div className="notepad">
        <div className="notepad-container container">
          <div className="RichEditor-root">
            <div className={className} onClick={this.focus}>
              <Editor
                blockStyleFn={getBlockStyle}
                customStyleMap={styleMap}
                editorState={editorState}
                handleKeyCommand={this.handleKeyCommand}
                onChange={this.onChange}
                placeholder={placeholder}
                ref="editor"
                spellCheck={true}
                />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
      {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
  .getCurrentContent()
  .getBlockForKey(selection.getStartKey())
  .getType();

  return (
    <div className="RichEditor-controls">
    {BLOCK_TYPES.map((type) =>
      <StyleButton
      key={type.label}
      active={type.style === blockType}
      label={type.label}
      onToggle={props.onToggle}
      style={type.style}
      />
    )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
    {INLINE_STYLES.map(type =>
      <StyleButton
      key={type.label}
      active={currentStyle.has(type.style)}
      label={type.label}
      onToggle={props.onToggle}
      style={type.style}
      />
    )}
    </div>
  );
};

module.exports = NotepadView;
