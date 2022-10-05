
/* import controllers */
const {
	loginController,
	tokenController
} = require('../controllers/authControllers')

/* import database functions */
const {
	dbGetPassword,
	dbCreateRefreshToken,
	dbGetRefreshToken,
	dbDeleteRefreshToken
} = require("../database/authDatabase")


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
			// if logged in, return the object which contains access token and refresh token
			if (loggedIn) {
				console.log("Logged in as: " + loggedIn.username)
				res.status(200).send(loggedIn)
			}
			else {
				res.status(403).send("Authentication failed")
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
}