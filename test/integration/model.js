'use strict';

var utils = require('./utils');

module.exports = function (test) {

  describe('Model', function () {

    var user;
    beforeEach(function () {
      user = new test.Model({id: 0});
    });

    describe('#fetch', function () {

      var mockFetch = function () {
        test.api
          .get('/users/0')
          .reply(200, {
            id: 0,
            name: 'Ben'
          });
      };

      it('fetches the model data from the server', function () {
        mockFetch();
        return user
          .fetch()
          .bind(user)
          .then(function (user) {
            expect(user).to.equal(this)
              .and.to.have.property('name', 'Ben');
          });
      });

      it('can fetch with related data', function () {
        user.relations = {
          invited_by: function () {
            return this.belongsTo(test.Model, 'invited_by_id');
          }
        };
        test.api
          .get('/users/0?expand=invited_by')
          .reply(200, {
            id: 0,
            name: 'Ben',
            invited_by_id: 1,
            invited_by: {
              name: 'Jordan'
            }
          });
        return user
          .fetch({withRelated: 'invited_by'})
          .then(function (user) {
            expect(user).to.have.property('invited_by')
              .that.is.an.instanceof(test.Model);
            return user.invited_by;
          })
          .then(function (invited_by) {
            expect(invited_by).to.contain({
              id: 1,
              name: 'Jordan'
            });
          });
      });

      it('can fetch with collections of related data', function () {
        user.relations = {
          friends: function () {
            return this.hasMany(test.Model, 'friends');
          }
        };
        test.api
          .get('/users/0?expand=friends')
          .reply(200, {
            id: 0,
            name: 'Ben',
            friends: [{
              name: 'Jordan'
            }]
          });
        return user
          .fetch({withRelated: 'friends'})
          .then(function (user) {
            expect(user).to.have.property('friends')
              .that.is.an.instanceOf(test.Collection);
            return user.friends;
          })
          .then(function (friends) {
            expect(friends).to.have.length(1)
              .and.property(0)
              .that.is.an.instanceOf(test.Model)
              .with.property('name', 'Jordan');
          });
      });

      it('triggers lifecycle events', function () {
        mockFetch();
        return utils.verifyRequestEvents(user, 'fetch');
      });

      it('can halt the request during a lifecycle event', function () {
        var err = new Error('stop');
        return expect(user
          .on('preRequest', function () {
            throw err;
          })
          .fetch())
          .to.be.rejectedWith(err);
      });

    });

    describe('#save', function () {

      it('triggers a POST for new models', function () {
        test.api
          .post('/users')
          .reply(201, {
            id: 1
          });
        user.id = null;
        return user
          .on('preRequest', function (request) {
            expect(request.method).to.equal('POST');
          })
          .save()
          .then(function (user) {
            expect(user).to.have.property('id', 1);
          });
      });

      it('triggers a PUT for new models', function () {
        test.api
          .put('/users/0')
          .reply(200, {
            id: 0,
            name: 'Ben'
          });
        return user
          .on('preRequest', function (request) {
            expect(request.method).to.equal('PUT');
          })
          .save()
          .then(function (user) {
            expect(user).to.have.property('name', 'Ben');
          });
      });

      it('triggers lifecycle events', function () {
        test.api
          .put('/users/0')
          .reply(200, {
            id: 0,
            name: 'Ben'
          });
        return utils.verifyRequestEvents(user, 'save');
      });

    });

    describe('#destroy', function () {

      beforeEach(function () {
        test.api
          .delete('/users/0')
          .reply(200, '');
        });

      it('triggers a DELETE', function () {
        return user
          .on('preRequest', function (request) {
            expect(request.method).to.equal('DELETE');
          })
          .destroy()
          .then(function (user) {
            expect(user).to.not.have.property('id');
          });
      });

      it('triggers lifecycle events', function () {
        return utils.verifyRequestEvents(user, 'destroy');
      });

    });

  });
};