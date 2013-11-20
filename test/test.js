var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
var badger = require("../honeybadger_node");

var request = require ('request');

describe('errorPackage', function() {
  it('should return a JSON-safe object', function() {
    expect(JSON.stringify(badger.errorPackage({message:'message body', url:'http://foo.bar'}))).to.be.a('string');
  });
});

describe('notify', function() {
  it('should ', function() {
    var mock = sinon.mock(request);
    mock.expects("post").once();
    badger.notify({message:'foo', url:'bar'})
  });
});
