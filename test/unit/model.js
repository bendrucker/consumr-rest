'use strict';

var Request    = require('request2');
var BaseModel  = require('../mocks/model');
var RESTModel  = require('../../src/model')(BaseModel);

describe('Model', function () {

  var model;
  beforeEach(function () {
    model = new RESTModel();
  });

  describe('.rest', function () {

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

  });

  

  describe('REST Methods', function () {

    beforeEach(function () {
      model.id = 0;
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
        return model.fetch().then(function (model) {
          expect(model).to.have.property('foo', 'bar');
        });
      });

    });

  //   describe('#save', function () {

  //     it('runs a POST when isNew', function () {
  //       model.id = undefined;
  //       return model.save().finally(function () {
  //         expect(send).to.have.been.calledOn(sinon.match.has('method', 'POST'));
  //       });
  //     });

  //     it('runs a PUT when !isNew', function () {
  //       return model.save().finally(function () {
  //         expect(send).to.have.been.calledOn(sinon.match.has('method', 'PUT'));
  //       });
  //     });

  //     it('sends the model as the request data', function () {
  //       return model.save().finally(function () {
  //         expect(send).to.have.been.calledOn(sinon.match.has('data', sinon.match.has('id')));
  //       });
  //     });

  //     it('strips internal properties before sending', function () {
  //       return model
  //         .on('preRequest', function (request) {
  //           expect(request.data).to.not.have.property('_events');
  //         })
  //         .save();
  //     });

  //     it('populates the model with the response body', function () {
  //       return model.save().finally(function () {
  //         expect(model).to.have.property('foo', 'bar');
  //       });
  //     });

  //   });

  //   describe('#destroy', function () {

  //     it('cannot be destroyed when isNew', function () {
  //       model.id = undefined;
  //       return expect(model.destroy()).to.be.rejectedWith(/Cannot destroy/);
  //     });

  //     it('DELETEs the model url', function  () {
  //       var url = model.url();
  //       return model.destroy().finally(function () {
  //         expect(send).to.have.been.calledOn(sinon.match.has('url', sinon.match(/\/0$/)));
  //       });
  //     });

  //     it('resets the model', function  () {
  //       return model.destroy().finally(function () {
  //         expect(model).to.not.have.property('id');
  //       });
  //     });

  //   });

  });
  
});