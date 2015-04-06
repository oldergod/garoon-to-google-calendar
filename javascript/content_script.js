'use strict';
/* global chrome, console, Action, GAROON_ID */
/* exported init */

function switchStyleToSync(gEventId) {
  var syncImg = document.getElementById(gEventId).lastChild;
  syncImg.src = chrome.extension.getURL('images/success.png');
  syncImg.alt = 'グーグルカレンダーに同期されている';
  syncImg.title = syncImg.alt;
}

function parseUrl(aElement) {
  var searchObject = {};
  var queries;
  var split;
  var i;
  // Convert query string to object
  queries = aElement.search.replace(/^\?/, '').split('&');
  for (i = 0; i < queries.length; i++) {
    split = queries[i].split('=');
    searchObject[split[0]] = split[1];
  }
  return {
    protocol: aElement.protocol,
    host: aElement.host,
    hostname: aElement.hostname,
    port: aElement.port,
    pathname: aElement.pathname,
    search: aElement.search,
    searchObject: searchObject,
    hash: aElement.hash
  };
}

// Cannot inherit Date so let's extend it.
Date.prototype.garoonToDateTimeObject = function() {
  var dateTimeObject = {};
  dateTimeObject.dateTime = this.toISOString();
  return dateTimeObject;
};

var TITLE_WITH_LOCATION_REGEX = /^(.*) \[(.*)\]\s*$/;
var TITLE_REGEX = /^(.*)\s*$/;
var TIME_REGEX = /^(\d+):(\d+)-(\d+):(\d+)$/;

var extractGroupWeekEvent = function(gwe) {
  var _title = gwe.getElementsByClassName('groupWeekEventTitle').item(0);
  var _query = parseUrl(_title.getElementsByTagName('a')[0]).searchObject;
  var id = _query.event;
  var startDate = new Date(_query.bdate);
  var endDate = new Date(startDate);
  var _time = gwe.getElementsByClassName('listTime').item(0);
  var _extractedTitle = TITLE_WITH_LOCATION_REGEX.exec(_title.innerText);
  var location;
  if (!_extractedTitle) {
    _extractedTitle = TITLE_REGEX.exec(_title.innerText);
  } else {
    location = _extractedTitle[2];
  }
  if (!_extractedTitle) {
    console.log('_extractedTitle failed', _title.innerText);
  }
  var summary = _extractedTitle[1];
  var _extractedTime = TIME_REGEX.exec(_time.innerText);
  if (!_extractedTime) {
    console.log('_extractedTime failed', _time.innerText);
  }
  startDate.setHours(_extractedTime[1], _extractedTime[2]);
  endDate.setHours(_extractedTime[3], _extractedTime[4]);

  return {
    id: GAROON_ID + id,
    summary: summary,
    location: location,
    start: startDate.garoonToDateTimeObject(),
    end: endDate.garoonToDateTimeObject()
  };
};

var handleResponse = function(response) {};

var onClick = function() {
  return function() {
    var _event = extractGroupWeekEvent(this.parentElement);

    chrome.runtime.sendMessage(undefined, {
      action: Action.INSERT_EVENT,
      gevent: {
        id: _event.id,
        summary: _event.summary,
        location: _event.location,
        start: _event.start,
        end: _event.end
      }
    }, undefined, handleResponse);
    switchStyleToSync(_event.id);
  };
};

// messages received from tab.sendMessage
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.action) {
    case Action.CHECK_SYNC:
      if (message.success) {
        switchStyleToSync(message.geventId);
      } else {
        console.log('it failed', message);
      }
      break;
    case Action.INSERT_EVENT:
      if (message.success) {
        switchStyleToSync(message.geventId);
      } else {
        console.log('it failed', message);
      }
      break;
    default:
      break;
  }
  sendResponse({
    received: true
  });
});

var initItAll = function() {
  var divs = document.getElementsByClassName('group_week_calendar_item');
  for (var i = 0; i < divs.length; i++) {
    var div = divs[i];
    var _title = div.getElementsByClassName('groupWeekEventTitle').item(0);
    if (!_title) {
      continue;
    }
    div.style.position = 'relative';
    var syncImg = document.createElement('img');
    syncImg.src = chrome.extension.getURL('images/sync.png');
    syncImg.alt = 'グーグルカレンダーに同期する';
    syncImg.title = syncImg.alt;
    var syncButton = document.createElement('div');
    syncButton.className = 'oldering';
    syncButton.appendChild(syncImg);
    syncButton.onclick = onClick();
    var _eventId = GAROON_ID + parseUrl(_title.getElementsByTagName('a')[0]).searchObject.event;
    syncButton.id = _eventId;
    div.appendChild(syncButton);

    // test sync
    chrome.runtime.sendMessage(undefined, {
      action: Action.CHECK_SYNC,
      gevent: {
        id: _eventId
      }
    }, undefined, handleResponse);
  }
};

// set Observer
var target = document.getElementsByClassName('group_week_calendar_item')[0];
do {
  target = target.parentNode;
} while (target && target.tagName != 'TABLE');
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function() {
    initItAll();
  });
});
var config = {
  attributes: true,
  childList: true,
  characterData: true
};
observer.observe(target.parentNode, config);

initItAll();
