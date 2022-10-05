const {
	validateCreateAccount,
	encryptPassword,
} = require('../services/accountService')

/*
 * Create a new account and save it in the database.
 */
const createAccountController = async (dbUsernameExists, dbPhoneNumberExists, dbCreateAccount, username, password, phoneNumber) => {
	// validate username and password
	if (!await validateCreateAccount(dbUsernameExists, dbPhoneNumberExists, username, phoneNumber)) {
		return null
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

module.exports = {
	createAccountController,
	getAccountsController
}
