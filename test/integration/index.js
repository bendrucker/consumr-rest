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

  // describe('Collection', function () {

  //   var users, user;
  //   beforeEach(function () {
  //     users = User.collection();
  //     user = new User({id: 0});
  //     users.push(user);
  //   });

  //   it('is an array of models', function () {
  //     expect(users).to.have.length(1).and.property('0', user);
  //   });

  //   describe('#fetch', function () {

  //     beforeEach(function () {
  //       api
  //         .get('/users')
  //         .reply(200, [
  //           {
  //             id: 0,
  //             name: 'Ben'
  //           },
  //           {
  //             id: 1,
  //             name: 'Drucker'
  //           }
  //         ]);
  //     });

  //     it('updates the array with the response', function () {
  //       return users.fetch().finally(function () {
  //         expect(users).to.have.length(2);
  //       });
  //     });

  //     it('updates existing models in place', function () {
  //       return users.fetch().finally(function () {
  //         expect(users[0]).to.equal(user).and.to.have.property('name', 'Ben');
  //       });
  //     });

  //     it('adds new models', function () {
  //       return users.fetch().finally(function () {
  //         expect(users[1]).to.contain({id: 1, name: 'Drucker'});
  //       });
  //     });

  //     it('triggers request lifecycle events', function () {
  //       return verifyRequestEvents(users, 'fetch');
  //     });

  //   });

  // });

});