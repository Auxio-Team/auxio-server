// http://localhost:3000
const fs = require('fs')
if (!fs.existsSync('./.env')) {
	const accessTokenSecret = crypto.randomBytes(64).toString('hex')
	const refreshTokenSecret = crypto.randomBytes(64).toString('hex')
	const envContent = "ACCESS_TOKEN_SECRET=" + accessTokenSecret
											+ "\nREFRESH_TOKEN_SECRET=" + refreshTokenSecret
	console.log(envContent)
	fs.writeFileSync('.env', envContent)
}

require('dotenv').config()
const process = require('process')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')


const { accountDB } = require('./src/database/accountDatabase')
const { createMusixDatabase } = require('./src/database/createDatabase')

/* run app on port 3000 */
const express = require('express')
const app = express()
const port = 3000

/* middleware handlers */
app.use(express.json())


/*
 * Test creating a new postgres database and connecting to it.
 * Create .env file with new Token Secrets
 */
app.get('/', async (req, res) => {
	try {
		await createMusixDatabase()
		res.status(200).send()
	}
	catch (err) {
		console.log(err)
		res.status(500).send("Internal Server Error")
	}
})

/*
 * Middleware function that authenticates a request.
 * 1. get the token they send us (it will come from the header).
 * 2. verify that this is the correct user.
 * 3. return that user
 */
app.use((req, res, next) => {
	// guest user bypass authorization
	if (req.path.split('/')[1] == 'guest' || req.path.split('/')[1] == 'account') {
		return next();
	}

	// 'authorization': 'Bearer TOKEN'
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	// check if there is a token
	if (token == null) {
		console.log("Unauthorized")
		return res.status(401).send()
	}

	// verify the token is valid
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, account) => {
		if (err) {
			console.log("Forbidden")
			return res.status(403).send()
		}
		req.account = account
		next()
	})
})

/* import routes */
require('./src/routes/accountRoutes')(app)
require('./src/routes/guestRoutes')(app)
require('./src/routes/sessionRoutes')(app)

/* listen on server */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
