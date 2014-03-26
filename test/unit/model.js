'use strict';

var Request    = require('request2');
var BaseModel  = require('../mocks/model');
var RESTModel  = require('../../src/model')(BaseModel);

describe('Model', function () {

  var model;
  beforeEach(function () {
    model = new RESTModel();
  });

  describe('#url', function () {

    beforeEach(function () {
      model.base = 'http://base';
      model.path = 'model';
    });

    it('is the collection endpoint for new models', function () {
      sinon.stub(model, 'isNew').returns(true);
      expect(model.url()).to.equal('http://base/model');
    });

    it('is the model endpoint for persisted models', function () {
      sinon.stub(model, 'isNew').returns(false);
      model.id = 0;
      expect(model.url()).to.equal('http://base/model/0');
    });

  });

  describe('REST Methods', function () {

    beforeEach(function () {
      model.id = 0;
    });

    beforeEach(function () {
      sinon.spy(model, 'set');
    });

    var send;
    beforeEach(function () {
      send = sinon.stub(Request.prototype, 'send').resolves({
        foo: 'bar'
      });
    });

    afterEach(function () {
      send.restore();
    });

    describe('#fetch', function () {

      it('cannot be fetched when isNew', function () {
        sinon.stub(model, 'isNew').returns(true);
        return expect(model.fetch()).to.be.rejectedWith(/^Action not allowed/);
      });

      it('GETs the model url', function  () {
        return model.fetch().finally(function () {
          expect(send).to.have.been.calledOn(sinon.match.has('url', model.url()));
        });
      });

      it('populates the model with the response body', function () {
        return model.fetch().then(function () {
          expect(model.set).to.have.been.calledWithMatch({foo: 'bar'});
        });
      });

    });

    describe('#save', function () {

      it('runs a POST when isNew', function () {
        sinon.stub(model, 'isNew').returns(true);
        return model.save().finally(function () {
          expect(send).to.have.been.calledOn(sinon.match.has('method', 'POST'));
        });
      });

      it('runs a PUT when !isNew', function () {
        return model.save().finally(function () {
          expect(send).to.have.been.calledOn(sinon.match.has('method', 'PUT'));
        });
      });

      it('sends the model JSON as the request data', function () {
        sinon.stub(model, 'toJSON').returns({});
        return model.save().finally(function () {
          expect(model.toJSON).to.have.been.calledWithMatch({shallow: true});
          expect(send).to.have.been.calledOn(sinon.match.has('data', model.toJSON.firstCall.returnValue));
        });
      });

      it('populates the model with the response body', function () {
        return model.save().finally(function () {
          expect(model.set).to.have.been.calledWithMatch({foo: 'bar'});
        });
      });

    });

    describe('#destroy', function () {

      it('cannot be destroyed when isNew', function () {
        sinon.stub(model, 'isNew').returns(true);
        return expect(model.destroy()).to.be.rejectedWith(/Action not allowed/);
      });

      it('DELETEs the model url', function  () {
        var url = model.url();
        return model.destroy().finally(function () {
          expect(send).to.have.been.calledOn(
            sinon.match.has('url', sinon.match(/\/0$/))
            .and(sinon.match.has('method', 'DELETE'))
          );
        });
      });

      it('resets the model', function  () {
        sinon.spy(model, 'reset');
        return model.destroy().finally(function () {
          expect(model.reset).to.have.been.called;
        });
      });

    });

  });
  
});