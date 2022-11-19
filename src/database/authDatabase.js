const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')

/*
 * Get the password of an account given a username.
 * @param username -> the username of the account we want the password from.
 * @return -> the password of the account with username=username, 
 * 						and if the username doesn't exist return null.
 */
const dbGetPassword = async (username) => {
	const query = {
		text: "SELECT pass FROM account WHERE username=$1",
		values: [username]
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res.rows[0] ? res.rows[0].pass : null
	})
	.catch(err => {
		console.error(err.stack)
		return null
	})
	await client.end()
	return response
}

/*
 * Stores refresh token for account in the refresh_token table.
 * If there is already a refresh token stored for this account, then
 * the row is updated with the new refresh token.
 */
const dbStoreRefreshToken = async (accountId, token) => {
	const query = {
		text: "INSERT INTO refresh_token (account_id, token) "
				+ "VALUES ($1, $2) "
				+ "ON CONFLICT (account_id) "
				+ "DO UPDATE SET token = $2;",
		values: [accountId, token],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res
	})
	.catch(err => {
		console.error(err.stack)
		return null
	})
	await client.end()
	return response ? true : false
}

/*
 * Get the refesh token for the account with account_id=accountId.
 */
const dbGetRefreshToken = async (accountId) => {
	const query = {
		text: "SELECT token FROM refresh_token "
				+ "WHERE account_id=$1",
		values: [accountId],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res.rows[0]
	})
	.catch(err => {
		console.error(err.stack)
		return null
	})
	await client.end()
	return response ? response.token : null
}

/*
 * TODO: could use this function if we implement delete account
 * Delete the refresh token for the account with account_id=accountId.
 */
const dbDeleteRefreshToken = async (accountId) => {
	const query = {
		text: "DELETE FROM refresh_token "
				+ "WHERE account_id=$1",
		values: [accountId],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res
	})
	.catch(err => {
		console.error(err.stack)
		return null
	})
	await client.end()
	
	// returns the number of rows that were deleted
	return response["rowCount"]
}

module.exports = {
	dbGetPassword,
	dbStoreRefreshToken,
	dbGetRefreshToken,
	dbDeleteRefreshToken,
}