var request = require('supertest');
var should = require('should');
var harvester = require('../lib/harvester');

var config = require('./config.js');
var seeder = require('./seeder.js');

/**
 * This test case demonstrates how to setup test with custom harvester on different port
 */
describe('Custom harvester demo', function () {
    var baseUrl = 'http://localhost:8001';
    before(function () {
        function customAppConfigurator(app) {
            app.resource('pets', {
                name: String
            });
        }

        var app = harvester(config.harvester.options);
        customAppConfigurator(app);
        app.listen(8001);
        this.app = app;
    });

    beforeEach(function () {
        return seeder(this.app).dropCollectionsAndSeed('pets')
    });


    it('should hit custom resource', function (done) {
        request(baseUrl).get('/pets').expect('Content-Type', /json/).expect(200).end(function (error, response) {
            should.not.exist(error);
            var body = JSON.parse(response.text);
            body.pets.length.should.equal(2);
            done();
        });
    });
});
