const {
	validateCreateAccount,
	encryptPassword
} = require('../services/accountService')

/*
 * Create a new account and save it in the database.
 */
const createAccountController = async (dbUsernameExists, dbPhoneNumberExists, dbCreateAccount, username, password, phoneNumber) => {
	// validate username and password
	const validated = await validateCreateAccount(dbUsernameExists, dbPhoneNumberExists, username, phoneNumber)
	if (validated == -1) {
		return -1
	}
	else if (validated == -2) {
		return -2
	}
	// encrypt the password
	const encryptedPassword = await encryptPassword(password)

	// save the account to database
	const newAccount = { username: username, password: encryptedPassword, phoneNumber: phoneNumber }
	console.log("Saving new account to database with username=" + newAccount.username)
	if (await dbCreateAccount(newAccount)) {
		return newAccount
	}
	else {
		return null
	}
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
const getAccountController = async (dbGetAccount, username) => {
	const account = await dbGetAccount(username)
	return account ? account : null
}

/*
 * Set the preferred streaming platform of a user to a new value:w
 * @return -> true if it was updated, otherwise null.
 */
const updatePreferredPlatformController = async (dbUpdatePreferredPlatform, username, value) => {
	if (await dbUpdatePreferredPlatform(username, value)) {
		return true
	}
	else {
		return null
	}
}

/*
 * Set the dark mode of a user to a new value
 * @return -> true if it was updated, otherwise null.
 */
const updateDarkModeController = async (dbUpdateDarkMode, username, value) => {
	if (await dbUpdateDarkMode(username, value)) {
		return true
	}
	else {
		return null
	}
}

module.exports = {
	createAccountController,
	getAccountsController,
	getAccountController,
	updatePreferredPlatformController,
	updateDarkModeController
}
