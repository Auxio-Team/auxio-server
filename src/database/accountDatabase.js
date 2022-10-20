const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')

/*
 * Create an account in the database.
 * @param account -> the "account" object we want save.
 * @return -> true if the account is created successfully, otherwise false
 */
const dbCreateAccount = async (account) => {
	const query = {
		text: "INSERT INTO account "
				+ "(username, pass, phone_number, preferred_streaming_platform) "
				+ "VALUES "
				+ "($1, $2, $3, $4);",
		values: [account.username, account.password, account.phoneNumber, "Apple Music"],
	}

	const pool = createPool("musixdb")
	pool.connect()
	.then(client => {
    return client
      .query(query)
      .then(res => {
        client.release()
				return true
      })
      .catch(err => {
				console.log(err)
        client.release()
				return false
      })
  })
	.catch(err => {
		console.log("Error creating account: " + err)
		return false
	})
	await pool.end()
	return true
}

/*
 * Checks if the username exists in the database.
 * @return -> true if it already exists, otherwise false
 */
const dbUsernameExists = async (username) => {
	const query = {
		text: "SELECT 1 FROM account WHERE username = $1",
		values: [username],
	}

	const pool = createPool("musixdb")
	const exists = await pool.connect()
	.then(client => {
    return client
      .query(query)
      .then(res => {
				if (!res.rows[0]) {
					console.log("Username doesn't exist")
					client.release()
					return null 
				}
				else {
					console.log("Username already exists")
					client.release()
					return res.rows[0]
				}
      })
      .catch(err => {
				console.log(err)
        client.release()
				return true
      })
  })
	.catch(err => {
		console.log("Error checking if username exists: " + err)
	})
	await pool.end()	
	return exists ? true : false
}

/*
 * Checks if the phone number exists in the database.
 * @return -> true if it already exists, otherwise false.
 */
const dbPhoneNumberExists = async (phoneNumber) => {
	const query = {
		text: "SELECT 1 FROM account WHERE phone_number = $1",
		values: [phoneNumber],
	}

	const pool = createPool("musixdb")
	const exists = await pool.connect()
	.then(client => {
    return client
      .query(query)
      .then(res => {
				if (!res.rows[0]) {
					console.log("Phone number doesn't exist")
					client.release()
					return null 
				}
				else {
					console.log("Phone number already exists")
					client.release()
					return res.rows[0]
				}
      })
      .catch(err => {
				console.log(err)
        client.release()
				return true
      })
  })
	.catch(err => {
		console.log("Error checking if phone number exists: " + err)
	})
	await pool.end()	
	return exists ? true : false
}

/*
 * Query for all the accounts from the datase.
 * @return -> all the accounts in the database
 */
const dbGetAccounts = async () => {
	const query = {
		text: "SELECT * FROM account",
		values: []
	}
	const pool = createPool("musixdb")
	const accounts = await pool.connect()
	.then(client => {
    return client
      .query(query)
      .then(res => {
        client.release()
				return res.rows
			})
      .catch(err => {
				console.log(err)
        client.release()
				return null
      })
	})
	.catch(err => {
		console.log("Error getting accounts: " + err)
		return null
	})
		
	await pool.end()	
	return accounts
}

/*
 * Set the dark mode of the account with username=username to value.
 */
const dbGetAccount = async (username) => {
	const query = {
		text: "SELECT username, phone_number, preferred_streaming_platform "
		    + "FROM account "
				+ "WHERE username = $1",
		values: [username],
	}

	const client = createClient("musixdb")
	await client.connect()
	const account = await client.query(query)
	.then(res => {
		return res.rows[0]
	})
	.catch(e => {
		console.error(e.stack)
		return null
	})
	await client.end()
	return account ? account : null
}


/*
 * Checks if the phone number exists for a given user.
 * @return -> true if it already exists, otherwise false.
 */
const dbPhoneNumberExistsForUser = async (username, phoneNumber) => {
	const query = {
		text: "SELECT phone_number FROM account WHERE username = $1",
		values: [username],
	}
	console.log(query)

	const pool = createPool("musixdb")
	const exists = await pool.connect()
	.then(client => {
    	return client
    		.query(query)
    		.then(res => {
				console.log(res.rows[0])
				client.release()
				return res.rows[0].phone_number === phoneNumber;
    		})
			.catch(err => {
				console.log(err)
        		client.release()
				return false
      		})
  	})
	.catch(err => {
		console.log("Error checking if phone number exists: " + err)
	})
	console.log('waiting for pool to end')
	await pool.end()	
	console.log('finished db query', exists)
	return exists ? true : false
}

/*
 * Resets the password in the database.
 * @return -> true if reset was a success
 */
const dbResetPassword = async (username, newpass) => {
	const query = {
		text: "UPDATE account SET pass = $1 WHERE username = $2",
		values: [newpass, username],
	}

	const pool = createPool("musixdb")
	const exists = await pool.connect()
	.then(client => {
    return client
      .query(query)
      .then(res => {
		console.log(res)
        client.release()
		return true
      })
      .catch(err => {
		console.log(err)
        client.release()
		return false
      })
  })
	.catch(err => {
		console.log("Error checking if username exists: " + err)
	})
	await pool.end()	
	return exists ? true : false
}

/*
 * Set the prefered platform for the account with username=username
 * to value.
 */
const dbUpdatePreferredPlatform = async (username, value) => {
	const query = {
		text: "UPDATE account "
		    + "SET preferred_streaming_platform = $1 "
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
	dbCreateAccount,
	dbGetAccounts,
	dbUsernameExists,
	dbPhoneNumberExists,
	dbPhoneNumberExistsForUser,
	dbResetPassword,
	dbUpdatePreferredPlatform,
	dbGetAccount
}
