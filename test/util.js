module.exports = {
    generateCustomHarvesterOptions :function(dbName){
        return {
            adapter: 'mongodb',
            connectionString: "mongodb://127.0.0.1:27017/"+dbName,
            db: dbName,
            inflect: true,
            oplogConnectionString: "mongodb://127.0.0.1:27017/local?slaveOk=true"
        }
    }
};
