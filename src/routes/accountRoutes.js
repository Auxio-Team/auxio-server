const {
	encryptPassword,
	validateCreateAccount,
	verifyUsernamePassword,
	users
} = require('../services/accountService')

// import controllers
const {
	createAccountController,
	accountLoginController,
	getAccountsController
} = require('../controllers/accountController')

// import database functions
const {
	dbCreateAccount,
	dbGetPasswordByUsername,
	dbGetAccounts
} = require('../database/accountDatabase')


module.exports = function (app) {
	/*
	 * Create new user.
	 */
	app.post('/account', async (req, res) => {
		try {
			const newAccount = await createAccountController(
				dbCreateAccount,
				req.body.username,
				req.body.password,
				req.body.phoneNumber)

			if (newAccount == null) {
				res.status(400).send()
			}
			else {
				res.status(201).send(newAccount) 
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Use login.
	 * 200 -> Valid login.
	 * 400 -> Authentication failed.
	 * 500 -> Internal server error.
	 */
	app.post('/account/login', async (req, res) => {
		try {
			const login = await accountLoginController(
				dbGetPasswordByUsername,
				req.body.username,
				req.body.password)

			if (login == null) {
				res.status(400).send("Authentication failed")
			}
			else {
				res.status(200).send("Successful login")
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Get all accounts (used for testing).
	 */
	app.get('/accounts', async (req, res) => {
		try {
			const accounts = await getAccountsController(dbGetAccounts)
			res.status(200).send(accounts)
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})
}