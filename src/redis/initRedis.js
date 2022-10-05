const { createClient } = require('redis');

const redisClient = createClient({
    url: 'redis://localhost:36379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.connect()
    .then(() => console.log('Successfully connected to Redis server'))
    .catch((err) => console.log('Error when trying to connect to Redis server\n' + err));

module.exports = { redisClient }