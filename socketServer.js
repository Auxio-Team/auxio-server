// http://localhost:5000
const { redisGetSessionQueue } = require('./src/redis/queueRedis.js');
const fs = require('fs')
const crypto = require('crypto')
const { redisClient } = require('./src/redis/initRedis');
if (!fs.existsSync('./.env')) {
	const accessTokenSecret = crypto.randomBytes(64).toString('hex')
	const refreshTokenSecret = crypto.randomBytes(64).toString('hex')
	const codeTokenSecret = crypto.randomBytes(64).toString('hex')
	const passwordTokenSecret = crypto.randomBytes(64).toString('hex')
	const twilioAccountSid = "ACd8f103d7ea7aaa411ac76e7929c4836c";
	const twilioAuthToken = "f29bf59961befe551857738091b4d7fe";
	const envContent = "ACCESS_TOKEN_SECRET=" + accessTokenSecret
		+ "\nREFRESH_TOKEN_SECRET=" + refreshTokenSecret
		+ "\nCODE_TOKEN_SECRET=" + codeTokenSecret 
		+ "\nPASSWORD_TOKEN_SECRET=" + passwordTokenSecret
		+ "\nTWILIO_ACCOUNT_SID=" + twilioAccountSid
		+ "\nTWILIO_AUTH_TOKEN=" + twilioAuthToken
	console.log(envContent)
	fs.writeFileSync('.env', envContent)
}

require('dotenv').config()
//const process = require('process')

/* run app on port 5000 */
const express = require('express')
const app = express()
const port = 5000
const cors = require('cors');

/* middleware handlers */
app.use(express.json())
app.use(cors({
	origin: 'http://localhost:5000',
    allowedHeaders: ['musix'],
    credentials: true,
}))

/* socket server */
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server)

/* listen on port */
io.listen(port, () => {
    console.log(`Socket server listening on port ${port}`)
})

//redis subscription
const adapter = require('socket.io-redis');
//io.adapter(adapter({subClient: redisClient}))

// Listen for incoming WebSocket connections from clients
io.on('connect', (socket) => {
    socket.emit('message', 'Client sucessfully connected to serer');
    console.log("A client has connected");

    (async () => {
        const subClient = redisClient.duplicate();
      
        await subClient.connect();
      
        await subClient.subscribe('sessions', (sessionId) => {
          console.log(`A session has been joined: ${sessionId}`); // 'message'
          socket.emit('session', sessionId)
        });
      
      })();
  })
