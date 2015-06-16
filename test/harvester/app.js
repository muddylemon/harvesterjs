var harvester = require('../../lib/harvester');
var JSONAPI_Error = harvester.JSONAPI_Error;
var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var config = require('../config.js');

function configureDefaultApp(app) {
  app.resource('person', {
    name: String,
    appearances: Number,
    pets: ['pet'],
    soulmate: {ref: 'person', inverse: 'soulmate'},
    lovers: [
      {ref: 'person', inverse: 'lovers'}
    ]
  })

      .resource('vehicle', {
        name: String,
        owners: [
          {ref: 'person', inverse: 'owners'}
        ]
      })

      .resource('pet', {
        name: String,
        appearances: Number,
        owner: 'person'
      })

      .resource('cat', {
        name: String
      }, {namespace: 'animals'})

      .resource('foobar', {
        foo: String
      })

      .before(function (req, res) {
        var foobar = this;

        if (foobar.foo && foobar.foo === 'bar') {
          // promise
          return new RSVP.Promise(function (resolve, reject) {
            reject(new JSONAPI_Error({
              status: 400,
              detail: 'Foo was bar'
            }));
          });
        } else if (foobar.foo && foobar.foo === 'baz') {
          // non-promise
          throw new JSONAPI_Error({
            status: 400,
            detail: 'Foo was baz'
          });
        } else {
          return foobar;
        }
      });


  app.router.get('/random-error', function (req, res, next) {
    next(new Error('this is an error'));
  });

  app.router.get('/json-errors-error', function (req, res, next) {
    next(new JSONAPI_Error({status: 400, detail: 'Bar was not foo'}));
  });

  app.listen(config.harvester.port);

  return app;
}

function create(configurator, options) {
  options = options || config.harvester.options;
  var app = harvester(options);
  configurator(app);
  return new Promise(function (resolve, reject) {
    var awaitConnection = app.adapter.awaitConnection();
    awaitConnection.then(resolve);
    awaitConnection.catch(reject);
  }).then(function () {
        console.log("--------------------");
        console.log("Running tests:");
        return app;
      })
}

module.exports = {
  create: create,
  createDefault: function () {
    var that = this;
    return create(configureDefaultApp).then(function (app) {
      that.app = app;
      that.config = config;
      return app;
    });
  }
};
