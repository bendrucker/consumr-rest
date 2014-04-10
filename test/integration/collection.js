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

      var mockUsers = function () {
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
      };

      it('updates the array with the response', function () {
        mockUsers();
        return users.fetch().then(function () {
          expect(users).to.have.length(2);
        });
      });

      it('updates existing models in place', function () {
        mockUsers();
        return users.fetch().then(function () {
          expect(users[0]).to.equal(user).and.to.have.property('name', 'Ben');
        });
      });

      it('adds new models', function () {
        mockUsers();
        return users.fetch().then(function () {
          expect(users[1]).to.contain({id: 1, name: 'Drucker'});
        });
      });

      it('triggers request lifecycle events', function () {
        mockUsers();
        return utils.verifyRequestEvents(users, 'fetch');
      });

      describe('Relations', function () {

        beforeEach(function () {
          test.Model.prototype.relations = {
            referrer: function () {
              return this.belongsTo(test.Model, 'referrer_id');
            }
          };
        });

        it('can handle related data', function () {
          mockUsers();
          return users
            .fetch({withRelated: 'referrer', expand: false})
            .call('toArray')
            .map(function (user) {
              expect(user)
                .to.have.property('referrer')
                .that.is.an.instanceOf(test.Model)
                .and.has.property('id', user.referrer_id);
            });
        });

        it('can handle expanded related data', function () {
          test.api
            .get('/users?expand=referrer')
            .reply(200, [
              {
                id: 0,
                name: 'Ben',
                referrer_id: 0,
                referrer: {
                  name: 'Ben'
                }
              },
              {
                id: 1,
                name: 'Drucker',
                referrer_id: 1,
                referer: {
                  name: 'Jordam'
                }
              }
            ]);
          return users.fetch({withRelated: 'referrer'})
            .call('toArray')
            .map(function (user) {
              expect(user)
                .to.have.property('name');
            });
        });

      });

    });

  });

};