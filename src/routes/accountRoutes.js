const {
	encryptPassword,
	validateCreateAccount,
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
	dbGetAccounts,
	dbUsernameExists,
	dbPhoneNumberExists
} = require('../database/accountDatabase')


module.exports = function (app) {
	/*
	 * Create new user.
	 */
	app.post('/account', async (req, res) => {
		try {
			const newAccount = await createAccountController(
				dbUsernameExists,
				dbPhoneNumberExists,
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