'use strict';

var Promise     = require('bluebird');
var Request     = require('request2');
var _           = require('lodash');
var utils       = require('./utils');

var internals = {};

internals.query = function (collection, options) {
  var query = _.clone(collection.attributes);
  if (options.expand !== false && options.withRelated) {
    query.expand = options.withRelated;
  }
  return query;
};

module.exports = function (Collection) {

  Collection.prototype.fetch = function (options) {
    options = options || {};
    return Promise
      .bind(this)
      .then(function () {
        this.emitThen('preFetch', this, options);
      })
      .then(function (url) {
        return new Request('GET', this.model.prototype.url(), null, {
          errorProperty: this.model.prototype.errorProperty,
          dataProperty: this.model.prototype.dataProperty,
          query: internals.query(this, options)
        });
      })
      .tap(utils.eavesdrop)
      .call('send')
      .then(function (response) {
        return this.merge(response, options);
      })
      .tap(function () {
        this.emitThen('postFetch', this, options);
      });
  };

  return Collection;

};