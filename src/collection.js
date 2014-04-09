'use strict';

var Promise     = require('bluebird');
var Request     = require('request2');
var querystring = require('querystring');
var utils       = require('./utils');

var internals = {};

internals.querystring = function () {
  return Object.keys(this.attributes).length ? '?' + querystring.stringify(this.attributes) : '';
};

module.exports = function (Collection) {

  Collection.prototype.fetch = function (options) {
    options = options || {};
    return Promise
      .bind(this)
      .then(function () {
        this.emitThen('preFetch', this, options);
      })
      .then(function () {
        return this.model.prototype.url() + internals.querystring.call(this);
      })
      .then(function (url) {
        return new Request('GET', url, null, {
          errorProperty: this.model.prototype.errorProperty,
          dataProperty: this.model.prototype.dataProperty
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