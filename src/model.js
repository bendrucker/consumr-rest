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

internals.options = function (options) {
  options.dataProperty = this.dataProperty;
  options.errorProperty = this.errorProperty;
  return options;
};

module.exports = function (Model) {

  Model.prototype.url = function () {
    return this.base + '/' + this.path + (this.isNew() ? '' : '/' + this.id);
  };

  Model.prototype.request = function (method, url, data, options) {
    return Promise
      .bind(this)
      .return(new Request(method, url, data, internals.options.call(this, options || {})))
      .tap(utils.eavesdrop)
      .call('send');
  };

  Model.prototype.fetch = Promise.method(function () {
    internals.disallowNew.call(this);
    return Promise
      .bind(this)
      .then(function () {
        return this.emitThen('preFetch', this);
      })
      .then(function () {
        return this.request('GET', this.url());
      })
      .then(this.set)
      .tap(function () {
        return this.emitThen('postFetch', this);
      });
  });

  Model.prototype.save = function () {
    return Promise
      .bind(this)
      .then(function () {
        return this.emitThen('preSave', this);
      })
      .then(internals.save)
      .then(function (method) {
        return this.request(method, this.url(), this.toJSON({shallow: true}));
      })
      .then(this.set)
      .tap(function () {
        return this.emitThen('postSave', this);
      });
  };

  Model.prototype.destroy = Promise.method(function () {
    internals.disallowNew.call(this);
    return Promise
      .bind(this)
      .then(function () {
        return this.emitThen('preDestroy', this);
      })
      .then(function () {
        return this.request('DELETE', this.url());
      })
      .then(this.reset)
      .tap(function () {
        this.emitThen('postDestroy', this);
      });
  });

  return Model;

};