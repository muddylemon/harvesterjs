var should = require('should');
var _ = require('lodash');
var $http = require('http-as-promised');

module.exports = function(baseUrl,keys,ids) {

    describe.only('Auth', function () {

        describe('Auth', function () {
            it('It should run the authentication function passed by default', function () {
                var isRun = false;
                this.app.setAuthorizationHandler(function(req, permission) {
                    isRun = true;
                    return true;
                });

                return $http(baseUrl + '/' + keys.pet)
                    .then(function() {
                       should.equal(isRun, true);
                    });
            });

        });

    })
};
