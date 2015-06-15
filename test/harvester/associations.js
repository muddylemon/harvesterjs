var inflect= require('i')();
var should = require('should');
var _ = require('lodash');
var RSVP = require('rsvp');
var request = require('supertest');
var Promise = RSVP.Promise;
var uuid = require('node-uuid');

module.exports = function(baseUrl,keys,ids) {

  describe('associations', function () {

    describe('many to one association', function () {
      it('should be able to associate', function () {
        return new Promise(function (resolve) {
          var payload = {};

          payload[keys.pet] = [
            {
              links: {
                owner: ids[keys.person][0]
              }
            }
          ];

          request(baseUrl)
            .put('/' + keys.pet + '/' + ids[keys.pet][0])
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, response) {
              should.not.exist(error);
              var body = JSON.parse(response.text);
              should.equal(body[keys.pet][0].links.owner, ids[keys.person][0]);
              resolve();
            });
        });
      });
      it('should be able to dissociate', function () {
        return new Promise(function (resolve) {
          request(baseUrl)
            .patch('/' + keys.pet + '/' + ids[keys.pet][0])
            .send([
              {path: '/' + keys.pet + '/0/links/owner', op: 'replace', value: null}
            ])
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, response) {
              should.not.exist(error);
              var body = JSON.parse(response.text);
              should.not.exist(body[keys.pet][0].links);
              resolve();
            });
        });
      });
    });

    describe('one to one association', function () {
      it('should be able to associate', function () {
        return new Promise(function (resolve) {
          var payload = {};

          payload[keys.person] = [
            {
              links: {
                soulmate: ids[keys.person][1]
              }
            }
          ];

          request(baseUrl)
            .put('/' + keys.person + '/' + ids[keys.person][0])
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, response) {
              should.not.exist(error);
              var body = JSON.parse(response.text);
              should.equal(body[keys.person][0].links.soulmate, ids[keys.person][1]);
              resolve();
            });
        });
      });
      it('should be able to dissociate', function () {
        return new Promise(function (resolve) {
          request(baseUrl)
            .patch('/' + keys.person + '/' + ids[keys.person][0])
            .send([
              {path: '/' + keys.person + '/0/links/soulmate', op: 'replace', value: null}
            ])
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, response) {
              should.not.exist(error);
              var body = JSON.parse(response.text);
              should.not.exist(body[keys.person][0].links);
              resolve();
            });
        });
      });
    });

    describe('many to many association', function () {
      it('should be able to associate', function () {
        return new Promise(function (resolve) {
          var payload = {};

          payload[keys.person] = [
            {
              links: {
                lovers: [ids[keys.person][1]]
              }
            }
          ];

          request(baseUrl)
            .put('/' + keys.person + '/' + ids[keys.person][0])
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, response) {
              should.not.exist(error);
              var body = JSON.parse(response.text);
              (body[keys.person][0].links.lovers).should.containEql(ids[keys.person][1]);
              resolve();
            });
        });
      });
      it('should be able to dissociate', function () {
        return new Promise(function (resolve) {
          request(baseUrl)
            .patch('/' + keys.person + '/' + ids[keys.person][0])
            .send([
              {path: '/' + keys.person + '/0/links/lovers', op: 'replace', value: []}
            ])
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (error, response) {
              should.not.exist(error);
              var body = JSON.parse(response.text);
              should.not.exist(body[keys.person][0].links);
              resolve();
            });
        });
      });
    });

    describe('UUID association', function() {
      it('shouldn\'t associate if the property value is a UUID', function (done) {
        new Promise(function (resolve) {
          var payload = {};

          payload.vehicles = [
            {
              id : uuid.v4(),
              name : uuid.v4(),
              links: {
                owners: uuid.v4()
              }
            }
          ];

          request(baseUrl)
            .post('/vehicles')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(201)
            .end(function (error, response) {
              should.not.exist(error);
              var body = JSON.parse(response.text);
              should.not.exist(body.vehicles[0].links.name);
              done();
            });
        })
      });

      it('shouldn\'t associate if the property value is a an array of UUID', function (done) {
        new Promise(function (resolve) {
          var payload = {};

          payload.vehicles = [
            {
              id : uuid.v4(),
              name : [uuid.v4(), uuid.v4()],
              links: {
                owners: uuid.v4()
              }
            }
          ];
          
          request(baseUrl)
            .post('/vehicles')
            .send(payload)
            .expect('Content-Type', /json/)
            .expect(201)
            .end(function (error, response) {
              should.not.exist(error);
              var body = JSON.parse(response.text);
              should.not.exist(body.vehicles[0].links.name);
              done();
            });
        })
      });
    })
  });
};
