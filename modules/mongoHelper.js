const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://spacebank-mongo:27017';
var _client;
var _db;

module.exports = {
    connect: function(callback) {
        mongoClient.connect(url, function(err, client) {
            _client = client;
            _db = client.db('spacebank');
            return callback(err);
        });
    },
    close: () => {
        _client.close();
    },
    getDatabase: () => {
        return _db;
    }
};