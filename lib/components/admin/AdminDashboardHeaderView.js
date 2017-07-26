var React = require('react')
  , AdminTargetUserStore = require('./AdminTargetUserStore.js')
  , AdminDashboardStore = require('./AdminDashboardStore.js')
  , AdminDashboardActions = require('./AdminDashboardActions.js')
  , AdminNotesStore = require('../../store/admin/AdminStore.js')
  , moment = require('moment')
  , Collapse = require('rc-collapse')
  , Panel = Collapse.Panel
;

var AdminUserNoteRow = React.createClass({
  render: function () {
    var text = this.props.noteObject.text;
    var time = this.props.noteObject.createdAt;
    if (time) {
      time = moment(time*1000).format('MM/DD/YY');
    } else {
      time = "n/a"
    }
  return (
      <li className="list-group-item"><small>{time}</small> - {text}</li>
    );
  }
});


var WunderlistDashboardUserHeaderView = React.createClass({
  getInitialState: function () {
    var notesObjects = this.props.adminNotesStore.getAdminUserNotes().blocks || [];
    notesObjects = notesObjects.reverse();
    return {
      adminNotes: notesObjects,
      newNote: ""
    }
  },
  componentDidMount: function () {
    AdminTargetUserStore.addChangeListener(this._onChange);
    AdminNotesStore.addChangeListener(this._onChange);
  },
  componentWillUnmount: function () {
    AdminTargetUserStore.removeChangeListener(this._onChange);
    AdminNotesStore.removeChangeListener(this._onChange);
  },
  handleAdminNoteChange: function(event) {
    this.setState({newNote: event.target.value});
  },
  handleAdminNoteSave: function(event) {
    var uid = this.props.uid;
    var note = this.state.newNote;
    AdminDashboardActions.updateAdminUserNotes(uid, note);
  },
  handleImpClick: function (event) {
    event.preventDefault();
    window.open(VANITY_URL + "/dashboard?uid=" + this.props.uid + "#/feed");
  },
  handleMixpanelClick: function (event) {
    event.preventDefault();
    var user = AdminTargetUserStore.getUserData();
    event.preventDefault();
    if (user && user.uid) {
      window.open("https://mixpanel.com/report/883721/explore/#list/chosen_columns:!('$created','$email',uid,uid),filter:(conjunction:and,filters:!((dropdown_tab_index:1,filter:(operand:'" + user.uid + "',operator:in),property:(name:uid,no_second_icon:!t,source:user,type:string),selected_property_type:string,type:string))),sort_order:descending,sort_property:'$last_seen',sort_property_type:datetime");
    } else {
      alert("User does not have an uid. Please verify user account info in the admin spreadsheet.");
    }
  },
  handleSendGridClick: function (event) {
    event.preventDefault();
    var user = AdminTargetUserStore.getUserData();
    if (user && user.email) {
      window.open("https://app.sendgrid.com/email_activity?email=" + user.email);
    } else {
      alert("User does not have an email. Please verify user account info in the admin spreadsheet.");
    }
    event.preventDefault();
    window.open("https://mixpanel.com/report/883721/explore/#list/chosen_columns:!('$created','$email',uid,uid),filter:(conjunction:and,filters:!((dropdown_tab_index:1,filter:(operand:'" + uid + "',operator:in),property:(name:uid,no_second_icon:!t,source:user,type:string),selected_property_type:string,type:string))),sort_order:descending,sort_property:'$last_seen',sort_property_type:datetime");
  },
  render: function () {
    var user = AdminTargetUserStore.getUserData();

    var birthday = null;
    var location =  null;
    var gender = null;
    var signup = null;
    var phone = null;

    if (user) {
      var campaign = user.campaign ? user.campaign : "None";
      var name = user.name ? user.name : "";

      if(user.birthday) {
        birthday = (
          <li className="list-group-item">Birtday: <span>{user.birthday}</span></li>
        );
      }

      if(user.location_name) {
        location = (
          <li className="list-group-item">Location: <span>{user.location_name}</span></li>
        );
      }

      if(user.gender) {
        gender = (
          <li className="list-group-item">Gender: <span>{user.gender}</span></li>
        );
      }

      if(user.phone) {
        phone = (
          <li className="list-group-item">Phone Number: <span>{user.phone}</span></li>
        );
      }

      if(user.created) {
        var createdDate = new Date(user.created * 1000);
        signup = (
          <li className="list-group-item">Created: <span>{createdDate.getMonth() + 1}/{createdDate.getDate()}/{createdDate.getFullYear()}</span></li>
        );
      }
    }
    
    var notesItems = this.state.adminNotes.map((noteObject, index) =>{
      var noteObject = noteObject;
      return <AdminUserNoteRow noteObject={noteObject} key={"note-" + index}/>
    } );

    var collapse = (
      <Collapse accordion={true}>
        <Panel header="hello">this is panel content</Panel>
        <Panel header="title2">this is panel content2 or other</Panel>
      </Collapse>
    );

    return (
      <div className="headBar">
        <div className="container">
          <div className='row'>
            <div className='col-md-4'>
              <h4 className="text-center">UID: <span>{this.props.uid}</span></h4>
            </div>
            <div className="col-md-4">{ name ? <h3 id="username">{name}</h3> : null }</div>
            <div className="col-md-4 text-center">
              <button onClick={this.handleImpClick} className="btn btn-primary">Impersonate</button>
            </div>
          </div>
          <div className="row user-data">
            <div className="col-md-6 admin-notes">
                <div className="input-group">
                  <input type="text" className="form-control" id="linkText" onChange={this.handleAdminNoteChange} placeholder="Add a note..."></input>
                  <span className="input-group-btn">
                    <button className="btn btn-default" type="button" onClick={this.handleAdminNoteSave}>Save</button>
                  </span>
                </div>
                <ul className="list-group">
                  <li className= "list-group-item disabled">Admin Notes</li>
                    {notesItems}
                 </ul>

            </div>
            <div className="col-md-6">
              <Collapse accordion={true}>
                <Panel header="User Stats">
                  <ul className="list-group">
                    <li className="list-group-item">Campaign/Goal: <span>{campaign}</span></li>
                    <li className="list-group-item">Last Email Sent: <span><em>Coming soon!</em></span></li>
                    <li className="list-group-item">Note Last Updated: <span><em>Coming soon!</em></span></li>
                    <li className="list-group-item">User History: <a onClick={this.handleMixpanelClick}>Mixpanel</a></li>
                    <li className="list-group-item">Email History: <a onClick={this.handleSendGridClick}>SendGrid</a></li>
                    {birthday}
                    {location}
                    {gender}
                    {phone}
                    {signup}
                  </ul>
                </Panel>
              </Collapse>
            </div>
          </div>
        </div>
      </div>
    );

  },
  _onChange: function () {
    var notesObjects = this.props.adminNotesStore.getAdminUserNotes().blocks || [];
    notesObjects = notesObjects.reverse();
    this.setState({
      adminNotes: notesObjects,
      newNote: ""
    });
  }
});


module.exports = WunderlistDashboardUserHeaderView;
