
/* import controllers */
const {
	loginController,
	tokenController
} = require('../controllers/authControllers')

/* import database functions */
const {
	dbGetPasswordByUsername
} = require("../database/authDatabase")


module.exports = function (app) {
	/*
	 * Handle user login.
	 * 200 -> user succesfully logged in.
	 * 403 -> authentication failed. 
	 */
	app.post('/login', async (req, res) => {
		// authenticate user by checking username and password
		const loggedIn = await loginController(
			dbGetPasswordByUsername,
			req.body.username,
			req.body.password)

		// if logged in, return the object which contains access token and refresh token
		if (loggedIn) {
			res.status(200).send(loggedIn)
		}
		else {
			res.status(403).send("Authentication failed")
		}
	})

	/*
	 * User is requesting a new access token using their refresh token.
	 * 200 -> successfuly generated new access token.
	 * 403 -> could not generate new access token.
	 */
	app.post('/token', async (req, res) => {
		const token = tokenController(req.body.token)
		if (token) {
			res.status(200).send(token)
		}
		else {
			res.status(403).send("Could not generate access token. Permission denied.")
		}
	})
}