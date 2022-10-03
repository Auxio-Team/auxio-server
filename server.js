// http://localhost:3000
require('dotenv').config()
const process = require('process')

const { accountDB } = require('./src/database/accountDatabase')
const { createMusixDatabase } = require('./src/database/createDatabase')

/* run app on port 3000 */
const express = require('express')
const { JsonWebTokenError } = require('jsonwebtoken')
const app = express()
const port = 3000

/* middleware handlers */
app.use(express.json())

/* import routes */
require('./src/routes/accountRoutes')(app)


// FIXME: test creating a new postgres database and connecting to it.
app.get('/', async (req, res) => {
	createMusixDatabase()
	//accountDB()
})

// TODO: setup AWS connection to use non-local database.
var environment = getEnvironment()
console.log("environment: " + environment)

/* listen on server */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

/* determines the environment to run the server on (which database to use) */
function getEnvironment() {
	if (process.argv.length > 3) {
		console.log("Invalid number of arguments. Expected form: \"node server <environment>\"")
		return -1
	}
	else if (process.argv.length == 3 && process.argv[2] == 'dev') {
		return 'dev'	
	}
	else {
		return 'local'
	}
}

/*
 * Middleware function that authenticates a request.
 */
const authenticateToken = (req, res, next) => {
	// 'authorization': 'Bearer TOKEN'
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	// check if there is a token
	if (token == null) {
		return res.status(401).send()
	}

	// verify the token is valid
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, account) => {
		if (err) {
			return res.status(403).send()
		}
		req.account = account
		next()
	})
}
