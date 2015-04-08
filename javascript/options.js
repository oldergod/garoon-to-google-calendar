'use strict';
/* global chrome, gapi, console */
/* exported init */

var calendarId;

function save_options() {
  var calendarId = document.getElementById('calendar_ids').value;
  chrome.storage.sync.set({
    calendarId: calendarId
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'オプションを保存した。';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

function restore_options() {
  chrome.storage.sync.get(['calendarId'], function(storage) {
    calendarId = storage.calendarId;
    loadGapi();
  });
}

var init = function() {
  console.log('gapi loaded');
  chrome.identity.getAuthToken({
    'interactive': true
  }, function(token) {
    gapi.auth.setToken({
      access_token: token
    });

    var gapiP = gapi.client.load('calendar', 'v3');
    gapiP.then(function() {
      var request = gapi.client.calendar.calendarList.list({
        fields: 'items(accessRole,id,primary,summary)'
      });

      var select = document.getElementById('calendar_ids');
      request.execute(function(resp) {
        for (var i = 0; i < resp.items.length; i++) {
          var calendar = resp.items[i];
          if (calendar.accessRole === 'owner' || calendar.accessRole === 'writer') {
            var option = document.createElement('option');
            option.value = calendar.id;
            option.innerText = calendar.id;
            if (calendar.hasOwnProperty('summary') && calendar.summary) {
              option.innerText = calendar.summary;
            }
            select.appendChild(option);
            if (calendar.hasOwnProperty('primary') && calendar.primary) {
              select.value = calendar.id;
            }
          }
        }
        if (calendarId) {
          select.value = calendarId;
        }
        document.getElementById('loading').style.display = 'none';
        select.style.display = 'inline';
      });
    });
  });
};

var loadGapi = function() {
  var head = document.getElementsByTagName('head').item(0);
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://apis.google.com/js/client.js?onload=init';
  head.appendChild(script);
};
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
