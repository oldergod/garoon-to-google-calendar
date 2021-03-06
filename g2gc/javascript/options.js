﻿/**
 * @fileoverview Load/save option for extension.
 */
goog.provide('g2gc.options');
goog.require('g2gc.utils');

var calendarId;

g2gc.options.save_options = function() {
  var calendarId = document.getElementById('calendar_ids').value;
  chrome.storage.sync.set({
    'calendarId': calendarId
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'オプションを保存した。';
    setTimeout(function() {
      status.textContent = '';
    }, 3000);
  });
};

g2gc.options.loadGapi = function() {
  var head = document.getElementsByTagName('head').item(0);
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://apis.google.com/js/client.js?onload=g2gc_options_initOptions';
  head.appendChild(script);
};

g2gc.options.restore_options = function() {
  chrome.storage.sync.get(['calendarId'], function(storage) {
    calendarId = storage['calendarId'];
    g2gc.options.loadGapi();
  });
};

g2gc.options.fetchCalendars = function() {
  var request = gapi.client.calendar.calendarList.list({
    'fields': 'items(accessRole,id,primary,summary)'
  });

  var select = document.getElementById('calendar_ids');
  request.execute(function(resp) {
    if (resp.code === 401 || resp.code === 403) {
      g2gc.utils.refreshAuthToken(g2gc.options.fetchCalendars);
      return;
    }
    for (var i = 0; i < resp.items.length; i++) {
      var calendar = /** @type {{accessRole: string, id: string, primary: string, summary: string}} */ (resp.items[i]);
      if (calendar['accessRole'] === 'owner' || calendar['accessRole'] === 'writer') {
        var option = document.createElement('option');
        option.value = calendar['id'];
        option.innerText = calendar['id'];
        if (calendar.hasOwnProperty('summary') && calendar['summary']) {
          option.innerText = calendar['summary'];
        }
        select.appendChild(option);
        if (calendar.hasOwnProperty('primary') && calendar['primary']) {
          select.value = calendar['id'];
        }
      }
    }
    if (calendarId) {
      select.value = calendarId;
    }
    document.getElementById('loading').style.display = 'none';
    select.style.display = 'inline';
  })
};

var g2gc_options_initOptions = function() {
  console.log('gapi loaded in options');
  chrome.identity.getAuthToken({
    'interactive': true
  }, function(token) {
    gapi.auth.setToken({
      'access_token': token
    });

    var gapiP = gapi.client.load('calendar', 'v3');
    gapiP.then(function() {
      g2gc.options.fetchCalendars();
    });
  });
};
goog.exportSymbol('g2gc_options_initOptions', g2gc_options_initOptions);


document.addEventListener('DOMContentLoaded', g2gc.options.restore_options);
document.getElementById('save').addEventListener('click', g2gc.options.save_options);
