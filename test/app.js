var harvester = require('../lib/harvester');
var JSONAPI_Error = harvester.JSONAPI_Error;
var Promise = require('bluebird');
var config = require('./config.js');

function configureApp(app) {
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
          return new Promise(function (resolve, reject) {
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

  return app;
}

/**
 * Creates instance of harvester app with default routes.
 *
 * This function can be safely passed to before or beforeEach as it will attempt install app and config into mocha's context
 *
 * beforeEach(require('./app.js'));
 *
 * @returns {*} promise resolving to harvester app instance
 */
module.exports = function () {
  var app = harvester(config.harvester.options);
  configureApp(app);
  app.listen(config.harvester.port);
  this.app = app;
  this.config = config;
  return app;
};
