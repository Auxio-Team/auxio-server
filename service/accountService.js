const bcrypt = require('bcrypt')

const users = [] // temporary variable for proof of concept (will use database instead)

/*
 * Verify that the username exists and that the password matches (use Bcrypt to compare passwords)
 * @param username -> the username that was entered.
 * @param password -> the password that was entered.
 * @return -> true if the username/password matches a valid account, otherwise false.
 */
const verifyUsernamePassword = async (username, password) => {
	const user = users.find(user => user.username = username)
	if (user == null || !await bcrypt.compare(password, user.password)) {
		return false
	}
	else {
		return true
	}
}

/*
 * Encrypts the password using Bcrypt.
 * @param password -> the password we are encrypting.
 * @return -> the encrypted password if encryption is successful, otherwise false
 */
const encryptPassword = async (password) => {
	try {
		const saltRounds = 10
		const salt = await bcrypt.genSalt(saltRounds)
		const hashedPassword = await bcrypt.hash(password, salt)
		return hashedPassword
	} catch {
		return false
	}
}

/* 
 * Validate that the username and phone number are both unique.
 * @param username -> the username for the account we are trying to create.
 * @param phoneNumber -> the phone number for the account we are tyring to crate.
 * @return -> true if both username/password are valid, otherwise false.
 */
const validateCreateAccount = async (username, phoneNumber) => {
	if (await uniqueUsername(username) && await uniquePhoneNumber) {
		return true
	}
	else {
		return false
	}
}

/*
 * Check if username is unique
 * @param username -> the username that we are checking.
 * @return -> true if it is unique, otherwise false.
 */
const uniqueUsername = async (username) => {
	return true;
}

/*
 * Check if phone number is unique
 * @param phoneNumber -> the phone number that we are checking.
 * @return -> true if it is unique, otherwise false.
 */
const uniquePhoneNumber = async (phoneNumber) => {
	return true;
}

module.exports = {
	encryptPassword,
	validateCreateAccount,
	verifyUsernamePassword,
	users
}
