module.exports = {
    generateCustomHarvesterOptions :function(dbName){
        return {
            adapter: 'mongodb',
            connectionString: "mongodb://192.168.59.103:27017/"+dbName,
            db: dbName,
            inflect: true,
            oplogConnectionString: "mongodb://192.168.59.103:27017/local"
        }
    }
};
