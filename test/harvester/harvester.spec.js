'use strict';

// dependencies
var $http = require('http-as-promised');
var should = require('should');

// module under test
var Harvester = require('../../lib/harvester');


// export tests...
module.exports = function (baseUrl, keys, ids, app) {
	describe.only('Module harvester', function () {

		describe('prototype function: resource', function () {
			var app;     // test harvester app
			var name;    // resource name
			var schema   // resource schema
			var options  // resource options

			beforeEach(function () {
				// create a way to add another resource to the app
				app = new Harvester();
				name = 'methodResource';
				schema = {
					name: String
				};
				options = {} // no need for options yet...
			})

			it('should exist', function () {
				should.exist(app.resource);
			});
		    it('should add static functions via options.statics', function () {
		    	var resource;

		    	options.statics = {
		    		staticFunc: function() {
		    			return 'I \'m static';
		    		}
		    	}
		    	app.resource(name, schema, options)._resource.should.equal(name);
		    	resource = app.adapter._models[name];
		    	should.exist(resource.staticFunc);
				resource.staticFunc.should.be.a.function;
				resource.staticFunc().should.equal('I \'m static');
		    });

		    // disabled as this test is broken
		    it.skip('should add instance functions via options.methods', function (done) {
		    	options.methods = {
		    		instanceFunc: function () {
		    			return 'I\'m an instance function';
		    		}
		    	}
		    	app.resource(name, schema, options)._resource.should.equal(name);

		    	// for some reason it's not adding a new instance to the database
		    	$http.post({
		    		uri: baseUrl + '/methodResources',
		    		method: 'POST',
		    		error: false,
		    		json: {
		    			methodResources: [
		    				{
		    					name: 'testInstanceFunction'
		    				}
		    			]
		    		}
		    	})
		    	.then(function (res) {
		    		// check for a 201 here so we know it's been added.
			    	var Resource = app.adapter._models['pet'];

			    	Resource.findOne({}).exec(function (err, doc) {
			    		should.not.exist(err);
			    		should.exist(doc);
			    		should.exist(doc.instanceFunc);
			    		doc.instanceFunc.should.be.a.Function;
			    		doc.instanceFunc().should.equal('I \'m an instance function');
				    	done();
			    	});
			    })
			    .catch(function (err) {
			    	done(err);
			    });
		    });
		});
	});
};


