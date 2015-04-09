'use strict';
/* global chrome, gapi, console, GEvent, CalendarUtils, Action */
/* exported init */

var init = function() {
  console.log('gapi loaded');
  chrome.identity.getAuthToken({
    'interactive': true
  }, function(token) {
    gapi.auth.setToken({
      access_token: token
    });
    CalendarUtils.initCalendar();
  });
};

var head = document.getElementsByTagName('head').item(0);
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://apis.google.com/js/client.js?onload=init';
head.appendChild(script);


// listen to calendarId changes;
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    if (key === undefined) {
      continue;
    }
    var storageChange = changes[key];
    if (key === 'calendarId') {
      CalendarUtils.calendarId = storageChange.newValue;
    }
    console.log('Storage key "%s" in namespace "%s" changed. ' +
      'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue);
  }
});

chrome.runtime.onMessage.addListener(function(message, sender) {
  switch (message.action) {
    case Action.INSERT_EVENT:
      CalendarUtils.insertEvent(new GEvent(message.gevent), sender.tab.id);
      break;
    case Action.CHECK_SYNC:
      CalendarUtils.checkEventSync(new GEvent(message.gevent), sender.tab.id);
      break;
    default:
      console.log('do not know this action', message);
  }
});

// Would show option on installed but can be unnecessary
// if people are using their default cal
// chrome.runtime.onInstalled.addListener(function(details) {
//   if (details.reason == 'install') {
//     chrome.tabs.create({
//       'url': 'chrome://extensions/?options=' + chrome.runtime.id
//     });
//   }
// });
