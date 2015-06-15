var should = require('should');
var _ = require('lodash');
var $http = require('http-as-promised');

module.exports = function(baseUrl,keys,ids) {

    describe('Auth', function () {

        describe('Auth', function () {
            it('It should run the authentication function passed by default', function () {
                var isRun = false;

                return $http(baseUrl + '/plants')
                    .catch(function(res) {
                       should.equal(res.statusCode, 401);
                    })
            });

        });

    })
};
