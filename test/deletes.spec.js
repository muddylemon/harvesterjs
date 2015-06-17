var _ = require('lodash');
var should = require('should');
var $http = require('http-as-promised');

var seeder = require('./seeder.js');

describe("deletes", function () {

  var idsHolder = seeder().beforeEach();
  var config;
  beforeEach(function () {
    config = this.config;
  });

  it("Should handle deletes with a 204 statusCode", function () {
    return $http.del(config.baseUrl + "/people/" + idsHolder.ids.people[0], {json: {}}).spread(function (res) {
      res.statusCode.should.equal(204);
      delete idsHolder.ids.people[0];
    })
  });
});
