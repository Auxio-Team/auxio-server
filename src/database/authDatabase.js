const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')

/*
 * Get the password of an account given a username.
 * @param username -> the username of the account we want the password from.
 * @return -> the password of the account with username=username, 
 * 						and if the username doesn't exist return null.
 */
const dbGetPassword = async (username) => {
	// TODO: get account password from database
	const query = {
		text: "SELECT pass FROM account WHERE username=$1",
		values: [username]
	}
	const pool = createPool("musixdb")
	const password = await pool.connect()
	.then(client => {
    return client
      .query(query)
      .then(res => {
				if (!res.rows[0]) {
					console.log("Username " + username + " doesn't exist")
					client.release()
					return null
				}
				else {
					client.release()
					return res.rows[0].pass
				}
			})
      .catch(err => {
				console.log(err)
        client.release()
				return null
      })
	})
	.catch(err => {
		console.log("Error getting password from username: " + err)
		return null
	})
	await pool.end()
	return password ? password : null
}

/*
 * Stores a refresh token in the database in the refresh_token table.
 */
const dbCreateRefreshToken = async (username, token) => {
	const query = {
		text: "INSERT INTO refresh_token"
				+ "(username, token) "
				+ "VALUES "
				+ "($1, $2);",
		values: [username, token],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res
	})
	.catch(e => {
		console.error(e.stack)
		return null
	})
	await client.end()
	return response ? true : false
}

/*
 * Get the refesh token for the account with username=username.
 */
const dbGetRefreshToken = async (username) => {
	const query = {
		text: "SELECT token FROM refresh_token "
				+ "WHERE username=$1",
		values: [username],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res.rows[0]
	})
	.catch(e => {
		console.error(e.stack)
		return null
	})
	await client.end()
	return response ? response.token : null
}

/*
 * Delete the refresh token for the account with username=username.
 */
const dbDeleteRefreshToken = async (username) => {
	const query = {
		text: "DELETE FROM refresh_token "
				+ "WHERE username=$1",
		values: [username],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res
	})
	.catch(e => {
		console.error(e.stack)
		return null
	})
	await client.end()
}

/*
 * TODO:
 * Set the prefered platform for the account with username=username
 * to value.
 */
const dbUpdateUsername = async (username, value) => {
	const query = {
		text: "UPDATE account "
		    + "SET username = $1 "
				+ "WHERE username = $2",
		values: [value, username],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res
	})
	.catch(e => {
		console.error(e.stack)
		return null
	})
	await client.end()
	return response	
}


module.exports = {
	dbGetPassword,
	dbCreateRefreshToken,
	dbGetRefreshToken,
	dbDeleteRefreshToken,
	dbUpdateUsername
}