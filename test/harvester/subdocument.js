var should = require('should');
var _ = require('lodash');
var RSVP = require('rsvp');
var request = require('supertest');
var Promise = RSVP.Promise;
var Harvester = require('../../lib/harvester');
var chai = require('chai');

describe("Subdocument constructor", function() {
    var app;

    before(function() {
        var options = {
            adapter: 'mongodb',
            connectionString: process.argv[2] || process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/testDB",
            db: 'testDB',
            inflect: true,
            oplogConnectionString : (process.env.OPLOG_MONGODB_URL || process.argv[3] || "mongodb://127.0.0.1:27017/local") + '?slaveOk=true'
        };

        app = Harvester(options);
        return;
    });

    it("is on the harvest app", function(){
        should.exist(app.Subdocument);
    });

    it("instantiates a subdocument", function(){
        var subdoc = new app.Subdocument();
        subdoc.should.be.an.instanceOf(app.Subdocument);
    });

});
