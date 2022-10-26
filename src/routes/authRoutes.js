const jwt = require('jsonwebtoken')

/* import controllers */
const {
	loginController,
	tokenController,
	initResetPasswordController,
	resetPasswordController,
	verifyCodeController,
	updateUsernameController
} = require('../controllers/authController')

/* import database functions */
const {
	dbGetPassword,
	dbCreateRefreshToken,
	dbGetRefreshToken,
	dbDeleteRefreshToken,
	dbUpdateUsername
} = require("../database/authDatabase")

const { 
	dbPhoneNumberExistsForUser,
	dbUsernameExists,
	dbResetPassword
} = require('../database/accountDatabase')

module.exports = function (app) {
	/*
	 * Handle user login.
	 * 200 -> user succesfully logged in.
	 * 403 -> authentication failed. 
	 */
	app.post('/login', async (req, res) => {
		// authenticate user by checking username and password
		try {
			const loggedIn = await loginController(
				dbGetPassword,
				dbCreateRefreshToken,
				dbDeleteRefreshToken,
				req.body.username,
				req.body.password)

			if (loggedIn) {
				console.log("Logged in as: " + req.body.username)
				res.status(200).send(loggedIn)
			}
			else {
				res.status(401).send("Authentication failed")
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}

	})

	/*
	 * User is requesting a new access token using their refresh token.
	 * 200 -> successfuly generated new access token.
	 * 403 -> could not generate new access token.
	 */
	app.post('/token', async (req, res) => {
		const authHeader = req.headers['authorization']
		const refreshToken = authHeader && authHeader.split(' ')[1] // get the token portion of 'Bearer TOKEN'
		try {
			const accessToken = await tokenController(
				dbGetRefreshToken,
				refreshToken)

			if (accessToken) {
				res.status(200).send({ accessToken: accessToken })
			}
			else {
				res.status(403).send("Could not generate access token. Permission denied.")
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Start reseting password by entering username and phone number.
	 */
	app.post('/reset', async (req, res) => {
		try {
			const resetAccount = await initResetPasswordController(
				dbUsernameExists,
				dbPhoneNumberExistsForUser,
				req.body.username,
				req.body.phoneNumber)

			if (resetAccount == null) {
				res.status(400).send()
			}
			else {
				res.status(201).send(resetAccount) 
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Verify code that user entered.
	 */
	app.post('/reset/verify', async (req, res) => {
		try {
			if (!req.headers['authorization'] || !req.headers['authorization'].split(' ')) {
				res.status(401).send()
				return
			}
			const verifiedCode = await verifyCodeController(
				req.headers['authorization'].split(' ')[1],
				req.body.code
			)

			if (verifiedCode == null) {
				res.status(400).send()
			}
			else {
				res.status(201).send(verifiedCode)
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Reset the password.
	 */
	app.put('/reset/password', async (req, res) => {
		try {
			if (!req.headers['authorization'] || !req.headers['authorization'].split(' ')) {
				res.status(401).send()
				return
			}
			const passReset = await resetPasswordController(
				dbResetPassword,
				req.headers['authorization'].split(' ')[1],
				req.body.password
			)

			if (!passReset) {
				res.status(400).send()
			}
			else {
				res.status(201).send()
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Update the username of a user with new value.
	 */
	app.put('/username', async (req, res) => {
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
		})

		try {
			const tokens = await updateUsernameController(
				dbUpdateUsername, dbUsernameExists, dbCreateRefreshToken, dbDeleteRefreshToken, req.account.username, req.body.username)
			if (tokens == -1) {
				res.status(400).send({ message: "Username is already taken" })
			}
			else if (tokens == -2) {
				res.status(400).send({ message: "Could not update username" })
			}
			else {
				res.status(200).send(tokens)
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})
}