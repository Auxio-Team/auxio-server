// import controllers
const {
	createAccountController,
	getAccountsController,
	getAccountController,
	getHistoryController,
	getAccountByUsernameController,
	updatePreferredPlatformController,
	updateUsernameController,
	updateProfilePictureController,
	logoutController,
	updateStatusAndSessionCodeController,
} = require('../controllers/accountController')

// import account database functions
const {
	dbCreateAccount,
	dbGetAccounts,
	dbUpdatePreferredPlatform,
	dbUpdateUsername,
	dbGetAccount,
	dbGetAccountByUsername,
	dbUpdateStatusAndSessionCode,
	dbUpdateProfilePicture,
	dbDeleteRefreshToken
} = require('../database/accountDatabase')

const {
	dbGetFriendshipStatus
} = require('../database/friendDatabase')

const {
	dbGetSessionHistory
} = require('../database/historyDatabase')

const {
	USERNAME_TAKEN,
	PHONE_NUMBER_TAKEN
} = require('../models/accountModels')

module.exports = function (app, upload) {
	/*
	 * Create new user.
	 */
	app.post('/account', async (req, res) => {
		try {
			const newAccount = await createAccountController(
				dbCreateAccount,
				req.body.username,
				req.body.password,
				req.body.phoneNumber
			)

			if (newAccount == USERNAME_TAKEN) {
				res.status(403).send({ 'message': 'Invalid Username' })
			}
			else if (newAccount == PHONE_NUMBER_TAKEN) {
				res.status(403).send({ 'message': 'Invalid Phone Number' })
			}
			else if (newAccount) { 
				res.status(201).send(newAccount)
			}
			else { 
				res.status(400).send({ 'message': 'Unable to Create Acccount' })
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Get all accounts (used for testing).
	 * TODO: this should only be used in dev mode
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
	app.get('/myaccount', async (req, res) => {
		try {
			const account = await getAccountController(dbGetAccount, req.account.accountId)
			if (account) {
				res.status(200).send(account)
			}
			else {
				res.status(404).send({"message": "Couldn't find account"})
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Get account info for account specified in the body
	 */
	app.get('/accounts/:accountId', async (req, res) => {
		try {
			const account = await getAccountController(
				dbGetAccount, 
				req.params.accountId
			)
			if (account) {
				res.status(200).send(account)
			}
			else {
				res.status(404).send({"message": "Couldn't find account"})
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Get account by username
	 */
	app.get('/accountbyusername/:username', async (req, res) => {
		try {
			const account = await getAccountByUsernameController(
				dbGetAccountByUsername, 
				dbGetFriendshipStatus, 
				req.account.accountId, 
				req.params.username
			)
			if (account) {
				console.log(`Successfully found account for username=${req.params.username}`)
				res.status(200).send(account)
			}
			else {
				res.status(404).send({"message": "Couldn't find account"})
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Get session history for account that is making this request
	 */
	app.get('/history', async (req, res) => {
		try {
			const history = await getHistoryController(
				dbGetSessionHistory, 
				dbGetAccount,
				req.account.accountId
			)
			if (history) {
				res.status(200).send(history)
			}
			else {
				res.status(404).send({"message": "Couldn't find history"})
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
				dbUpdatePreferredPlatform, 
				req.account.accountId, 
				req.body.preferredPlatform
			)
			if (updated) {
				res.status(204).send()
			}
			else {
				res.status(400).send({"message": "Could not update preferred platform"})
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
				dbUpdateUsername, 
				req.account.accountId, 
				req.body.username
			)
			if (updated == USERNAME_TAKEN) {
				res.status(403).send({ 'message': "Username is already taken" })
			}
			else if (updated) {
				res.status(204).send()
			}
			else {
				res.status(400).send({ 'message': "Could not update username" })
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Update the profile pic of a user with new value
	 */
	app.put('/profilepic', upload.single('profilePicture'), async (req, res) => {
		try {
			const updated = await updateProfilePictureController(
				dbUpdateProfilePicture, 
				req.account.accountId, 
				req.file.path
			)
			if (updated) {
				res.status(204).send()
			}
			else {
				res.status(400).send({ 'message': "Could not update profile picture" })
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Get my profile pic
	 */
	app.get('/profilepic', async (req, res) => {
		try {
			const account = await getAccountController(
				dbGetAccount, 
				req.account.accountId
			)
			if (account.profile_pic_path) {
				res.status(200).sendFile(account.profile_pic_path, { root : `${__dirname}/../..` }, function (err) {
					if (err) {
						res.status(404).send({'message': "Could not find picture"});
					} else {
						console.log('Profile picture sent successfully');
					}
				});
			} else {
				res.status(204).send();
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Get the profile pic of a user
	 */
	app.get('/profilepics/:accountId', async (req, res) => {
		try {
			const account = await getAccountController(
				dbGetAccount, 
				req.params.accountId
			)
			if (account.profile_pic_path) {
				res.status(200).sendFile(account.profile_pic_path, { root : `${__dirname}/../..` }, function (err) {
					if (err) {
						res.status(404).send({'message': "Could not find picture"});
					} else {
						console.log('Profile picture sent successfully');
					}
				});
			} else {
				res.status(204).send();
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
			const deleted = await logoutController(dbDeleteRefreshToken, req.account.accountId)
			if (deleted > 0) {
				console.log("Logged out user: " + req.account.accountId)
				res.status(204).send()
			}
			else if (deleted == 0) {
				// tried to logout, but no rows were deleted
				res.status(404).send({'message': 'Refresh token not found'})
			}
			else {
				res.status(400).send({'message': 'Unable to logout'})
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})

	/*
	 * Update the status of the user.
	 */
	app.put('/status', async (req, res) => {
		try {
			const updated = await updateStatusAndSessionCodeController(
				dbUpdateStatusAndSessionCode,
				req.account.accountId, 
				req.body.status, 
				req.body.sessionCode
			)
			
			if (updated > 0) {
				console.log("Updated status and session code")
				res.status(204).send()
			}
			else {
				res.status(400).send({'message': 'Unable to update status'})
			}
		}
		catch (err) {
			console.log(err)
			res.status(500).send("Internal Server Error")
		}
	})
}