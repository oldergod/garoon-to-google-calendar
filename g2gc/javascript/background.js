/**
 * @fileoverview Background.js run once the extension is launched.
 */
goog.provide('g2gc.background');
goog.require('g2gc.CalendarUtils');
goog.require('g2gc.constants');

var initBackground = function() {
  console.log('gapi loaded');
  chrome.identity.getAuthToken({
    'interactive': true
  }, function(token) {
    gapi.auth.setToken({
      access_token: token
    });
    g2gc.CalendarUtils.initCalendar();
  });
};

function main() {
  var head = document.getElementsByTagName('head').item(0);
  var script = document.createElement('script');
  /** gjslint wants some doc here? */
  script.type = 'text/javascript';
  /** gjslint wants some doc here? */
  script.src = 'https://apis.google.com/js/client.js?onload=initBackground';
  head.appendChild(script);

  addListeners();
}

function addListeners() {
  // listen to calendarId changes;
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
      if (key === undefined) {
        continue;
      }
      var storageChange = changes[key];
      if (key === 'calendarId') {
        g2gc.CalendarUtils.calendarId = storageChange.newValue;
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
      case g2gc.constants.Action.INSERT_EVENT:
        if(message.hasOwnProperty('gevent') && goog.isDefAndNotNull(message.gevent)) {
          g2gc.CalendarUtils.insertEvent(new g2gc.GEvent(message.gevent), sender.tab.id);
        }
        break;
      case g2gc.constants.Action.CHECK_SYNC:
        if(message.hasOwnProperty('gevent') && goog.isDefAndNotNull(message.gevent)) {
          g2gc.CalendarUtils.checkEventSync(new g2gc.GEvent(message.gevent), sender.tab.id);
        }
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

}

main();
