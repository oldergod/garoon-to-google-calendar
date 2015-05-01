/**
 * @fileoverview Shared between all.
 */
goog.provide('g2gc.constants');
goog.provide('g2gc.utils');

/**
 * @const
 */
g2gc.constants.Action = {
  INSERT_EVENT: 'INSERT_EVENT',
  CHECK_SYNC: 'CHECK_SYNC'
};

/**
 * @const
 */
g2gc.constants.GAROON_ID = 'garoon';

/**
 * @param {Function} callback
 * @param {Object=} args
 */
g2gc.utils.refreshAuthToken = function(callback, args) {
  var tokenToDisable = gapi.auth.getToken().access_token;
  chrome.identity.removeCachedAuthToken({
      'token': tokenToDisable
    },
    function() {
      chrome.identity.getAuthToken({
        'interactive': true
      }, function(token) {
        gapi.auth.setToken({
          'access_token': token
        });
        callback.apply(this, args);
      });
    });
};
