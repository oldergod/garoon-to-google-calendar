﻿/**
 * @fileoverview Script running on each targetted tab.
 */
goog.provide('g2gc.contentScript');
goog.require('g2gc.constants');

/**
 * @param {string} gEventId
 */
function switchStyleToSync(gEventId) {
  var syncBtn = document.getElementById(gEventId);
  syncBtn.className += ' synced';
  var syncImg = syncBtn.lastChild;
  syncImg.src = chrome.extension.getURL('images/success.png');
  syncImg.alt = 'グーグルカレンダーに同期されている';
  syncImg.title = syncImg.alt;
}

/**
 * @param {!Element} aElement
 * @return {Object}
 */
function parseUrl(aElement) {
  /** @type {{bdate: (string|undefined)}} */
  var searchObject = {'bdate': undefined};
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
    'protocol': aElement.protocol,
    'host': aElement.host,
    'hostname': aElement.hostname,
    'port': aElement.port,
    'pathname': aElement.pathname,
    'search': aElement.search,
    'searchObject': searchObject,
    'hash': aElement.hash
  };
}

/**
 * @return {Object}
 */
Date.prototype.garoonToDateTimeObject = function() {
  var dateTimeObject = {};
  dateTimeObject.dateTime = this.toISOString();
  return dateTimeObject;
};

var TITLE_WITH_LOCATION_REGEX = /^(.*) \[(.*)\]\s*$/;
var TITLE_REGEX = /^(.*)\s*$/;
var TIME_REGEX = /^(\d+):(\d+)-(\d+):(\d+)$/;

/**
 * @param {Element} gwe
 * @return {Object}
 */
var extractGroupWeekEvent = function(gwe) {
  var _title = gwe.getElementsByClassName('groupWeekEventTitle').item(0);
  var _query = parseUrl(_title.getElementsByTagName('a')[0])['searchObject'];
  var id = _query['event'];
  var startDate = new Date(_query['bdate']);
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
  startDate.setHours(parseInt(_extractedTime[1], 10), parseInt(_extractedTime[2], 10));
  endDate.setHours(parseInt(_extractedTime[3], 10), parseInt(_extractedTime[4], 10));

  return {
    'id': g2gc.constants.GAROON_ID + id,
    'summary': summary,
    'location': location,
    'start': startDate.garoonToDateTimeObject(),
    'end': endDate.garoonToDateTimeObject()
  };
};

var handleResponse = function() {};

/**
 * @return {Function}
 */
var onClick = function() {
  return function() {
    var _event = extractGroupWeekEvent(this.parentElement);

    chrome.runtime.sendMessage(undefined, {
      'action': g2gc.constants.Action.INSERT_EVENT,
      'gevent': {
        'id': _event['id'],
        'summary': _event['summary'],
        'location': _event['location'],
        'start': _event['start'],
        'end': _event['end']
      }
    }, undefined, handleResponse);
    switchStyleToSync(_event['id']);
  };
};

/**
 * Initialize all sync buttons and check for the event sync status
 */
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
    var _eventId = g2gc.constants.GAROON_ID + parseUrl(_title.getElementsByTagName('a')[0])['searchObject']['event'];
    syncButton.id = _eventId;
    // TODO benoit maybe should extract the event first and be sure there is no error
    // before adding the button since we don't support all events yet.
    div.appendChild(syncButton);

    // test sync
    chrome.runtime.sendMessage(undefined, {
      'action': g2gc.constants.Action.CHECK_SYNC,
      'gevent': {
        'id': _eventId
      }
    }, undefined, handleResponse);
  }
};

function main() {
  // set Observer
  var target = document.getElementsByClassName('group_week_calendar_item')[0];
  do {
    target = target.parentNode;
  } while (target && target.tagName !== 'TABLE');
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function() {
      initItAll();
    });
  });
  var config = /** @type {MutationObserverInit} */ ({
    'attributes': true,
    'childList': true,
    'characterData': true
  });
  observer.observe(target.parentNode, config);

  setTimeout(function() {
    initItAll();
  }, 0);

  // messages received from tab.sendMessage
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    switch (message.action) {
      case g2gc.constants.Action.CHECK_SYNC:
        if (message.success && message.hasOwnProperty('geventId') && goog.isDefAndNotNull(message['geventId'])) {
          switchStyleToSync(message['geventId']);
        } else {
          console.log('it failed', message);
        }
        break;
      case g2gc.constants.Action.INSERT_EVENT:
        if (message.success && message.hasOwnProperty('geventId') && goog.isDefAndNotNull(message['geventId'])) {
          switchStyleToSync(message['geventId']);
        } else {
          console.log('it failed', message);
        }
        break;
      default:
        break;
    }
    sendResponse({
      'received': true
    });
  });
}

main();

