'use strict';

var CollectionBase = require('../mocks/collection');
var Collection     = require('../../src/collection')(CollectionBase);
var Request        = require('request2');

describe('Collection', function () {

  var collection;
  beforeEach(function () {
    collection = new Collection();
  });

  var send;
  beforeEach(function () {
    send = sinon.stub(Request.prototype, 'send').resolves([]);
  });

  afterEach(function () {
    send.restore();
  });

  var Model;
  beforeEach(function () {
    Model = {
      prototype: {}
    };
    Model.prototype.url = function () {
      return 'http://url/';
    };
    collection.model = Model;
  });

  var options;
  beforeEach(function () {
    options = {};
  });

  beforeEach(function () {
    sinon.spy(collection, 'emitThen');
    sinon.spy(collection, 'merge');
  });

  describe('#fetch', function () {

    it('emits a preFetch event', function () {
      return collection.fetch(options).finally(function () {
        expect(collection.emitThen).to.have.been.calledWith('preFetch', collection, options);
      });
    });

    it('fetches the base URL if no attributes are defined', function () {
      return collection.fetch().finally(function () {
        expect(send).to.have.been.calledOn(sinon.match.has('url', 'http://url/'));
      });
    });

    it('adds attributes to the query string', function () {
      collection.attributes = {
        foo: 'bar',
        baz: 'qux'
      };
      return collection.fetch().finally(function () {
        expect(send).to.have.been.calledOn(sinon.match.has(
          'url', 'http://url/?foo=bar&baz=qux'));
      });
    });

    it('uses the errorProperty and dataProperty from the model', function () {
      Model.prototype.errorProperty = 'error';
      Model.prototype.dataProperty = 'data';

      return collection.fetch().finally(function () {
        expect(send).to.have.been.calledOn(sinon.match.has('options', sinon.match({
          errorProperty: 'error',
          dataProperty: 'data'
        })));
      });
    });

    it('merges the response body', function () {
      return collection.fetch().finally(function () {
        expect(collection.merge).to.have.been.calledWithMatch([], options);
      });
    });

    it('emits a postFetch event', function () {
      return collection.fetch(options).finally(function () {
        expect(collection.emitThen)
          .to.have.been.calledWith('preFetch', collection, options)
          .and.to.have.been.calledAfter(collection.merge);
      });
    });

  });

});