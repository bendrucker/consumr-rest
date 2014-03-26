'use strict';

var utils = require('./utils');

module.exports = function (test) {

  describe('Collection', function () {

    var users, user;
    beforeEach(function () {
      users = new test.Collection();
      user = new test.Model({id: 0});
      users.push(user);
    });

    describe('#fetch', function () {

      beforeEach(function () {
        test.api
          .get('/users')
          .reply(200, [
            {
              id: 0,
              name: 'Ben'
            },
            {
              id: 1,
              name: 'Drucker'
            }
          ]);
      });

      it('updates the array with the response', function () {
        return users.fetch().finally(function () {
          expect(users).to.have.length(2);
        });
      });

      it('updates existing models in place', function () {
        return users.fetch().finally(function () {
          expect(users[0]).to.equal(user).and.to.have.property('name', 'Ben');
        });
      });

      it('adds new models', function () {
        return users.fetch().finally(function () {
          expect(users[1]).to.contain({id: 1, name: 'Drucker'});
        });
      });

      it('triggers request lifecycle events', function () {
        return utils.verifyRequestEvents(users, 'fetch');
      });

    });

  });

};