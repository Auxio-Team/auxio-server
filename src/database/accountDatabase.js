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
				+ "(username, pass, phone_number, dark_mode_enabled) "
				+ "VALUES "
				+ "($1, $2, $3, $4);",
		values: [account.username, account.password, account.phoneNumber, false],
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

module.exports = {
	dbCreateAccount,
	dbGetAccounts,
	dbUsernameExists,
	dbPhoneNumberExists
}
