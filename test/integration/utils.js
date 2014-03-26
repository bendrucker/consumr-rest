'use strict';

var internals = {};

internals.requestEvents = ['preRequest', 'postRequest', 'preResponse', 'postResponse'];

exports.verifyRequestEvents = function (target, action) {
  var spy = sinon.spy();
  internals.requestEvents.forEach(function (event) {
    target.on(event, spy);
  });
  return target[action]().then(function () {
    expect(spy.callCount).to.equal(internals.requestEvents.length);
  });
};