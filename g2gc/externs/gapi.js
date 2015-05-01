/**
 * @fileoverview Extern declarations for namespaces and functions for the Google APIs.
 */

/**
 * Namespace associated with Google APIs.
 * @see https://developers.google.com/api-client-library/javascript/reference/referencedocs
 */
var gapi = {};


/**
 * @type {Object}
 */
gapi.auth = {};


/**
 * Retrieves the OAuth 2.0 token for the application.
 * @return {Object}
 */
gapi.auth.getToken = function() {};


/**
 * Sets the OAuth 2.0 token for the application.
 * @param {Object} token
 */
gapi.gapi.auth.setToken = function(token) {};


/**
 * @type {Object}
 */
gapi.client = {};


/**
 * Loads the client library interface to a particular API. If a callback is not provided, a promise is returned.
 * The loaded API interface will be in the form gapi.client.api.collection.method.
 * @param {string} name
 * @param {string} version
 * @param {?(function(*): *)=} opt_callback
 * @return {!ES6Promise.Promise|undefined}
 */
gapi.client.load = function(name, version, opt_callback) {};


/**
 * @type {Object}
 * @see https://developers.google.com/google-apps/calendar/v3/reference/
 */
gapi.client.calendar = {};


/**
 * @type {Object}
 * @see https://developers.google.com/google-apps/calendar/v3/reference/#CalendarList
 */
gapi.client.calendar.calendarList = {};

/**
 * Returns entries on the user's calendar list.
 * @param {Object} params
 * @return {gapi.Request}
 */
gapi.client.calendar.calendarList.list = function(params) {};


/**
 * @type {Object}
 * @see https://developers.google.com/google-apps/calendar/v3/reference/#Events
 */
gapi.client.calendar.events = {};


/**
 * Returns an event.
 * @param {Object} params
 * @return {gapi.Request}
 */
gapi.client.calendar.events.get = function(params) {};


/**
 * Creates an event.
 * @param {Object} params
 * @return {gapi.Request}
 */
gapi.client.calendar.events.insert = function(params) {};



/**
 * GAPI Request than can be executed.
 * @constructor
 */
gapi.Request = function() {};

/**
 * @param {?(function(*): *)=} opt_onFulfilled
 * @param {?(function(*): *)=} opt_onRejected
 */
gapi.Request.prototype.execute = function(opt_onFulfilled, opt_onRejected) {};
