const { Client, Pool } = require('pg')

const accounts = [] // temporary variable for proof of concept (will use database instead)

/*
 * Create an account in the database.
 * @param account -> the "account" object we want save.
 * @return -> true if the account is created successfully
 */
const dbCreateAccount = async (account) => {
	



	accounts.push(account)
	return true
}

/*
 * Get the password of an account given a username.
 * @param username -> the username of the account we want the password from.
 * @return -> the password of the account with username=username, 
 * 						and if the username doesn't exist return null.
 */
const dbGetPasswordByUsername = async (username) => {
	const account = accounts.find(account => account.username = username)
	if (account == null) {
		return null
	}
	else {
		return account.password
	}
}

/*
 * Query for all the accounts from the datase.
 * @return -> all the accounts in the database
 */
const dbGetAccounts = async () => {
	return accounts
}

module.exports = {
	dbCreateAccount,
	dbGetPasswordByUsername,
	dbGetAccounts
}
