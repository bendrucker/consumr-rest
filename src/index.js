'use strict';

var restModel      = require('./model');
var restCollection = require('./collection');

module.exports = function (Consumr) {
  restModel(Consumr.Model);
  restCollection(Consumr.Collection);
};