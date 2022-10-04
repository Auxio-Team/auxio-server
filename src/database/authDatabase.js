const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')

/*
 * Get the password of an account given a username.
 * @param username -> the username of the account we want the password from.
 * @return -> the password of the account with username=username, 
 * 						and if the username doesn't exist return null.
 */
const dbGetPasswordByUsername = async (username) => {
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

	if (password == null) {
		return null
	}
	else {
		return password
	}
}

module.exports = {
	dbGetPasswordByUsername
}