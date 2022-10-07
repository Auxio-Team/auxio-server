const {
	encryptPassword,
	validateCreateAccount,
} = require('../services/accountService')

// import controllers
const {
	createAccountController,
	accountLoginController,
	getAccountsController,
	getAccountController,
	updatePreferredPlatformController,
	updateDarkModeController
} = require('../controllers/accountController')

// import database functions
const {
	dbCreateAccount,
	dbGetPasswordByUsername,
	dbGetAccounts,
	dbUsernameExists,
	dbPhoneNumberExists,
	dbUpdatePreferredPlatform,
	dbUpdateDarkMode,
	dbGetAccount
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

			if (newAccount == -1) {
				res.status(400).send("Invalid Username")
			}
			else if (newAccount == -2) {
				res.status(400).send("Invalid Phone Number")
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

	/*
	 * Get account info for account that is making this request
	 */
	app.get('/account', async (req, res) => {
		try {
			const account = await getAccountController(dbGetAccount, req.account.username)
			if (account) {
				res.status(200).send(account)
			}
			else {
				res.status(400).send("Couldn't find account")
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Update the preferred streaming platform of a user with new value
	 */
	app.put('/platform', async (req, res) => {
		try {
			const updated = await updatePreferredPlatformController(
				dbUpdatePreferredPlatform, req.account.username, req.body.preferredPlatform)
			if (updated) {
				res.status(200).send()
			}
			else {
				res.status(400).send()
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Update the dark mode of a user with new value.
	 */
	app.put('/darkmode', async (req, res) => {
		try {
			const updated = await updateDarkModeController(
				dbUpdateDarkMode, req.account.username, req.body.darkMode)
			if (updated) {
				res.status(200).send()
			}
			else {
				res.status(400).send()
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})
}