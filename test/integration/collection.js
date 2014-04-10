'use strict';

var utils = require('./utils');

module.exports = function (test) {

  describe('Collection', function () {

    var users, user;
    beforeEach(function () {
      users = new test.Collection(test.Model);
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
              name: 'Ben',
              referrer_id: 0
            },
            {
              id: 1,
              name: 'Drucker',
              referrer_id: 1
            }
          ]);
      });

      it('updates the array with the response', function () {
        return users.fetch().then(function () {
          expect(users).to.have.length(2);
        });
      });

      it('updates existing models in place', function () {
        return users.fetch().then(function () {
          expect(users[0]).to.equal(user).and.to.have.property('name', 'Ben');
        });
      });

      it('adds new models', function () {
        return users.fetch().then(function () {
          expect(users[1]).to.contain({id: 1, name: 'Drucker'});
        });
      });

      it('triggers request lifecycle events', function () {
        return utils.verifyRequestEvents(users, 'fetch');
      });

      it('can handle related data', function () {
        test.Model.prototype.relations = {
          referrer: function () {
            return this.belongsTo(test.Model, 'referrer_id');
          }
        };
        return users
          .fetch({withRelated: 'referrer'})
          .call('toArray')
          .map(function (user) {
            expect(user)
              .to.have.property('referrer')
              .that.is.an.instanceOf(test.Model)
              .and.has.property('id', user.referrer_id);
          });
      });

    });

  });

};