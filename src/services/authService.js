const process = require('process')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/*
 * Verify that the username exists and that the password matches (use Bcrypt to compare passwords)
 * @param username -> the username that was entered.
 * @param password -> the password that was entered.
 * @return -> true if the username/password matches a valid account, otherwise false.
 */
const verifyUsernamePassword = async (dbGetPasswordByUsername, username, password) => {
	const accountPassword = await dbGetPasswordByUsername(username)
	if (accountPassword == null || !await bcrypt.compare(password, accountPassword)) {
		return false
	}
	else {
		return true
	}
}

/*
 * Generate access token.
 */
const generateAccessToken = async (account) => {
	return jwt.sign(
		account,
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: '20s'})
}

/*
 * Generate refresh token.
 */
const generateRefreshToken = async (account) => {
	return jwt.sign(
		account,
		process.env.REFRESH_TOKEN_SECRET)
}

module.exports = {
	verifyUsernamePassword,
	generateAccessToken,
	generateRefreshToken
}