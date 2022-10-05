const jwt = require('jsonwebtoken')

const {
	verifyUsernamePassword,
	generateAccessToken,
	generateRefreshToken,
	encryptRefreshToken,
	verifyRefreshToken,
	storeRefreshToken
} = require('../services/authService')

const { dbDeleteRefreshToken } = require('../database/authDatabase')

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

module.exports = {
	loginController,
	tokenController
}