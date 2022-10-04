const {
	validateCreateAccount,
	encryptPassword,
} = require('../services/accountService')

const {
	account
} = require('../models/account')

/*
 * Create a new account and save it in the database.
 */
const createAccountController = async (dbUsernameExists, dbPhoneNumberExists, dbCreateAccount, username, password, phoneNumber) => {
	// validate username and password
	if (!await validateCreateAccount(dbUsernameExists, dbPhoneNumberExists, username, phoneNumber)) {
		return null
	}
	// encrypt the password
	const hashedPassword = await encryptPassword(password)
	console.log("Hashed Password: " + hashedPassword)

	// save the account to database
	const newAccount = account(username, hashedPassword, phoneNumber)
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

/*
 * Authenticate a user logging into an account.
 */
/*const accountLoginController = async (dbGetPasswordByUsername, username, password) => {
	if (await verifyUsernamePassword(dbGetPasswordByUsername, username, password)) {
		return true
	}
	else {
		return null	
	}
}*/