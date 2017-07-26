var React = require('react')
    , UserStore = require('../../store/swell/SwellUserStore.js')
    , UserProfileActions = require('../../actions/swell/SwellUserProfileActions.js')
    , Select = require('react-select')
;

var months = [
    {value: '01', label:'Jan'},
    {value: '02', label:'Feb'},
    {value: '03', label:'Mar'},
    {value: '04', label:'Apr'},
    {value: '05', label:'May'},
    {value: '06', label:'Jun'},
    {value: '07', label:'Jul'},
    {value: '08', label:'Aug'},
    {value: '09', label:'Sep'},
    {value: '10', label:'Oct'},
    {value: '11', label:'Nov'},
    {value: '12', label:'Dec'}
];

var UserDashboardChangeBirthdayView = React.createClass({

    getInitialState: function() {
        var user = UserStore.getUserData();
        var birthdayStored = user.birthday ? user.birthday : "";
        var year = {}, month = {}, day = {};

        if(birthdayStored !== "") {
            var ymd = birthdayStored.split("/");
            year = {value: ymd[2], label: ymd[2]};
            for(var i = 0; i < months.length; i++) {
                if(months[i].value === ymd[0]) {
                    month = months[i];
                    break;
                }
            }
            day = {value: ymd[1], label: ymd[1]};

        }
        return {
            birthday : birthdayStored,
            month : month,
            day : day,
            year : year
        };
    },
    setMonth : function(val) {
        this.setState({ month: val});
    },
    setDay : function(val) {
        this.setState({ day: val});
    },
    setYear : function(val) {
        this.setState({ year: val});
    },
    handleBirthdayChange: function() {
        var newMonth = this.state.month.value;
        var newDay =  this.state.day.value;
        var newYear = this.state.year.value;
        var tempBday = newMonth + "/" + newDay + "/" + newYear;
        return tempBday;
    },
    render: function () {
        var days = [];
        for (var i = 1; i <= 31; i++) {
            i = i.toString();
            days.push({value: i, label: i});
        }
        var years = [];
        for (var i = 1916; i <= 1999; i++) {
            i = i.toString();
            years.push({value: i, label: i});
        }
        var user = UserStore.getUserData();
        if (user){
            var birthday = user.birthday ? user.birthday : "";
        }
        return (
            <div>
                <div className="Progress-header">
                    <h6>Account > Change Birthday</h6>
                </div>
                <form ref="BirthdayForm" className="Settings-form">
                    <div className="Settings-input-group">
                        <div className="section">
                            <p className="Settings-label">Current Birthday: {birthday}</p>
                            <Select
                                name="form-field-month"
                                value={this.state.month}
                                options={months}
                                onChange={this.setMonth}
                            />
                            <br></br>
                            <Select
                                name="form-field-day"
                                value={this.state.day}
                                options={days}
                                onChange={this.setDay}
                            />
                            <br></br>
                            <Select
                                name="form-field-year"
                                value={this.state.year}
                                options={years}
                                onChange={this.setYear}
                            />
                        </div>
                    </div>
                    <button className="Button" onClick={this._onUpdate}> Update </button>
                    <button onClick={this.props.goToHome} className="Button"> Cancel</button>
                </form>
            </div>
        );
    },
    _onUpdate: function(event) {
        event.preventDefault();
        var newBirthday = this.handleBirthdayChange();
        console.log(newBirthday);
        var user = UserStore.getUserData();
        var updatedProfile = user;
        updatedProfile.birthday =  newBirthday;
        UserProfileActions.setUserBirthday(updatedProfile);
        this.props.goToHome();
    }
});

module.exports = UserDashboardChangeBirthdayView;
