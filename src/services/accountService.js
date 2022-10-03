const bcrypt = require('bcrypt')

const users = [] // temporary variable for proof of concept (will use database instead)

/*
 * Verify that the username exists and that the password matches (use Bcrypt to compare passwords)
 * @param username -> the username that was entered.
 * @param password -> the password that was entered.
 * @return -> true if the username/password matches a valid account, otherwise false.
 */
const verifyUsernamePassword = async (dbGetPasswordByUsernameFunc, username, password) => {
	const userPassword = await dbGetPasswordByUsernameFunc(username)
	if (userPassword == null || !await bcrypt.compare(password, userPassword)) {
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
	const saltRounds = 10
	const salt = await bcrypt.genSalt(saltRounds)
	const hashedPassword = await bcrypt.hash(password, salt)
	return hashedPassword
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

/*
 * Get the token they send us, verify that this is the correct user,
 * and return that user.
 */
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1] // get the token portion of 'Bearer TOKEN'

	if (token == null) {
		return null // 401 error
	}

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			return null // 403 error
		}	

		next()

	})
	
}



module.exports = {
	encryptPassword,
	validateCreateAccount,
	verifyUsernamePassword,
	users
}



