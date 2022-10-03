// http://localhost:4000
require('dotenv').config()
const process = require('process')

/* run app on port 4000 */
const express = require('express')
const app = express()
const port = 4000

/* parse request body as json */
app.use(express.json())

const jwt = require('jsonwebtoken')

// TODO: we want to store refresh tokens in database.
// for now use local list of refresh tokens
var refreshTokens = []


/*
 * For getting a new token.
 */
app.post('/token', async (req, res) => {
	const refreshToken = req.body.token
	if (refreshToken == null) {
		return res.status(401).send()
	}
	// TODO: store refresh tokens in the DB encrypted
	if (!refreshTokens.includes(refreshToken)) {
		return res.status(403).send()
	}

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, account) => {
		if (err) {
			return res.status(403).send()
		}
		else {
			const accessToken = generateAccessToken({ username: account.username })
			res.json({ accessToken: accessToken })
		}
	})
})



/*
 * Handle user login.
 */
app.post('/login', async (req, res) => {

	// TODO: authenticate user by checking username and password
	 
	const username = req.body.username
	const account = { username: username }

	const accessToken = generateAccessToken(account)
	const refreshToken = jwt.sign(account, process.env.REFRESH_TOKEN_SECRET)
	res.json({ accessToken: accessToken, refreshToken: refreshToken })

	res.status(200).send()
})


/*
 * Generate access token.
 */
const generateAccessToken = (user) => {
	return jwt.sign(
		user,
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: '15s'})
}

/* listen on server */
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
