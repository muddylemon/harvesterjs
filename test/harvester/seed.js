var _ = require('lodash');
var inflect = require('i')();
var request = require('supertest');
var RSVP = require('rsvp');
var Promise = RSVP.Promise;

var config = require('../config.js');
var fixtures = require('./fixtures');

module.exports = function (configuration) {

  function doSeed(key, value, resolve, reject) {
    var body = {};
    body[key] = value;
    request((configuration || config).baseUrl).post('/' + key).send(body).expect('Content-Type', /json/).expect(201).end(function (error, response) {
      if (error) {
        reject(error);
        return;
      }
      var resources = JSON.parse(response.text)[key];
      var ids = {};
      ids[key] = [];
      _.forEach(resources, function (resource) {
        ids[key].push(resource.id);
      });
      resolve(ids);
    });
  }

  function seedType(key, value, db) {
    key = inflect.pluralize(key);
    return new Promise(function (resolve, reject) {
      var collection = db.collections[key];
      if (collection) {
        collection.drop(function () {
          doSeed(key, value, resolve, reject);
        });
      } else {
        doSeed(key, value, resolve, reject);
      }
    });
  }

  function seed(customFixture, db) {
    var fixture = null == customFixture ? fixtures() : customFixture;
    var keys = _.keys(fixture);
    var promises = [];
    _.forEach(keys, function (key) {
      promises.push(seedType(key, fixture[key], db));
    });
    return RSVP.all(promises).then(function (result) {
      var response = {};
      _.forEach(result, function (item) {
        _.extend(response, item);
      });
      return response;
    });
  }

  return {
    beforeEach: function (fixture, timeout, afterSeed) {
      var idsHolder = {};
      beforeEach(function () {
        var that = this;
        this.timeout(timeout || 50000);
        return seed(fixture, this.app.adapter.db).then(function (result) {
          idsHolder.ids = result;
          if (afterSeed instanceof Function) {
            return afterSeed.call(that, result);
          } else {
            return null;
          }
        });
      });
      return idsHolder;
    },
    before: function (fixture, timeout, afterSeed) {
      var idsHolder = {};
      before(function () {
        var that = this;
        this.timeout(timeout || 50000);
        return seed(fixture, this.app.adapter.db).then(function (result) {
          idsHolder.ids = result;
          if (afterSeed instanceof Function) {
            return afterSeed.call(that, result);
          } else {
            return null;
          }
        });
      });
      return idsHolder;
    }
  }
};
