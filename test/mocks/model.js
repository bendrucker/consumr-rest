var Model = function () {};

['isNew','emitThen','toJSON','set','reset']
  .forEach(function (method) {
    Model.prototype[method] = function () {};
  });

module.exports = Model;