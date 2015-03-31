'use strict';

var GEvent = function(gevent) {
  this.id_ = gevent.id;
  this.summary_ = gevent.summary;
  this.location_ = gevent.location;
  this.start_ = gevent.start;
  this.end_ = gevent.end;
};

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