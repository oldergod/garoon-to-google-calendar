'use strict';

/**
 * @fileoverview Google Event as object.
 */

/**
 * @constructor
 * @param {Object} gevent
 */
var GEvent = function(gevent) {
  /**
   * @type {number}
   * @private
   */
  this.id_ = gevent.id;
  /**
   * @type {string}
   * @private
   */
  this.summary_ = gevent.summary;
  /**
   * @type {string}
   * @private
   */
  this.location_ = gevent.location;
  /**
   * @type {string}
   * @private
   */
  this.start_ = gevent.start;
  /**
   * @type {string}
   * @private
   */
  this.end_ = gevent.end;
};

/**
 * export GEvent to JSON object
 * @return {!Object}
 */
GEvent.prototype.toJsonObject = function() {
  return {
    'id': this.id_,
    'calendarId': this.calendarId_,
    'summary': this.summary_,
    'location': this.location_,
    'start': this.start_,
    'end': this.end_
  };
};
