var _ = require('lodash');
var should = require('should');
var $http = require('http-as-promised');

var config = require('../config.js');


describe("deletes", function () {

  var ids;
  beforeEach(function () {
    this.timeout(50000);
    return require('./fixtures.js')().seed().then(function (_ids) {
      ids = _ids;
    });
  });

  it("Should handle deletes with a 204 statusCode", function () {
    return $http.del(config.baseUrl + "/people/" + ids.people[0], {json: {}}).spread(function (res) {
      res.statusCode.should.equal(204);
      delete ids.people[0];
    })
  });
});
