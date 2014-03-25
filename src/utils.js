'use strict';

var eavesdrop = require('eavesdrop');

var internals = {};

internals.requestEvents = ['preRequest', 'postRequest', 'preResponse', 'postResponse'];

exports.eavesdrop = function (request) {
  eavesdrop.call(this, request, {
    events: internals.requestEvents,
    method: 'emitThen'
  });
};