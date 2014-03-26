'use strict';

var ModelBase = require('consumr').Model;
var RESTModel = require('../../src/model')(ModelBase);
var nock      = require('nock');

describe('Integration', function () {

  var test = {};

  beforeEach(function () {
    test.Model = function (attributes) {
      ModelBase.call(this, attributes);
    };
    test.Model.prototype = Object.create(ModelBase.prototype);
  });

  beforeEach(function () {
    test.Model.prototype.base = 'http://testendpoint.api';
    test.Model.prototype.path = 'users';
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