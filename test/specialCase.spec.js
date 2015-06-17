var request = require('supertest');
var should = require('should');

var appFactory = require('./app.js');
var seeder = require('./seeder.js');

/**
 * This test case demonstrates how to setup test with custom harvester on different port
 */
describe('Custom harvester demo', function () {
  var baseUrl = 'http://localhost:8001';
  before(function () {
    function customAppConfigurator(app) {
      app.resource('geek', {
        name: String
      });
      app.listen(8001);
    }

    var that = this;
    return appFactory.create(customAppConfigurator).then(function (result) {
      that.app = result;
    });
  });

  seeder({baseUrl: baseUrl}).beforeEach({geeks: [
    {name: 'Jack'}
  ]});

  it('should hit custom resource', function (done) {
    request(baseUrl).get('/geeks').expect('Content-Type', /json/).expect(200).end(function (error, response) {
      should.not.exist(error);
      var body = JSON.parse(response.text);
      body.geeks.length.should.equal(1);
      done();
    });
  });
});
