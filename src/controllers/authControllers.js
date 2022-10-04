const {
	verifyUsernamePassword,
	generateAccessToken,
	generateRefreshToken
} = require('../services/authService')

const {
	account
} = require('../models/account')


/*
 * Handle login attempt to account.
 */
const loginController = async (dbGetPasswordByUsername, username, password) => {
	// verify that the username and password are valid.
	if (!await verifyUsernamePassword(dbGetPasswordByUsername, username, password)) {
		return null
	}

	// generate account that we want to sign
	const newAccount = account(username, password, "phone")

	// generate access token and refresh token
	const accessToken = await generateAccessToken(newAccount)
	const refreshToken = await generateRefreshToken(newAccount)
	const tokens = { accessToken: accessToken, refreshToken: refreshToken }
	return tokens
}

/*
 * Handle request to generate a new access token given a refresh token
 */
const tokenController = async (refreshToken) => {
		if (refreshToken == null) {
			return null
		}
		// TODO: store refresh tokens in the DB encrypted
		if (!refreshTokens.includes(refreshToken)) {
			return res.status(403).send()
		}

		jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, account) => {
			if (err) {
				return res.status(403).send()
			}
			else {
				const accessToken = generateAccessToken({ username: account.username })
				res.json({ accessToken: accessToken })
			}
		})
}

module.exports = {
	loginController,
	tokenController
}