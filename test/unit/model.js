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

  var send;
  beforeEach(function () {
    send = sinon.stub(Request.prototype, 'send').resolves({
      foo: 'bar'
    });
  });

  afterEach(function () {
    send.restore();
  });

  describe('#request', function () {

    it('sends a request with the supplied params', function () {
      return model.request(null, '').finally(function () {
        expect(send).to.have.been.called;
      });
    });

    it('supplies the data and error properties from the model', function () {
      model.dataProperty = 'd';
      model.errorProperty = 'e';
      return model.request(null, '').finally(function () {
        expect(send).to.have.been.calledOn(
          sinon.match.has('options', sinon.match.has('dataProperty', 'd')
          .and(sinon.match.has('errorProperty', 'e')))
        );
      });
    });

  });

  describe('REST Methods', function () {

    var options;
    beforeEach(function () {
      model.id = 0;
      options = {};
    });

    beforeEach(function () {
      sinon.spy(model, 'set');
      sinon.spy(model, 'emitThen');
    });

    beforeEach(function () {
      sinon.spy(model, 'request');
    });

    describe('#fetch', function () {

      it('cannot be fetched when isNew', function () {
        sinon.stub(model, 'isNew').returns(true);
        return expect(model.fetch()).to.be.rejectedWith(/^Action not allowed/);
      });

      it('fires a preFetch event', function () {
        return model.fetch(options).finally(function () {
          expect(model.emitThen).to.have.been.calledWith('preFetch', model, options);
        });
      });

      it('GETs the model url', function  () {
        return model.fetch(options).finally(function () {
          expect(model.request).to.have.been.calledWith('GET', model.url(), null, options);
        });
      });

      it('populates the model with the response body', function () {
        return model.fetch(options).then(function () {
          expect(model.set).to.have.been.calledWithMatch({foo: 'bar'}, options);
        });
      });

      it('fires a postFetch event', function () {
        return model.fetch(options).finally(function () {
          expect(model.emitThen)
            .to.have.been.calledWith('postFetch', model, options)
            .and.to.have.been.calledAfter(model.set);
        });
      });

    });

    describe('#save', function () {

      it('runs a POST when isNew', function () {
        sinon.stub(model, 'isNew').returns(true);
        return model.save(options).finally(function () {
          expect(model.request).to.have.been.calledWith('POST', model.url(), sinon.match.any, options);
        });
      });

      it('runs a PUT when !isNew', function () {
        return model.save().finally(function () {
          expect(model.request).to.have.been.calledWith('PUT', model.url());
        });
      });

      it('fires a preSave event', function () {
        return model.save(options).finally(function () {
          expect(model.emitThen).to.have.been.calledWith('preSave', model, options);
        });
      });

      it('sends the model JSON as the request data', function () {
        sinon.stub(model, 'toJSON').returns({});
        return model.save(options).finally(function () {
          expect(model.toJSON).to.have.been.called;
          expect(model.request).to.have.been.calledWith(
            sinon.match.any,
            sinon.match.any,
            model.toJSON.firstCall.returnValue,
            options
          );
        });
      });

      it('populates the model with the response body', function () {
        return model.save(options).finally(function () {
          expect(model.set).to.have.been.calledWithMatch({foo: 'bar'}, {});
        });
      });

      it('fires a postSave event', function () {
        return model.save(options).finally(function () {
          expect(model.emitThen)
            .to.have.been.calledWith('postSave', model, options)
            .and.to.have.been.calledAfter(model.set);
        });
      });

    });

    describe('#destroy', function () {

      beforeEach(function () {
        sinon.spy(model, 'reset');
      });

      it('cannot be destroyed when isNew', function () {
        sinon.stub(model, 'isNew').returns(true);
        return expect(model.destroy()).to.be.rejectedWith(/Action not allowed/);
      });

      it('fires a preDestroy event', function () {
        return model.destroy(options).finally(function () {
          expect(model.emitThen).to.have.been.calledWith('preDestroy', model, options);
        });
      });

      it('DELETEs the model url', function  () {
        return model.destroy(options).finally(function () {
          expect(model.request).to.have.been.calledWith('DELETE', model.url(), null, options);
        });
      });

      it('resets the model', function  () {
        return model.destroy().finally(function () {
          expect(model.reset).to.have.been.called;
        });
      });

      it('fires a postDestroy event', function () {
        return model.destroy(options).finally(function () {
          expect(model.emitThen)
            .to.have.been.calledWith('postDestroy', model, options)
            .and.to.have.been.calledAfter(model.reset);
        });
      });

    });

  });
  
});