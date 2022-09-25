const {
	encryptPassword,
	validateCreateAccount,
	verifyUsernamePassword,
	users
} = require('../service/accountService')

module.exports = function (app) {
	/*
	 * Create a user with username password.
	 */
	app.post('/account', async (req, res) => {
		// validate username and password
		const username = req.body.username
		const password = req.body.password
		if (await validateCreateAccount(username, password) == false) {
			res.status(400).send()
		}
		// encrypt the password
		const hashedPassword = await encryptPassword(password)
		console.log("Hashed Password: " + hashedPassword)
		// TODO: save the account to DB (save to "users" for now)
		const account = { username: username, password: hashedPassword }
		users.push(account)

		res.status(201).send() // 201 -> create request succeeded.
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