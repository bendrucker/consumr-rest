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