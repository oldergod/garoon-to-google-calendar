'use strict';
/* globals chrome, gapi, console, Action */

/**
 * @fileoverview Utils to deal with the Calendar gapi.
 */

// setting namespace
var CalendarUtils = {};

/**
 * @param {string} calendarId
 */
CalendarUtils.setCalendarId = function(calendarId) {
  chrome.storage.sync.set({
    'calendarId': calendarId
  });
};

/**
 * @param {Function} callback
 * @param {Object} args
 */
CalendarUtils.refreshAuthToken = function(callback, args) {
  var tokenToDisable = gapi.auth.getToken().access_token;
  chrome.identity.removeCachedAuthToken({
      'token': tokenToDisable
    },
    function() {
      chrome.identity.getAuthToken({
        'interactive': true
      }, function(token) {
        gapi.auth.setToken({
          access_token: token
        });
        callback.apply(this, args);
      });
    });
};

// TODO(benoit) calendarId is not set when content_script run from chrome start up.
// need to review the whole thing about setting/getting calendarId
/**
 * @param {GEvent} gevent
 * @param {number} senderTabId
 */
CalendarUtils.insertEvent = function(gevent, senderTabId) {
  if (!CalendarUtils.calendarId) {
    console.log('Error: insertEvent: calendarId is ', CalendarUtils.calendarId);
    return;
  }

  gapi.client.load('calendar', 'v3').then(function() {
    gevent.calendarId_ = CalendarUtils.calendarId;
    var request = gapi.client.calendar.events.insert(gevent.toJsonObject());
    request.execute(function(resp) {
        if (resp.code === 401 || resp.code === 403) {
          CalendarUtils.refreshAuthToken(CalendarUtils.insertEvent, [gevent, senderTabId]);
          return;
        }
        console.log(resp);
        // TODO check at least that response if fine
        chrome.tabs.sendMessage(senderTabId, {
          geventId: gevent.id_,
          action: Action.CHECK_SYNC,
          success: true
        });
      },
      function(error) {
        console.log('error in insertEvent?', error);
      });
  });
};

/**
 * @param {GEvent} gevent
 * @param {number} senderTabId
 */
CalendarUtils.checkEventSync = function(gevent, senderTabId) {
  if (!CalendarUtils.calendarId) {
    console.log('Error: checkEventSync: calendarId is ', CalendarUtils.calendarId);
    return;
  }

  gapi.client.load('calendar', 'v3').then(function() {
    var _obj = {
      'calendarId': CalendarUtils.calendarId,
      'eventId': gevent.id_
    };
    var request = gapi.client.calendar.events.get(_obj);
    request.execute(function(resp) {
      if (resp.code === 401 || resp.code === 403) {
        CalendarUtils.refreshAuthToken(CalendarUtils.checkEventSync, [gevent, senderTabId]);
        return;
      }
      if ('iCalUID' in resp) {
        // TODO benoit check time to be sure it has not been rescheduled
        // TODO benoit deleted events on GCalendar are still alive, check status or something
        //   also resync cannot work because of this
        chrome.tabs.sendMessage(senderTabId, {
          geventId: gevent.id_,
          action: Action.CHECK_SYNC,
          success: true
        });
      }
    }, function(error) {
      console.log('error in isEventSync?', error);
    });
  });
};

/**
 * initialize CalendarId
 */
CalendarUtils.initCalendar = function() {
  chrome.storage.sync.get('calendarId', function(calendar) {
    var calendarP = gapi.client.load('calendar', 'v3');
    if (!calendar.calendarId) {
      calendarP.then(function() {
        var request = gapi.client.calendar.calendarList.list({
          fields: 'items(id,primary)'
        });

        request.execute(function(resp) {
          for (var i = 0; i < resp.items.length; i++) {
            var calendar = resp.items[i];
            if (calendar.hasOwnProperty('primary') && calendar.primary) {
              CalendarUtils.setCalendarId(calendar.id);
              console.log('CalendarId initialized to', calendar.id);
              return;
            }
          }
          console.log('Error: initCalendar: could not find any primary calendar to write on.');
          return;
        });
      });
    }
    CalendarUtils.calendarId = calendar.calendarId;
  });
};
