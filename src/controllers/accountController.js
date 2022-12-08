const {
	validateCreateAccount,
	encryptPassword
} = require('../services/accountService')

/*
 * Create a new account and save it in the database.
 */
const createAccountController = async (dbCreateAccount, username, password, phoneNumber) => {
	// do password strength checking...

	// encrypt the password
	const encryptedPassword = await encryptPassword(password)

	// save the account to database
	const newAccount = { username: username, password: encryptedPassword, phoneNumber: phoneNumber }
	console.log("Saving new account to database with username=" + newAccount.username)
	return await dbCreateAccount(newAccount)
}

/*
 * Get all accounts in the database.
 * @return -> the list of account object, an empty list if none were found.
 */
const getAccountsController = async (dbGetAccounts) => {
	const accounts = await dbGetAccounts()
	if (accounts == null) {
		return []
	}
	else {
		return accounts
	}
}

/*
 * Get account info for user with username=username.
 * @return -> the account data in a json.
 */
const getAccountController = async (dbGetAccount, accountId) => {
	return await dbGetAccount(accountId)
}

/*
 * Get account info for user with username=username.
 * @return -> the account data in a json.
 */
const getHistoryController = async (dbGetSessionHistory, accountId) => {
	return await dbGetSessionHistory(accountId)
}

const getAccountByUsernameController = async (dbGetAccountByUsername, username) => {
	return await dbGetAccountByUsername(username)
}

/*
 * Set the preferred streaming platform of a user to a new value
 * @return -> true if it was updated, otherwise null.
 */
const updatePreferredPlatformController = async (dbUpdatePreferredPlatform, accountId, value) => {
	return await dbUpdatePreferredPlatform(accountId, value)
}

/*
 * Set the username of a user to a new value
 * @return -> true if it was updated, USERNAME_TAKEN if username already exists,
 * 						otherwise false.
 */
const updateUsernameController = async (dbUpdateUsername, accountId, value) => {
	return await dbUpdateUsername(accountId, value)
}

/*
 * Set the profile picture of a user to a new value
 * @return -> true if it was updated, otherwise null.
 */
const updateProfilePictureController = async (dbUpdateProfilePicture, accountId, value) => {
	return await dbUpdateProfilePicture(accountId, value)
}

/*
 * Log the user out by deleting the refresh token
 * @return -> the number of rows deleted, or null on failure.
 */
const logoutController = async (dbDeleteRefreshToken, accountId) => {
	const deleted = await dbDeleteRefreshToken(accountId)
	if (deleted >= 0) {
		return deleted
	}
	else {
		// logout failed
		return null
	}
}

module.exports = {
	createAccountController,
	getAccountsController,
	getAccountController,
	getHistoryController,
	getAccountByUsernameController,
	updatePreferredPlatformController,
	updateUsernameController,
	updateProfilePictureController,
	logoutController,
}
