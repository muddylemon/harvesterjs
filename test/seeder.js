var _ = require('lodash');
var inflect = require('i')();
var request = require('supertest');
var Promise = require('bluebird');

var config = require('./config.js');
var fixtures = require('./fixtures');

/**
 * Configure seeding service.
 *
 * Sample usage:
 *
 * seed().seed('pets','people').then(function(ids){});
 * seed(harvesterInstance,'http://localhost:8001').seed('pets','people').then(function(ids){});
 *
 * @param harvesterInstance harvester instance that will be used to access database
 * @param baseUrl optional harvester's base url to post fixtures to
 * @returns {{dropCollectionsAndSeed: Function}} configured seeding service
 */
module.exports = function (harvesterInstance, baseUrl) {

    baseUrl = baseUrl || 'http://localhost:' + config.harvester.port;

    function postData(key, value, resolve, reject) {
        var body = {};
        body[key] = value;
        request(baseUrl).post('/' + key).send(body).expect('Content-Type', /json/).expect(201).end(function (error, response) {
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

    function cleanAndPost(collectionName, items) {
        return new Promise(function (resolve, reject) {
            var collection = harvesterInstance.adapter.db.collections[collectionName];
            if (collection) {
                collection.drop(function () {
                    postData(collectionName, items, resolve, reject);
                });
            } else {
                postData(collectionName, items, resolve, reject);
            }
        });
    }

    function dropCollectionsAndSeed() {
        var allFixtures = fixtures();
        var collectionNames = 0 === arguments.length ? _.keys(allFixtures) : arguments;
        var promises = _.map(collectionNames, function (collectionName) {
            return cleanAndPost(collectionName, allFixtures[collectionName]);
        });
        return Promise.all(promises).then(function (result) {
            var response = {};
            _.forEach(result, function (item) {
                _.extend(response, item);
            });
            return response;
        });
    }

    if (null == harvesterInstance) {
        throw new Error('Harvester instance is required param');
    }

    return {
        dropCollectionsAndSeed: dropCollectionsAndSeed
    }
}
