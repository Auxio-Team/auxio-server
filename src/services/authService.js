require('dotenv').config();
const process = require('process')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const random = require('random-string-alphanumeric-generator');
console.log(process.env.TWILIO_ACCOUNT_SID);
console.log(process.env.TWILIO_AUTH_TOKEN);
const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const twilioPhoneNumber = "+13392296710";

/*
 * Verify that the username exists and that the password matches (compare with Bcrypt)
 * @param username -> the username that was entered.
 * @param password -> the password that was entered.
 * @return -> true if the username/password matches a valid account, otherwise false.
 */
const verifyUsernamePassword = async (dbGetPassword, username, password) => {
	const accountPassword = await dbGetPassword(username)
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
		{ expiresIn: '24h'})
}

/*
 * Generate refresh token.
 */
const generateRefreshToken = async (account) => {
	return jwt.sign(
		account,
		process.env.REFRESH_TOKEN_SECRET)
}

/*
 * Encrypt the refresh token using Bcrypt.
 * @param refreshToken -> the refresh token we are encrypting.
 * @return -> the encrypted token if encryption is successful, otherwise false
 */
const encryptRefreshToken = async (refreshToken) => {
	const saltRounds = 10 
	const salt = await bcrypt.genSalt(saltRounds)
	// bcrypt only encrypts up to 72 bytes
	var refreshTokenShortened = refreshToken
	if (refreshToken.length > 72) {
		refreshTokenShortened = refreshToken.substring(refreshToken.length - 72, refreshToken.length - 1)
	}
	const encryptedToken = await bcrypt.hash(refreshTokenShortened, salt)
	return encryptedToken
}

/*
 * Store new refresh token in the database.
 */
const storeRefreshToken = async (dbCreateRefreshToken, dbDeleteRefreshToken, username, refreshToken) => {
	// encrypt the refresh token
	const encryptedToken = await encryptRefreshToken(refreshToken)

	// remove any old refresh token
	await dbDeleteRefreshToken(username)

	// create the new refresh token 
	if (!await dbCreateRefreshToken(username, encryptedToken)) {
		return null
	}
	return true
}

/*
 * Verify that the refresh token exists for this user (compare with Bcrypt)
 * @param username -> the username belonging to the refresh token.
 * @param refreshToken -> the token that was sent.
 * @return -> true if the token exists, otherwise false.
 */
const verifyRefreshToken = async (dbGetRefreshToken, username, refreshToken) => {
	const databaseToken = await dbGetRefreshToken(username)
	var refreshTokenShortened = refreshToken
	if (refreshToken.length > 72) {
		refreshTokenShortened = refreshToken.substring(refreshToken.length - 72, refreshToken.length - 1)
	}
	if (databaseToken == null
		|| !await bcrypt.compare(refreshTokenShortened, databaseToken)) {
		return null
	}
	else {
		return true
	}
}

/*
 * Generate a random code to verify phone number
 * @return -> code of length 6 as a string
 */
const generateCode = () => {
    return random.randomNumber(6);
}

/*
 * Generate access token for reset password.
 */
const generateResetAccessToken = async (body) => {
	return jwt.sign(
		body,
		process.env.CODE_TOKEN_SECRET,
		{ expiresIn: '24h'})
}

/*
 * Generate access token for password after code verified.
 */
const generatePasswordAccessToken = async (username) => {
	return jwt.sign(
		username,
		process.env.PASSWORD_TOKEN_SECRET,
		{ expiresIn: '24h'})
}

/*
 * Verify token and return code.
 */
const verifyCodeToken = async (token) => {
	return jwt.verify(token, process.env.CODE_TOKEN_SECRET, (err, body) => {
		if (err) {
			console.log("Forbidden")
			return null;
		}
		return body;
	})
}

/*
 * Verify token and return code.
 */
const verifyPasswordToken = async (token) => {
	return jwt.verify(token, process.env.PASSWORD_TOKEN_SECRET, (err, body) => {
		if (err) {
			console.log("Forbidden")
			return null;
		}
		return body.username;
	})
}

/*
 * Text code to user
 */
const textCode = async (code, phoneNumber) => {
	twilioClient.messages.create({
  		to: '+1'+phoneNumber,
  		from: twilioPhoneNumber,
  		body: 'Musix code: ' + code
	});
}

module.exports = {
	verifyUsernamePassword,
	generateAccessToken,
	generateRefreshToken,
	encryptRefreshToken,
	storeRefreshToken,
	verifyRefreshToken,
	generateCode,
	generateResetAccessToken,
	verifyCodeToken,
	generatePasswordAccessToken,
	verifyPasswordToken,
	textCode
}