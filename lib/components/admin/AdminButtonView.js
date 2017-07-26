var React = require('react')
  ;

var AdminButtonView = React.createClass({
  handleCreateClick: function(event) {
    this.props.goToCreate();
  },
  handleNotesClick: function(event) {
    this.props.goToNotepad();
  },
  handleProfileClick: function(event){
    this.props.goToProfile();
  },
  handleCalendarClick: function(event) {
    this.props.handleNavButtonClick('#/calendar');
  },
  render: function() {
    var create = "btn btn-primary";
    var notes = "btn btn-primary";
    var profile = "btn btn-primary";
    var calendar = "btn btn-primary";
    var buttonBar = "buttonBar";
    switch (this.props.route) {
      case "/create":
        create = "btn btn-success";
        buttonBar = "buttonBar noborder"
        break;
      case "/notepad":
        notes = "btn btn-success";
        break;
      case "/profile":
        profile = "btn btn-success";
        break;
      case "/calendar":
        calendar = "btn btn-success"
        break;
    }
      return (
        <div className={buttonBar}>
          <div className='container'>
            <div className="row">
              <div className="buttonBar-row">
                <button type="button" className={create} onClick={this.handleCreateClick}>Create</button>
                <button type="button" className={notes} onClick={this.handleNotesClick}>Notes</button>
                <button type="button" className={profile} onClick={this.handleProfileClick}>Profile</button>
                <button type="button" className={calendar} onClick={this.handleCalendarClick}>Calendar</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
});

module.exports = AdminButtonView;
