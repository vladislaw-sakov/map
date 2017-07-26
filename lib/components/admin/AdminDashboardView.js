var React = require('react')
  , ReactDOM = require('react-dom')
  , WunderlistAPIUtils = require('./WunderlistAPIUtils.js')
  , SwellAdminAPIUtils = require('./SwellAdminAPIUtils.js')
  , AdminDashboardStore = require('./AdminDashboardStore.js')
  , AdminDashboardHeaderView = require('./AdminDashboardHeaderView.js')
  , AdminDashboardTypeformView = require('./AdminDashboardTypeformView.js')
  , AdminDashboardRawView = require('./AdminDashboardRawView.js')
  , AdminNotepadView = require('../notes/AdminNotepadView.js')
  , AdminTargetUserStore = require('./AdminTargetUserStore.js')
  , AdminButtonView = require('./AdminButtonView.js')
  , CreateContainer = require('./AdminDashboardCreateContainer')
  , AdminDashboardNavbarView = require('./AdminDashboardNavbarView.js')
  , NotesStore = require('../../store/notes/NotesStore.js')
  , NotepadActions = require('../../actions/notepad/NotepadActions.js')
  , notepadActions = new NotepadActions()
  , AdminNotesStore = require('../../store/admin/AdminStore.js')
  , AdminDashboardActions = require('./AdminDashboardActions.js')
  , CalendarView = require('./CalendarView.js')
  ;

var AdminRootView = React.createClass({
  getInitialState: function() {
    var route = window.location.hash.substr(1);
    return {
      uid: UID,
      isLoading: AdminDashboardStore.getIsLoading(),
      route: route
    }
  },
  componentDidMount: function() {
    AdminDashboardStore.addChangeListener(this._onChange);
    WunderlistAPIUtils.fetchListData();
    notepadActions.fetchNoteWithKey(this.state.uid+":1");
    AdminDashboardActions.fetchAdminUserNotes(this.state.uid);
    this.swellAdminAPIUtils = new SwellAdminAPIUtils();
    this.swellAdminAPIUtils.fetchTypeformData();
    this.swellAdminAPIUtils.fetchUserData();
    window.addEventListener('hashchange', () => {
      this.setState({
        route: window.location.hash.substr(1)
      });
    });
  },
  componentWillUnmount: function() {
    AdminDashboardStore.removeChangeListener(this._onChange);
  },
  goToProfile: function(event) {
    //this.setState({view: "Profile"});
    location.hash = "#/profile";
  },
  goToCreate : function(event){
    //this.setState({view: "TipCreator"});
    location.hash = "#/create";
  },
  goToNotepad : function(event){
    //this.setState({view: "Notepad"});
    location.hash = "#/notepad";
  },
  handleNavButtonClick(path) {
    location.hash = path;
  },
  render: function() {
    var loader = null;
    if (this.state.isLoading) {
      loader = <div style={{width:"100%", textAlign:"center", backgroundColor:"#92f9b5"}}>Loading</div>;
    }
    if (this.state.route == "/profile") {
      return (
        <div className="rootviewdiv">
          <AdminDashboardNavbarView uid={this.state.uid} route={this.state.route}/>
          {loader}
          <AdminDashboardHeaderView uid={this.state.uid} adminNotesStore={AdminNotesStore}/>
          <AdminButtonView route={this.state.route} handleNavButtonClick={this.handleNavButtonClick} goToProfile={this.goToProfile} goToCreate={this.goToCreate} goToNotepad={this.goToNotepad}/>
          <div className="container">
            <AdminDashboardTypeformView />
            <AdminDashboardRawView />
          </div>
        </div>
      );

    } else if (this.state.route == "/notepad") {
      return (
        <div className="rootviewdiv">
          <AdminDashboardNavbarView uid={this.state.uid} route={this.state.route}/>
          {loader}
          <AdminDashboardHeaderView uid={this.state.uid} adminNotesStore={AdminNotesStore}/>
          <AdminButtonView route={this.state.route} handleNavButtonClick={this.handleNavButtonClick} goToProfile={this.goToProfile} goToCreate={this.goToCreate} goToNotepad={this.goToNotepad}/>
          <div className="container notepad-view">
            <AdminNotepadView uid={this.state.uid} notesStore={NotesStore}/>
          </div>
        </div>
      );
    } else if (this.state.route == "/calendar") {
      return (
        <div className="rootviewdiv">
          <AdminDashboardNavbarView uid={this.state.uid} route={this.state.route}/>
          {loader}
          <AdminDashboardHeaderView uid={this.state.uid} adminNotesStore={AdminNotesStore}/>
          <AdminButtonView route={this.state.route} handleNavButtonClick={this.handleNavButtonClick} goToProfile={this.goToProfile} goToCreate={this.goToCreate} goToNotepad={this.goToNotepad}/>
          <div className="container notepad-view">
            <CalendarView/>
          </div>
        </div>
      );
    } else {
      return (
        <div className="rootviewdiv">
          <AdminDashboardNavbarView uid={this.state.uid} route={this.state.route}/>
          {loader}
          <AdminDashboardHeaderView uid={this.state.uid} adminNotesStore={AdminNotesStore}/>
          <AdminButtonView route={this.state.route} handleNavButtonClick={this.handleNavButtonClick} goToProfile={this.goToProfile} goToCreate={this.goToCreate} goToNotepad={this.goToNotepad}/>
          <div className ="createview">
            <CreateContainer />
          </div>
        </div>
      )
    }
  },
  _onChange: function() {
    this.setState({isLoading: AdminDashboardStore.getIsLoading()});
  }
});

module.exports = AdminRootView.jsx;

ReactDOM.render(<AdminRootView />, document.getElementById('react-root'));
