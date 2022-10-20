const bcrypt = require('bcrypt')

/*
 * Encrypts the password using Bcrypt.
 * @param password -> the password we are encrypting.
 * @return -> the encrypted password if encryption is successful, otherwise false
 */
const encryptPassword = async (password) => {
	const saltRounds = 10
	const salt = await bcrypt.genSalt(saltRounds)
	const encryptedPassword = await bcrypt.hash(password, salt)
	return encryptedPassword
}

/* 
 * Validate that the username and phone number are both unique.
 * @param username -> the username for the account we are trying to create.
 * @param phoneNumber -> the phone number for the account we are tyring to crate.
 * @return -> true if both username/password are valid, otherwise false.
 */
const validateCreateAccount = async (dbUsernameExists, dbPhoneNumberExists, username, phoneNumber) => {
	if (await dbUsernameExists(username)) {
		return -1
	}
	else if (await dbPhoneNumberExists(phoneNumber)) {
		return -2
	}
	else {
		return true
	}
}

module.exports = {
	encryptPassword,
	validateCreateAccount
}

