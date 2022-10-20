const jwt = require('jsonwebtoken')

const {
	verifyUsernamePassword,
	generateAccessToken,
	generateRefreshToken,
	encryptRefreshToken,
	verifyRefreshToken,
	storeRefreshToken,
	verifyCodeToken,
	generateResetAccessToken,
	generatePasswordAccessToken,
	verifyPasswordToken,
	textCode,
	generateCode
} = require('../services/authService')

const { dbDeleteRefreshToken } = require('../database/authDatabase')
const { encryptPassword } = require('../services/accountService')

/*
 * Handle login attempt to account.
 */
const loginController = async (dbGetPassword, dbCreateRefreshToken, dbDeleteRefreshToken, username, password) => {
	// verify that the username and password are valid.
	if (!await verifyUsernamePassword(dbGetPassword, username, password)) {
		return null
	}

	// generate account that we want to sign
	const newAccount = { username: username }

	// generate access token and refresh token
	const accessToken = await generateAccessToken(newAccount)
	const refreshToken = await generateRefreshToken(newAccount)

	// store the refresh token in the database
	const stored = await storeRefreshToken(
		dbCreateRefreshToken,
		dbDeleteRefreshToken,
		username,
		refreshToken)
	
	const tokens = { accessToken: accessToken, refreshToken: refreshToken }
	return tokens
}

/*
 * Handle request to generate a new access token given a refresh token
 */
const tokenController = async (dbGetRefreshToken, refreshToken) => {
		if (refreshToken == null) {
			return null
		}
		try {
			// verify the refresh token
			const account = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) 
			console.log("New Access Token for: " + account.username)
			// verify the refresh token exists
			if (await verifyRefreshToken(dbGetRefreshToken, account.username, refreshToken)) {
				const accessToken = generateAccessToken({ username: account.username} )
				return accessToken
			}
			else {
				return null
			}
		}
		catch (err) {
			return null
		}
}

/*
 * Start reset password by validating username and phone number.
 */
const initResetPasswordController = async (dbUsernameExists, dbPhoneNumberExistsForUser, username, phoneNumber) => {
	// validate username
	if (!await dbUsernameExists(username)) {
		return null;
	}

	// validate phone number is associated with username
	if (!await dbPhoneNumberExistsForUser(username, phoneNumber)) {
		return null;
	}

	// generate code
	const code = generateCode();

	// text code to user
	textCode(code, phoneNumber);	

	// generate authorization token
	const authToken = await generateResetAccessToken({ code: code, username: username });

	// return code in token
	return { accessToken: authToken }
}

/*
 * Verify code in token.
 */
const verifyCodeController = async (token, code) => {
	// validate token
	const decryptedBody = await verifyCodeToken(token);

	// validate code
	if (code == decryptedBody.code) {
		const authToken = await generatePasswordAccessToken({username: decryptedBody.username})
		return { accessToken: authToken }
	}
	return null;
}

/*
 * Reset password.
 */
const resetPasswordController = async (dbResetPassword, token, newpass) => {
	// validate token
	const username = await verifyPasswordToken(token);

	// encrypt password
	const passEncrypted = await encryptPassword(newpass);

	// update password in database
	return await dbResetPassword(username, passEncrypted);
}

/*
 * Set the username of a user to a new value
 * @return -> true if it was updated, otherwise null.
 */
const updateUsernameController = async (dbUpdateUsername, dbUsernameExists, dbCreateRefreshToken, dbDeleteRefreshToken, username, value) => {
	// check if the username already exists
	if (await dbUsernameExists(value)) {
		return -1
	}

	if (await dbUpdateUsername(username, value)) {
		// get new AccessToken and RefreshToken
		const account = { username: value }
		const accessToken = await generateAccessToken(account)
		const refreshToken = await generateRefreshToken(account)

		// delete refresh token for old username
		await dbDeleteRefreshToken(username)

		// store the refresh token in the database for new username (value)
		const stored = await storeRefreshToken(
			dbCreateRefreshToken,
			dbDeleteRefreshToken,
			value,
			refreshToken)

			console.log("Updated username from", username, "to", value)
		return { accessToken: accessToken, refreshToken: refreshToken }
	}
	else {
		return -2
	}
}

module.exports = {
	loginController,
	tokenController,
	initResetPasswordController,
	verifyCodeController,
	resetPasswordController,
	updateUsernameController
}