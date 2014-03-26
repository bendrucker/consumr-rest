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

module.exports = function (Model) {

  Model.prototype.url = function () {
    return this.base + '/' + this.path + (this.isNew() ? '' : '/' + this.id);
  };

  Model.prototype.fetch = Promise.method(function () {
    internals.disallowNew.call(this);
    return Promise
      .bind(this)
      .then(function () {
        return this.emitThen('preFetch', this);
      })
      .return(new Request('GET', this.url()))
      .tap(utils.eavesdrop)
      .call('send')
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
        return new Request(method, this.url(), this.toJSON({shallow: true}));
      })
      .tap(utils.eavesdrop)
      .call('send')
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
      .return(new Request('DELETE', this.url()))
      .tap(utils.eavesdrop)
      .call('send')
      .then(this.reset)
      .tap(function () {
        this.emitThen('postDestroy', this);
      });
  });

  return Model;

};