const {
	validateCreateAccount,
	encryptPassword
} = require('../services/accountService')

/*
 * Create a new account and save it in the database.
 */
const createAccountController = async (dbCreateAccount, username, password, phoneNumber) => {
	// validate username and password (TODO: can become depricated - use postgres contraints)
	/*const validated = await validateCreateAccount(dbUsernameExists, dbPhoneNumberExists, username, phoneNumber)
	if (validated == -1) {
		return -1
	}
	else if (validated == -2) {
		return -2
	}*/

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
	updatePreferredPlatformController,
	updateUsernameController,
	logoutController,
}
