'use strict';

var Consumr     = require('consumr');
var ConsumrREST = require('../../src');
var nock        = require('nock');

describe('Integration', function () {

  Consumr.use(ConsumrREST);

  var test = {};

  beforeEach(function () {
    test.Model = Consumr.Model.extend({
      base: 'http://testendpoint.api',
      path: 'users'
    });
  });

  beforeEach(function () {
    test.Collection = Consumr.Collection;
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