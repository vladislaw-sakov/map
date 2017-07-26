var React = require('react')
  , SwellStreamStore = require('../../store/swell/SwellStreamStore_v2.js')
  , SwellStreamActions = require('./SwellStreamActions.js')
  , moment = require('moment')
  ;

var StreamObjectRow = React.createClass({
  onClick: function (event) {
    event.preventDefault();
    this.props.handleSelection(this.props.streamObject);
  },
  render: function () {
    var time = (this.props.streamObject.lastUpdate * 1000);
    var now = moment(time).format("MM-DD-YY HH:mm");
    var rowTitle = this.props.streamObject.name;
    var idString = this.props.streamObject.id;
    if (this.props.streamObject.rating == .1 ) {
      idString = `&#128545; ${idString}`;
    } else if (this.props.streamObject.rating == .5) {
      idString = `&#128528; ${idString}`;
    } else if (this.props.streamObject.rating == 1) {
      idString = `&#128150; ${idString}`;
    }
      var txt = document.createElement("textarea");
      txt.innerHTML = idString; 
      idString = txt.value;
    return (<tr onClick={this.onClick} className="stream-object-selector-row">
      <td>{idString}</td>
      <td>{rowTitle}</td>
      <td>{now}</td>
    </tr>);
  }
});

function getState() {
  return {
    orderedItems: SwellStreamStore.getStreamObjects()
  }
}

var StreamObjectSelector = React.createClass({
  getInitialState: function () {
    return getState();
  },
  componentDidMount: function () {
    SwellStreamStore.addChangeListener(this._onChange);
    SwellStreamActions.fetchUserStream();
  },
  componentWillUnmount: function () {
    SwellStreamStore.removeChangeListener(this._onChange);
  },
  onSelectStreamObject: function (streamObject) {
    SwellStreamActions.selectStreamObject(streamObject);
  },

  render: function () {
    var streamObjects = this.state.orderedItems.map((streamObject, index) => {
        var streamObject = streamObject;
    return <StreamObjectRow streamObject={streamObject} handleSelection={this.onSelectStreamObject}
                            key={"streamobject-"+index}/>
  })
    ;
    return (
      <div className="stream-object-selector">
        <div className="panel panel-default">
          <table className="table">
            <thead>
              <tr>
                <th>id</th>
                <th>Title</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {streamObjects}
            </tbody>
          </table>
        </div>
      </div>
    );
  },

  _onChange: function () {
    this.setState(getState());
  }
});

module.exports = StreamObjectSelector;
