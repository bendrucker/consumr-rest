'use strict';

var Consumr     = require('consumr');
var ConsumrREST = require('../../src');
var nock        = require('nock');

describe('Integration', function () {

  Consumr.use(ConsumrREST);

  var test = {};

  beforeEach(function () {
    test.Model = function (attributes) {
      Consumr.Model.call(this, attributes);
    };
    test.Model.prototype = Object.create(Consumr.Model.prototype);
  });

  beforeEach(function () {
    test.Model.prototype.base = 'http://testendpoint.api';
    test.Model.prototype.path = 'users';
  });

  beforeEach(function () {
    test.Collection = function (attributes) {
      Consumr.Collection.call(this, attributes);
    };
    test.Collection.prototype = Object.create(Consumr.Collection.prototype);
    test.Collection.prototype.model = test.Model;
  });

  beforeEach(function () {
    test.api = nock('http://testendpoint.api');
  });

  afterEach(function () {
    test.api.done();
  });

  after(function () {
    nock.cleanAll();
    nock.restore();
  });

  require('./model')(test);
  require('./collection')(test);

});