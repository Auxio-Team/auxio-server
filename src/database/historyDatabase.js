const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')

/*
 * Create a session in the database.
 * @param session -> the "session" object we want save.
 * @return -> the id if the session is created successfully, otherwise false
 */
const dbCreateSession = async (session, accountId) => {
    const date = new Date().toJSON().slice(0,10).replace(/-/g,'/');
	const query = {
		text: "INSERT INTO musix_session "
				+ "(name, host_id, date, platform, track_ids) "
				+ "VALUES "
				+ "($1, $2, $3, $4, $5) "
                + "RETURNING id;",
		values: [session.name, accountId, date, session.platform, session.tracks],
	}

	const client = createClient("musixdb")
	await client.connect()
	const response = await client.query(query)
	.then(res => {
		return res.rows[0].id;
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
		text: "SELECT musix_session.name, musix_session.host_id, musix_session.date, musix_session.platform, musix_session.track_ids, musix_session_user.download_spotify, musix_session_user.download_apple "
		    + "FROM musix_session "
            + "INNER JOIN musix_session_user ON musix_session.id=musix_session_user.musix_session_id "
            + "WHERE musix_session_user.account_id = $1",
		values: [accountId],
	}

	const client = createClient("musixdb")
	await client.connect()
	const history = await client.query(query)
	.then(res => {
		return res.rows
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
    dbAddSessionParticipant,
    dbGetSessionHistory
}