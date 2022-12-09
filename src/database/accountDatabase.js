const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')
const {
	USERNAME_TAKEN,
	PHONE_NUMBER_TAKEN
} = require('../models/accountModels')
const {
	CONSTRAINT_VIOLATION_CODE,
	USERNAME_CONSTRAINT,
	PHONE_NUMBER_CONSTRAINT
} = require('../models/databaseModels')

/*
 * Create an account in the database.
 * @param account -> the "account" object we want save.
 * @return -> true if the account is created successfully, otherwise false
 */
const dbCreateAccount = async (account) => {
	const query = {
		text: "INSERT INTO account "
				+ "(username, pass, phone_number, preferred_streaming_platform, current_status, session_code) "
				+ "VALUES "
				+ "($1, $2, $3, $4, $5, $6);",
		values: [account.username, account.password, account.phoneNumber, "Apple Music", "Online", null],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return true
	})
	.catch(err => {
		console.error(err.stack)
		if (err.code == 23505 && err.constraint == USERNAME_CONSTRAINT) {
			return USERNAME_TAKEN
		}
		else if (err.code == 23505 && err.constraint == PHONE_NUMBER_CONSTRAINT) {
			return PHONE_NUMBER_TAKEN
		}
		else {
			return null
		}
	})
	await client.end()
	return response
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

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res.rows
	})
	.catch(err => {
		console.error(err.stack)
		return false
	})
	await client.end()
	return response
}

/*
 * Get an account based on the account id.
 */
const dbGetAccount = async (accountId) => {
	const query = {
		text: "SELECT id, username, preferred_streaming_platform, current_status, session_code, profile_pic_path "
		    + "FROM account "
				+ "WHERE id = $1",
		values: [accountId],
	}

	const client = createClient("musixdb")
	await client.connect()
	const account = await client.query(query)
	.then(res => {
		return res.rows[0]
	})
	.catch(err => {
		console.error(err.stack)
		return null
	})
	await client.end()
	return account ? account : null
}

/*
 * Get an account based on the account username.
 */
const dbGetAccountByUsername = async (username) => {
	const query = {
		text: "SELECT id, username, current_status, session_code "
		    	+ "FROM account "
				+ "WHERE username = $1",
		values: [username],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		if (res.rows.length == 0) {
			return null
		}
		return res.rows[0]
	})
	.catch(err => {
		console.error(err.stack)
		return null
	})
	await client.end()

	return response
}

/*
 * Checks if the phone number exists for a given user.
 * @return -> true if the phone number belongs to the user, otherwise false.
 */
const dbPhoneNumberExistsForUser = async (username, phoneNumber) => {
	const query = {
		text: "SELECT phone_number FROM account WHERE username = $1",
		values: [username],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res.rows[0] === phoneNumber
	})
	.catch(err => {
		console.error(err.stack)
		return false
	})
	await client.end()
	return response
}

/*
 * Resets the password in the database.
 * @return -> true if reset was a success, otherwise false.
 */
const dbResetPassword = async (username, newpass) => {
	const query = {
		text: "UPDATE account SET pass = $1 WHERE username = $2",
		values: [newpass, username],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return true
	})
	.catch(err => {
		console.error(err.stack)
		return false
	})
	await client.end()
	return response
}

/*
 * Set the prefered platform for the account with id=accountId
 * to value.
 * @return -> true if successfully updated, otherwise false.
 */
const dbUpdatePreferredPlatform = async (accountId, value) => {
	const query = {
		text: "UPDATE account "
		    + "SET preferred_streaming_platform = $1 "
				+ "WHERE id = $2",
		values: [value, accountId],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res["rowCount"] > 0
	})
	.catch(err => {
		console.error(err.stack)
		return false
	})
	await client.end()
	return response	
}

/*
 * Get the id (primary key) of the account with username=username.
 * @return -> the account id, otherwise null.
 */
const dbGetAccountId = async (username) => {
	const query = {
		text: "SELECT id FROM account "
				+ "WHERE username=$1",
		values: [username],
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
	return response ? response.id : null
}

/*
 * Set the prefered platform for the account with id=accountId
 * to value.
 */
const dbUpdateUsername = async (accountId, value) => {
	const query = {
		text: "UPDATE account "
		    + "SET username = $1 "
				+ "WHERE id = $2",
		values: [value, accountId],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res["rowCount"] > 0
	})
	.catch(err => {
		console.error(err.stack)
		if (err.code == CONSTRAINT_VIOLATION_CODE) {
			return USERNAME_TAKEN 
		}
		else {
			return false
		}
	})
	await client.end()
	return response	
}


/*
 * Update the status and the session code of the user
 * Return the number of rows updated or null
 */
const dbUpdateStatusAndSessionCode = async (accountId, newStatus, newSessionCode) => {
	const query = {
		text: "UPDATE account "
		    + "SET current_status = $1, session_code = $2 "
				+ "WHERE id = $3;",
		values: [newStatus, newSessionCode, accountId],
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

	return response["rowCount"]
}


/*
 * Set the profile picture for the account with id=accountId
 * to value.
 */
const dbUpdateProfilePicture = async (accountId, value) => {
	const query = {
		text: "UPDATE account "
		    + "SET profile_pic_path = $1 "
				+ "WHERE id = $2",
		values: [value, accountId],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {

		return res["rowCount"] > 0
	})
	.catch(err => {
		console.error(err.stack)
		return false
	})
	await client.end()
	return response	
}


module.exports = {
	dbCreateAccount,
	dbGetAccounts,
	dbPhoneNumberExistsForUser,
	dbResetPassword,
	dbUpdatePreferredPlatform,
	dbGetAccount,
	dbGetAccountByUsername,
	dbGetAccountId,
	dbUpdateUsername,
	dbUpdateStatusAndSessionCode,
	dbUpdateProfilePicture
}
