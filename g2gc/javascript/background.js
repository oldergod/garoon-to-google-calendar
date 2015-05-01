/**
 * @fileoverview Background.js run once the extension is launched.
 */
goog.provide('g2gc.background');
goog.require('g2gc.CalendarUtils');
goog.require('g2gc.constants');

var g2gc_background_initBackground = function() {
  console.log('gapi loaded in background');
  chrome.identity.getAuthToken({
    'interactive': true
  }, function(token) {
    gapi.auth.setToken({
      'access_token': token
    });
    g2gc.CalendarUtils.initCalendar();
  });
};
goog.exportSymbol('g2gc_background_initBackground', g2gc_background_initBackground);

g2gc.background.main = function() {
  var head = document.getElementsByTagName('head').item(0);
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://apis.google.com/js/client.js?onload=g2gc_background_initBackground';
  head.appendChild(script);

  g2gc.background.addListeners();
}

g2gc.background.addListeners = function() {
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
        if(message.hasOwnProperty('gevent') && goog.isDefAndNotNull(message['gevent'])) {
          g2gc.CalendarUtils.insertEvent(new g2gc.GEvent(message['gevent']), sender.tab.id);
        }
        break;
      case g2gc.constants.Action.CHECK_SYNC:
        if(message.hasOwnProperty('gevent') && goog.isDefAndNotNull(message['gevent'])) {
          g2gc.CalendarUtils.checkEventSync(new g2gc.GEvent(message['gevent']), sender.tab.id);
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

g2gc.background.main();
