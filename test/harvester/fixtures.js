var _ = require('lodash');
var inflect = require('i')();
var request = require('supertest');
var RSVP = require('rsvp');
var Promise = RSVP.Promise;

var config = require('../config.js');

module.exports = function () {
  var standardFixture = {"person": [
    {
      "name": "Dilbert",
      "appearances": 3457,
      "id": "24b9e720-0a51-11e5-bd6f-291dee7167a0"

    },
    {
      "name": "Wally",
      "appearances": 1934
    }
  ],
    "pet": [
      {
        "name": "Dogbert",
        "appearances": 1903
      },
      {
        "name": "Ratbert",
        "appearances": 509
      }
    ]};

  function doSeed(key, value, resolve, reject) {
    var body = {};
    body[key] = value;
    request(config.baseUrl).post('/' + key).send(body).expect('Content-Type', /json/).expect(201).end(function (error, response) {
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

  function seedType(key, value) {
    key = inflect.pluralize(key);
    return new Promise(function (resolve, reject) {
      var collection = config.app.adapter.db.collections[key];
      if (collection) {
        collection.drop(function () {
          doSeed(key, value, resolve, reject);
        });
      } else {
        doSeed(key, value, resolve, reject);
      }
    });
  }

  return {
    data: _.cloneDeep(standardFixture),
    seed: function (customFixture) {
      var fixture = null == customFixture ? standardFixture : customFixture;
      var keys = _.keys(fixture);
      var promises = [];
      _.forEach(keys, function (key) {
        promises.push(seedType(key, fixture[key]));
      });
      return RSVP.all(promises).then(function (result) {
        var response = {};
        _.forEach(result, function (item) {
          _.extend(response, item);
        });
        return response;
      });
    }
  };
};
