var inflect = require('i')();
var $http = require('http-as-promised');
var should = require('should');
var _ = require('lodash');
var Promise = require("bluebird");
var request = require('supertest');
var harvester = require('../../lib/harvester');

describe('remote link', function () {

    describe('given 2 resources : \'posts\', \'people\' ; defined on distinct harvesterjs servers ' +
        'and posts has a remote link \'author\' defined to people', function () {

        var app1BaseUrl = 'http://localhost:8003';
        var app2BaseUrl = 'http://localhost:8004';

        before(function () {

            var that = this;
            that.timeout(100000);

            // todo we need a better strategy to stand up test harvesterjs instances
            // listening on hard coded free ports and duplicating harvesterjs options is not very robust and DRY
            var options = {
                adapter: 'mongodb',
                connectionString: process.env.MONGODB_URL || process.argv[2] || "mongodb://127.0.0.1:27017/testDB",
                db: 'testDB',
                inflect: true,
                oplogConnectionString : (process.env.OPLOG_MONGODB_URL || process.argv[3] || "mongodb://127.0.0.1:27017/local") + '?slaveOk=true'
            };

            that.harvesterApp1 =
                harvester(options)
                    .resource('post', {
                        title: String,
                        author: {ref: 'person', baseUri: 'http://localhost:8004'}

                    })
                    .listen(8003);

            that.harvesterApp2 =
                harvester(options)
                    .resource('person', {
                        firstName: String,
                        lastName: String,
                        country: 'country'
                    })
                    .resource('country', {
                        code: String
                    })
                    .listen(8004);

            // todo move into utility class or upgrade to latest version of mongoose which returns a promise
            function removeCollection(model) {
                return new Promise(function (resolve, reject) {
                    model.collection.remove(function (err, result) {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            }

            return removeCollection(that.harvesterApp1.adapter.model('post'))
                .then(function () {
                    return removeCollection(that.harvesterApp2.adapter.model('person'))
                })
                .then(function () {
                    // todo come up with a consistent pattern for seeding
                    // as far as I can see we are mixing supertest, chai http and http-as-promised
                    return $http({
                        uri: app2BaseUrl + '/countries', method: 'POST', json: {
                            countries: [
                                {
                                    code: 'US'
                                }
                            ]
                        }
                    })
                })
                .spread(function (res, body) {
                    that.countryId = body.countries[0].id;
                    return $http({
                        uri: app2BaseUrl + '/people', method: 'POST', json: {
                            people: [
                                {
                                    firstName: 'Tony',
                                    lastName: 'Maley',
                                    links: {
                                        country: that.countryId
                                    }
                                }
                            ]
                        }
                    })
                })
                .spread(function (res, body) {
                    that.authorId = body.people[0].id;
                    return $http({
                        uri: app1BaseUrl + '/posts', method: 'POST', json: {
                            posts: [
                                {
                                    title: 'Nodejs rules !',
                                    links: {
                                        author: that.authorId
                                    }
                                }
                            ]
                        }
                    });
                });
        });

        describe('fetch posts and include author', function () {
            it('should respond with a compound document with people included', function (done) {
                var that = this;
                // todo come up with a consistent pattern for assertions
                request(app1BaseUrl)
                    .get('/posts?include=author')
                    .expect(200)
                    .end(function (error, response) {
                        var body = response.body;

                        body.posts.should.be.an.Array;

                        var linkedPeople = (body.linked.people);
                        (linkedPeople.length).should.be.exactly(1);
                        linkedPeople[0].id.should.be.exactly(that.authorId);

                        done();
                    });
            });
        });

        describe.skip('fetch posts, include author and author.country', function () {
            it('should respond with a compound document with countries included', function (done) {
                var that = this;
                // todo come up with a consistent pattern for assertions
                request(app1BaseUrl)
                    .get('/posts?include=author,author.country')
                    .expect(200)
                    .end(function (error, response) {
                        var body = response.body;

                        body.posts.should.be.an.Array;

                        var linkedCountries = (body.linked.countries);
                        (linkedCountries.length).should.be.exactly(1);
                        linkedCountries[0].id.should.be.exactly(that.countryId);

                        done();
                    });
            });
        });
    });


});
