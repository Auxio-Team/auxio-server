const { Client, Pool } = require('pg')
const { createClient, createPool } = require('./createClientPool')

/*
 * Create a session in the database.
 * @param session -> the "session" object we want save.
 * @return -> the id if the session is created successfully, otherwise false
 */
const dbCreateSession = async (session, accountId) => {
	const query = {
		text: "INSERT INTO auxio_session "
				+ "(name, host_id, date, platform, track_ids) "
				+ "VALUES "
				+ "($1, $2, $3, $4, $5) "
                + "RETURNING id;",
		values: [session.name, accountId, session.date, session.platform, session.trackIds],
	}

	const client = createClient("auxiodb")
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
		text: "INSERT INTO auxio_session_user "
				+ "(account_id, auxio_session_id) "
				+ "VALUES "
				+ "($1, $2);",
		values: [accountId, sessionId],
	}

	const client = createClient("auxiodb")
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
		text: "SELECT auxio_session.name, auxio_session.host_id, auxio_session.date, auxio_session.platform, auxio_session.track_ids, auxio_session_user.download_spotify, auxio_session_user.download_apple "
		    + "FROM auxio_session "
            + "INNER JOIN auxio_session_user "
			+ "ON auxio_session.id=auxio_session_user.auxio_session_id "
            + "WHERE auxio_session_user.account_id = $1",
		values: [accountId],
	}

	const client = createClient("auxiodb")
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