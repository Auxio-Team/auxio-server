const {
	validateCreateAccount,
	encryptPassword
} = require('../services/accountService')

/*
 * Create a new account and save it in the database.
 */
const createAccountController = async (dbCreateAccount, username, password, phoneNumber) => {
	// TODO: do password strength checking...

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
 * Get history for user.
 * @return -> the history as a json.
 */
const getHistoryController = async (dbGetSessionHistoryCb, dbGetAccountCb, accountId) => {
	var historyList = await dbGetSessionHistoryCb(accountId)
	console.log("history:")
	console.log(historyList)
	// TODO: probably need to optimize getting the host names
	for (const session of historyList) {
		const resp = await dbGetAccountCb(session.host_id)
		var hostname = ""
		if (resp == null || resp.username == null) {
			print("Error getting host name")
		} else {
			hostname = resp.username
		}
		// add host name to response
		session["hostname"] = hostname
	}
	return { "history": historyList }
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
	logoutController,
}
