
var harvesterPort = process.env.HARVESTER_PORT || 8000;


module.exports = {
    baseUrl: 'http://localhost:' + harvesterPort,
    harvester: {
        port: harvesterPort,
        options: {
            adapter: 'mongodb',
            connectionString: getMongodbUrl("testDB"),
            db: process.env.MONGODB || 'testDB',
            inflect: true,
            oplogConnectionString: getMongodbUrl("local")
        }
    }
};

function getMongodbUrl(db) {
    if (process.env.MONGODB_URL) {
        return process.env.MONGODB_URL;
    } else {
        var dockerHostUrl = process.env.DOCKER_HOST;
        if (dockerHostUrl) {
            var url = require('url');
            return "mongodb://" + url.parse(dockerHostUrl).hostname + ":27017/" + db;
        } else {
            return "mongodb://127.0.0.1:27017/" + db;
        }
    }
}
