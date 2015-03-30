var mongoose = require('mongoose');
var RSVP = require('rsvp');
var _ = require('lodash');

var Promise = RSVP.Promise;

function Adapter() {
    var adapter = {};
    adapter._init = function (options) {
        var connectionString = options.connectionString || '';

        if (!connectionString.length) {
            connectionString = 'mongodb://' +
            (options.username ? options.username + ':' + options.password + '@' : '') +
            options.host + (options.port ? ':' + options.port : '') + '/' + options.db;
        }

        //Setup mongoose instance
        this.db = mongoose.createConnection(connectionString, options.flags);
    };

    /**
     * Store models in an object here.
     *
     * @api private
     */
    adapter._models = {};

    adapter.schema = function (name, schema, options) {
        var ObjectId = mongoose.Schema.Types.ObjectId;
        var Mixed = mongoose.Schema.Types.Mixed;
        schema.links = schema.links || {};

        _.each(schema, function (val, key) {
            var obj = {};
            var isArray = _.isArray(val);
            var value = isArray ? val[0] : val;
            var isObject = _.isPlainObject(value);
            var ref = isObject ? value.ref : value;
            var inverse = isObject ? value.inverse : undefined;

            // Convert strings to associations
            if (typeof ref == 'string') {
                obj.ref = ref;
                obj.inverse = inverse;
                obj.type = ObjectId;
                schema.links[key] = isArray ? [obj] : obj;
                delete schema[key];
            }

            // Convert native object to schema type Mixed
            if (typeof value == 'function' && typeCheck(value) == 'object') {
                if (isObject) {
                    schema[key].type = Mixed;
                } else {
                    schema[key] = Mixed;
                }
            }
        });

        return mongoose.Schema(schema, options);

        function typeCheck(fn) {
            return Object.prototype.toString.call(new fn(''))
                .slice(1, -1).split(' ')[1].toLowerCase();
        }
    };

    adapter.model = function (name, schema) {
        if (schema) {
            var model = this.db.model.apply(this.db, arguments);
            this._models[name] = model;
            return model;
        } else {
            return this._models[name];
        }
    };

    // expose mongoose
    adapter.mongoose = mongoose;
    return adapter;
}
module.exports = Adapter;
