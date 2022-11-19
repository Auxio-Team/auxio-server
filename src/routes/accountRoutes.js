const {
	encryptPassword,
	validateCreateAccount,
} = require('../services/accountService')

// import controllers
const {
	createAccountController,
	getAccountsController,
	getAccountController,
	updatePreferredPlatformController,
	updateUsernameController,
	logoutController,
} = require('../controllers/accountController')

// import account database functions
const {
	dbCreateAccount,
	dbGetAccounts,
	dbUsernameExists,
	dbPhoneNumberExists,
	dbUpdatePreferredPlatform,
	dbUpdateUsername,
	dbGetAccount
} = require('../database/accountDatabase')

const { USERNAME_TAKEN } = require('../models/accountModels')

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
				res.status(400).send({ 'message': 'Invalid Username' })
			}
			else if (newAccount == -2) {
				res.status(400).send({ 'message': 'Invalid Phone Number' })
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
	 * TODO: make sure that the response from getAccountsController contains the id of the user.
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
			const account = await getAccountController(dbGetAccount, req.account.accountId)
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
				dbUpdatePreferredPlatform, req.account.accountId, req.body.preferredPlatform)
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
	 * Update the username of a user with new value.
	 */
	app.put('/username', async (req, res) => {
		try {
			const updated = await updateUsernameController(
				dbUpdateUsername, req.account.accountId, req.body.username)
			if (updated == USERNAME_TAKEN) {
				res.status(400).send({ message: "Username is already taken" })
			}
			else if (updated) {
				res.status(200).send()
			}
			else {
				res.status(400).send({ message: "Could not update username" })
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Log the user out by deleting the refresh token
	 */
	app.post('/logout', async (req, res) => {
		try {
			const deleted = await logoutController(dbDeleteRefreshToken, req.account.username)
			if (deleted > 0) {
				console.log("Logged out user: " + req.account.username)
				res.status(200).send()
			}
			else if (deleted == 0) {
				// tried to logout, but no rows were deleted
				res.status(404).send()
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