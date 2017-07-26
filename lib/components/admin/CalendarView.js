import React from 'react';
import SimpleRequest from '../../utilities/SimpleRequest.js';

class CalendarView extends React.Component {
  constructor(props) {
    super(props);
    this.simpleRequest = new SimpleRequest();
    var url = '/v1/user/' + UID + '/calendar';
    this.simpleRequest.get(url, {}, (error, response)=>{
      if(error) {
        console.log(error);
        return;
      }
      this.receiveCalendarEvents(response.data);
    });
    this.state = {"calendars": []};
  }

  receiveCalendarEvents(calendars) {
    this.setState({"calendars":calendars});
  }

  render() {
    let calendarNodes = [];
    for(let calendar of this.state.calendars) {
      let eventNodes = [];
      if(calendar.events && calendar.events.length) {
        for(let event of calendar.events) {
          var startNode;
          if(event.start.dateTime) {
            startNode = <span>start: {event.start.dateTime}</span>
          } else if(event.start.date) {
            startNode = <span>start: {event.start.date}</span>
          }
          var endNode;
          if(event.end.dateTime) {
            endNode = <span> end: {event.end.dateTime} </span>
          } else if(event.start.date) {
            endNode = <span> end: {event.end.date} </span>
          }
          eventNodes.push(<li>
                            {startNode}
                            {endNode}
                            <span> {event.summary}</span>
                          </li>);
        }
      }
      calendarNodes.push(
        <li>
          <h3>{calendar.summary}</h3>
          {calendar.description ? <span>{calendar.description}</span> : null}
          <ul>
            {eventNodes}
          </ul>
        </li>
      )
    }
    return(
      <ul>
        {calendarNodes}
      </ul>
    )
  }
}

module.exports = CalendarView;
