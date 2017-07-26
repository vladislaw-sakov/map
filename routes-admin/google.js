"use strict";

var google = require('googleapis')
, googleAuth = require('google-auth-library')
, clientSecret = env.current.google.client_secret
, clientId = env.current.google.client_id
, redirectUrl = env.current.google.redirect_uri
, auth = new googleAuth()
, UserTokenManager = require('../lib/managers/UserTokenManager.js')
, async = require('async')
;

module.exports = function(app, express) {
  app.get("/:version/user/:uid/calendar", (req, res)=>{
    console.log(`${req.path}`);
    var uid = req.params.uid;
    UserTokenManager.fetchTokenForUidAndService(uid, UserTokenManager.SERVICES.google).then((tokenData)=>{
      let token = tokenData.token;
      let now = new Date().getTime();
      let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
      oauth2Client.credentials = token;
      if(token.refresh_token) {
        oauth2Client.refreshAccessToken(function(err, tokens) {
          getCalendarsWithEvents(oauth2Client).then((calendars)=>{
            res.success(calendars);
          }).catch((error)=>{
            console.log(error.message);
            res.status(500).send(error.message);
          });
        });
      } else {
        getCalendarsWithEvents(oauth2Client).then((calendars)=>{
          res.success(calendars);
        }).catch((error)=>{
          console.log(error.message);
          res.status(500).send(error.message);
        });
      }
    }).catch((error)=>{
      console.log(error.message);
      res.status(500).send(error.message);
    });
  });
}

function getCalendarsWithEvents(oauth2Client) {
  return new Promise((fulfill, reject)=>{
    getListOfCalendars(oauth2Client).then((listOfCalendars)=>{
      let calendars = listOfCalendars.items;
      if(calendars && calendars.length) {
        async.each(calendars, (calendar, callback)=>{
          getListOfEvents(oauth2Client, calendar.id).then((listOfEvents)=>{
            calendar.events = listOfEvents;
            callback();
          }).catch((error)=>{
            callback();
          });
        }, (error)=>{
          fulfill(calendars);
        });
      }
    }).catch((error)=>{
      reject(error);
    });
  });
}

function getListOfCalendars(oauth2Client) {
  return new Promise((fulfill, reject)=>{
    var calendar = google.calendar('v3');
    calendar.calendarList.list({
      auth: oauth2Client
    }, function(error, response) {
      if (error) {
        console.log('The API returned an error: ' + error);
        return reject(error);
      }
      return fulfill(response);
    });
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getListOfEvents(oauth2Client, calendarId) {
  return new Promise((fulfill, reject)=>{
    var calendar = google.calendar('v3');
    calendar.events.list({
      auth: oauth2Client,
      calendarId: calendarId,
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    }, function(error, response) {
      if (error) {
        console.log('The API returned an error: ' + error);
        return reject(error);
      }
      console.log(`response: ${JSON.stringify(response)}`);
      var events = response.items;
      if(!events || events.length == 0) {
        console.log('No upcoming events found.');
        fulfill([]);
      } else {
        console.log('Upcoming 10 events:');
        for (let event of events) {
          var start = event.start.dateTime || event.start.date;
          console.log('%s - %s', start, event.summary);
        }
        fulfill(events);
      }
    });
  });
}
