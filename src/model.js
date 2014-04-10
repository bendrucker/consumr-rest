'use strict';

var Promise = require('bluebird');
var Request = require('request2');
var utils   = require('./utils');

var internals = {};

internals.disallowNew = function () {
  if (this.isNew()) throw new Error('Action not allowed on a new model');
};

internals.save = function () {
  return this.isNew() ? 'POST' : 'PUT';
};

internals.options = function (model, options) {
  options.dataProperty = model.dataProperty;
  options.errorProperty = model.errorProperty;
  return options;
};

module.exports = function (Model) {

  Model.prototype.url = function () {
    return this.base + '/' + this.path + (this.isNew() ? '' : '/' + this.id);
  };

  Model.prototype.request = function (method, url, data, options) {
    return Promise
      .bind(this)
      .return(new Request(method, url, data, internals.options(model, options || {})))
      .tap(utils.eavesdrop)
      .call('send');
  };

  Model.prototype.fetch = Promise.method(function (options) {
    options = options || {};
    internals.disallowNew.call(this);
    return Promise
      .bind(this)
      .then(function () {
        return this.emitThen('preFetch', this, options);
      })
      .then(function () {
        return this.request('GET', this.url(), null, options);
      })
      .then(function (response) {
        return this.set(response, options);
      })
      .tap(function () {
        return this.emitThen('postFetch', this, options);
      });
  });

  Model.prototype.save = function (options) {
    options = options || {};
    return Promise
      .bind(this)
      .then(function () {
        return this.emitThen('preSave', this, options);
      })
      .then(internals.save)
      .then(function (method) {
        return this.request(method, this.url(), this.toJSON(), options);
      })
      .then(function (response) {
        return this.set(response, options);
      })
      .tap(function () {
        return this.emitThen('postSave', this, options);
      });
  };

  Model.prototype.destroy = Promise.method(function (options) {
    options = options || {};
    internals.disallowNew.call(this);
    return Promise
      .bind(this)
      .then(function () {
        return this.emitThen('preDestroy', this, options);
      })
      .then(function () {
        return this.request('DELETE', this.url(), null, options);
      })
      .then(this.reset)
      .tap(function () {
        this.emitThen('postDestroy', this, options);
      });
  });

  return Model;

};