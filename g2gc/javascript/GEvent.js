/**
 * @fileoverview Google Event as object.
 */
goog.provide('g2gc.GEvent');

/**
 * @constructor
 * @param {Object} event
 */
g2gc.GEvent = function(event) {
  /**
   * @type {string}
   * @private
   */
  this.calendarId_;
  /**
   * @type {number}
   * @private
   */
  this.id_ = event.id;
  /**
   * @type {string}
   * @private
   */
  this.summary_ = event.summary;
  /**
   * @type {string}
   * @private
   */
  this.location_ = event.location;
  /**
   * @type {string}
   * @private
   */
  this.start_ = event.start;
  /**
   * @type {string}
   * @private
   */
  this.end_ = event.end;
};

/**
 * export GEvent to JSON object
 * @return {!Object}
 */
g2gc.GEvent.prototype.toJsonObject = function() {
  return {
    'id': this.id_,
    'calendarId': this.calendarId_,
    'summary': this.summary_,
    'location': this.location_,
    'start': this.start_,
    'end': this.end_
  };
};
