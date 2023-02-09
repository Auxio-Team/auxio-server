const redis = require("redis");

let redisClient = redis.createClient({
    legacyMode: false,
    socket: {
        port: 36379,
        host: "redis-server"
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.connect()
    .then(() => console.log('Successfully connected to Redis server'))
    .catch((err) => console.log('Error when trying to connect to Redis server\n' + err));

module.exports = { redisClient }