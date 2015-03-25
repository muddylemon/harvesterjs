var harvester = require('../lib/harvester')
  , RSVP = harvester.RSVP
  , crypto = require('crypto');

var pbkdf2 = {
  iterations: Math.pow(2, 16),
  keylen: Math.pow(2, 8)
};

/**
 * Example application that securely stores private information.
 * This example highlights a lot of custom application logic that
 * can be used for transforming resources as requests come in.
 */
var app = harvester({
  db: 'keystore'
})

/*!
 * Authentication middleware
 */
.use(authentication)

/*!
 * Define resources
 */
.resource('user', {

  name: String,
  password: String,
  salt: Buffer,
  keys: ['key'],
  tokens: ['token']

}).transform(

  // before storing in database
  function(request) {
    var user = this
      , password = user.password
      , id = user.id || request.path.split('/').pop();

    // require a password on user creation
    if(request.method.toLowerCase() == 'post') {
      if(!!password) {
        return hashPassword(user, password);
      } else {
        throw new Error('Password is required on user creation.');
      }
    }

    // update a user
    return new RSVP.Promise(function(resolve, reject) {
      checkUser(id, request).then(function(resource) {
        if(!password) return user;

        user = hashPassword(user, password);

        // clear tokens after password change
        RSVP.all((resource.links.tokens || []).map(function(id) {
            var token = app.adapter._models['token'];
            return token.findByIdAndRemove(id).exec();
        })).then(function() {
          resolve(user);
        }, reject);

      }, reject);
    });

    function hashPassword(user, password) {
      var salt = crypto.randomBytes(Math.pow(2, 4));
      user.password = crypto.pbkdf2Sync(
        password, salt, pbkdf2.iterations, pbkdf2.keylen
      );
      user.salt = salt;
      return user;
    }
  },

  // after retrieving from database
  function(request) {
    var user = this;
    delete user.password;
    delete user.salt;
    return new RSVP.Promise(function(resolve) {
      checkUser(user.id, request).then(function() {
        resolve(user);
      }, function() {
        delete user.links;
        resolve(user);
      });
    });
  }

)

.resource('token', {

  owner: 'user',
  value: String

}).transform(checkOwner, checkOwner).noIndex()

.resource('key', {

  name: String,
  privateKey: String,
  publicKey: String,
  owner: 'user'

}).transform(checkOwner, checkOwner).noIndex()

/*!
 * Start the API
 */
.listen(process.argv[2] || 1337);

/**
 * Custom authentication route. The request must have the header
 * `Content-Type: application/json`, and the request body must be
 * a JSON object that contain two fields: `name` and `password`.
 * It returns a token as the response body which should be
 * used as the `Authorization` header for subsequent requests.
 */
function authentication(req, res, next) {
  if(!req.path.match(/authenticate/i)) return next();
  if(req.header('content-type') != 'application/json') {
    return res.send(412);
  }
  var name, password;
  try {
    name = req.body.name;
    password = req.body.password;
  } catch(error) {
    res.send(400);
  }

  var user = app.adapter._models['user'];
  return user.findOne({name: name}).exec().then(function(user) {
    var derivedKey = crypto.pbkdf2Sync(
      password, user.salt.buffer, pbkdf2.iterations, pbkdf2.keylen
    );
    if(derivedKey != user.password) return res.send(401);
    var token = {
      value: crypto.randomBytes(Math.pow(2, 6)).toString('base64'),
      links: {
        owner: user.id
      }
    };
    var Token = app.adapter._models['token'];
    return Token.create(token);
  }, function() {
    res.send(403);
  })

  .then(function(token) {
    res.send(200, token.value);
  }, function() {
    res.send(500);
  });
}

/**
 * Check if it's allowed to read/write based on the "owner" value.
 */
function checkOwner(request) {
  var resource = this;
  return new RSVP.Promise(function(resolve, reject) {
    checkUser(resource.links.owner, request).then(function() {
      resolve(resource);
    }, reject);
  });
}

/**
 * Check if a user is authorized.
 */
function checkUser(id, request) {
  return new RSVP.Promise(function(resolve, reject) {
    var user, authorization = request.get('Authorization');
    if(!authorization) return reject();

    var user = app.adapter._models['user'];
    return user.findById(id).exec().then(function(resource) {
      user = resource;
      var Token = app.adapter._models.token;
      return Token.find({_id: {$in: resource.links.tokens}}).exec();
    }, reject)

    .then(function(tokens) {
      var tokenFound = false;
      tokens.forEach(function(token) {
        if(token.value == authorization) {
          tokenFound = true;
          resolve(user);
        }
      });
      if(!tokenFound) reject();
    }, reject);

  });
}
