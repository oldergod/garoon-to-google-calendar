/**
 * @fileoverview Utils to deal with the Calendar gapi.
 */
goog.provide('g2gc.CalendarUtils');
goog.require('g2gc.GEvent');
goog.require('g2gc.utils');

/**
 * @param {string} calendarId
 */
g2gc.CalendarUtils.setCalendarId = function(calendarId) {
  chrome.storage.sync.set({
    'calendarId': calendarId
  });
};

// TODO(benoit) calendarId is not set when content_script run from chrome start up.
// need to review the whole thing about setting/getting calendarId
/**
 * @param {!g2gc.GEvent} gevent
 * @param {number} senderTabId
 */
g2gc.CalendarUtils.insertEvent = function(gevent, senderTabId) {
  if (!g2gc.CalendarUtils.calendarId) {
    console.log('Error: insertEvent: calendarId is ', g2gc.CalendarUtils.calendarId);
    return;
  }

  gapi.client.load('calendar', 'v3').then(function() {
    gevent.calendarId_ = g2gc.CalendarUtils.calendarId;
    var request = gapi.client.calendar.events.insert(gevent.toJsonObject());
    request.execute(function(resp) {
        if (resp.code === 401 || resp.code === 403) {
          g2gc.utils.refreshAuthToken(g2gc.CalendarUtils.insertEvent, [gevent, senderTabId]);
          return;
        }
        console.log(resp);
        // TODO check at least that response if fine
        chrome.tabs.sendMessage(senderTabId, {
          'geventId': gevent.id_,
          'action': g2gc.constants.Action.CHECK_SYNC,
          'success': true
        });
      },
      function(error) {
        console.log('error in insertEvent?', error);
      });
  });
};

/**
 * @param {!g2gc.GEvent} gevent
 * @param {number} senderTabId
 */
g2gc.CalendarUtils.checkEventSync = function(gevent, senderTabId) {
  if (!g2gc.CalendarUtils.calendarId) {
    console.log('Error: checkEventSync: calendarId is ', g2gc.CalendarUtils.calendarId);
    return;
  }

  gapi.client.load('calendar', 'v3').then(function() {
    var _obj = {
      'calendarId': g2gc.CalendarUtils.calendarId,
      'eventId': gevent.id_
    };
    var request = gapi.client.calendar.events.get(_obj);
    request.execute(function(resp) {
      if (resp.code === 401 || resp.code === 403) {
        g2gc.utils.refreshAuthToken(g2gc.CalendarUtils.checkEventSync, [gevent, senderTabId]);
        return;
      }
      if ('iCalUID' in resp) {
        // TODO benoit check time to be sure it has not been rescheduled
        // TODO benoit deleted events on GCalendar are still alive, check status or something
        //   also resync cannot work because of this
        chrome.tabs.sendMessage(senderTabId, {
          'geventId': gevent.id_,
          'action': g2gc.constants.Action.CHECK_SYNC,
          'success': true
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
g2gc.CalendarUtils.initCalendar = function() {
  chrome.storage.sync.get('calendarId', function(calendar) {
    var calendarP = gapi.client.load('calendar', 'v3');
    if (!calendar['calendarId']) {
      calendarP.then(function() {
        var request = gapi.client.calendar.calendarList.list({
          'fields': 'items(id,primary)'
        });

        request.execute(function(resp) {
          for (var i = 0; i < resp.items.length; i++) {
            var calendar = resp.items[i];
            if (calendar.hasOwnProperty('primary') && goog.isDefAndNotNull(calendar['primary'])) {
              g2gc.CalendarUtils.setCalendarId(calendar.id);
              console.log('CalendarId initialized to', calendar.id);
              return;
            }
          }
          console.log('Error: initCalendar: could not find any primary calendar to write on.');
          return;
        });
      });
    }
    g2gc.CalendarUtils.calendarId = calendar['calendarId'];
  });
};
