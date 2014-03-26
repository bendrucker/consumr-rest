'use strict';

var Collection = function () {
  this.attributes = {};
};

['merge', 'emitThen']
  .forEach(function (method) {
    Collection.prototype[method] = function () {};
  });

module.exports = Collection;