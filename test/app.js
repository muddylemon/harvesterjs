var harvester = require('../lib/harvester');
var JSONAPI_Error = harvester.JSONAPI_Error;
var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var config = require('./config.js');

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

/**
 * Creates bare instance of harvester app.
 *
 * It is the responsibility of configurator to initiate listening on specific port.
 *
 * @param configurator function that is given app instance param and should configure resources, etc.
 * @param options harvester init options
 * @returns {*} promise resolving to harvester app instance
 */
function create(configurator, options) {
  options = options || config.harvester.options;
  var app = harvester(options);
  configurator(app);
  /**
   * Return promise instead of app in case in future we need to do any synchronizations or other async stuff before passing the app.
   * This would be also very good for Mocha's beforeEach expectation of promise.
   */
  return new Promise(function (resolve) {
    resolve(app);
  }).then(function () {
        console.log("--------------------");
        console.log("Running tests:");
        return app;
      });
}

module.exports = {
  create: create,
  /**
   * Creates instance of harvester app with default routes.
   *
   * This function can be safely passed to before or beforeEach as it will attempt install app and config into mocha's context
   *
   * @returns {*} promise resolving to harvester app instance
   */
  createDefault: function () {
    var that = this;
    return create(configureDefaultApp).then(function (app) {
      that.app = app;
      that.config = config;
      return app;
    });
  }
};
