const {
	encryptPassword,
	validateCreateAccount,
	verifyUsernamePassword,
	users
} = require('../service/accountService')

const { createAccountInterface } = require('../interface/accountInterface')

module.exports = function (app) {
	/*
	 * Create user.
	 */
	app.post('/account', async (req, res) => {
		try {
			if (await createAccountInterface(req.body.username, req.body.password)) {
				res.status(201).send() 
			}
			else {
				res.status(400).send()
			}
		}
		catch (e) {
			res.status(500).send()
		}
	})

	/*
	 * Authenticate a user logging into an account.
	 * 200 -> Valid login.
	 * 400 -> Authentication failed.
	 * 500 -> Internal server error.
	 */
	app.post('/account/login', async (req, res) => {
		try {
			if (await verifyUsernamePassword(req.body.username, req.body.password)) {
				res.status(200).send()
			}
			else {
				res.status(400).send("Authorization failed")
			}
		}
		catch {
			res.status(500).send()
		}
	})

	/*
	 * Get all accounts (used for testing).
	 */
	app.get('/accounts', async (req, res) => {
		res.json(users)
	})
}