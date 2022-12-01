const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')

/*
 * Create a session in the database.
 * @param session -> the "session" object we want save.
 * @return -> true if the session is created successfully, otherwise false
 */
const dbCreateSession = async (accountId, sessionId) => {
    const date = new Date().toJSON().slice(0,10).replace(/-/g,'/');
	const query = {
		text: "INSERT INTO musix_session "
				+ "(id, name, host_id, date, platform, track_ids, completed) "
				+ "VALUES "
				+ "($1, $2, $3, $4, $5, $6, $7);",
		values: [sessionId, `${accountId}-${date}`, accountId, date, "Spotify", [], false],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return true
	})
    .catch(err => {
        console.log(err);
        return false;
    })
	await client.end()
	return response
}

/*
 * Updates a session in the database.
 * @param session -> the "session" object we want save.
 * @return -> true if the update is successful, otherwise false
 */
const dbUpdateSession = async (session) => {
    const date = new Date().toJSON().slice(0,10).replace(/-/g,'/');
	const query = {
		text: "UPDATE musix_session SET name = $1, platform = $2, track_ids = $3, completed = $4 WHERE host_id = $5 AND completed = $6",
		values: [session.name == '' ? `${accountId}-${date}` : session.name, session.platform, session.tracks, true, session.host, false],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return true
	})
    .catch(err => {
        console.log(err);
        return false;
    })
	await client.end()
	return response
}

/*
 * Add a session participant in the database.
 * @param accountId -> the account id of the participant.
 * @param sessionId -> the session id of the session that was joined.
 * @return -> true if the participant is added successfully, otherwise false
 */
const dbAddSessionParticipant = async (accountId, sessionId) => {
	const query = {
		text: "INSERT INTO musix_session_user "
				+ "(account_id, musix_session_id) "
				+ "VALUES "
				+ "($1, $2);",
		values: [accountId, sessionId],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return true
	})
    .catch(err => {
        console.log(err);
        return false;
    })
	await client.end()
	return response
}

/*
 * Query for the session history of an account from the datase.
 * @param accountId -> the account id of the user.
 * @return -> array of sessions if the history is found successfully, otherwise null
 */
const dbGetSessionHistory = async (accountId) => {
	const query = {
		text: "SELECT name, host_id, date, platform, track_ids "
		    + "FROM musix_session "
            + "INNER JOIN musix_session_user ON musix_session.id = musix_session_user.musix_session_id "
			+ "WHERE musix_session_user.account_id = $1 AND musix_session.completed = $2",
		values: [accountId, true],
	}

	const client = createClient("musixdb")
	await client.connect()
	const history = await client.query(query)
	.then(res => {
        console.log("attempted join: " + res)
		return res
	})
	.catch(err => {
		console.error(err.stack)
		return null
	})
	await client.end()
	return history ? history : null
}

module.exports = {
    dbCreateSession,
    dbUpdateSession,
    dbAddSessionParticipant,
    dbGetSessionHistory
}