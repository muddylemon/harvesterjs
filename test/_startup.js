var _ = require('lodash');
var request = require('supertest');
var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var should = require('should');

var config = require('./config.js');

before(function () {
  this.app = require('./harvester/app.js')(config.harvester.options);
  this.config = config;
  this.app.listen(config.harvester.port);
  var harvesterApp = this.app;
  return new Promise(function (resolve, reject) {
    harvesterApp.adapter.awaitConnection().then(resolve).catch(reject);
  }).then(function () {
        console.log("--------------------");
        console.log("Running tests:");
      })
});
