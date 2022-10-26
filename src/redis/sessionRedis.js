const { redisClient } = require('./initRedis');

/*
 * Create a session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @return -> true if the session is created successfully
 */
const redisCreateSession = async (sessionId, host) => {
    const respStatus = await redisClient.SADD('sessions', sessionId)
        .then((resp) => resp == 1)
        .catch((err) => console.log('Error when trying to add session id to sessions\n'+ err));

    if (!respStatus) {
        return respStatus;
    }

    await redisClient.SADD('hosts', host)
        .catch((err) => console.log('unable to add host\n'+err))

    await redisClient.HSET(`sessions:${sessionId}`, 'host', host)
        .catch((err) => console.log('unable to set session info\n'+err))
	
    await redisJoinSession(sessionId, host);

    return respStatus;
}


/*
 * Join a session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @param participant -> the username of the participant joining the session
 * @return -> true if the session is created successfully
 */
const redisJoinSession = async (sessionId, participant) => {

    return await redisClient.SADD(`sessions:${sessionId}:participants`, participant)
        .then((resp) => resp == 1)
        .catch((err) => console.log('unable to join session\n'+err))
}

/*
 * Verify that the user trying to start a session is a valid host.
 * @param username -> the username of the user
 * @return -> true if the user is a valid host
 */
const redisVerifyProspectHost = async (username) => {

    return await redisClient.SISMEMBER('hosts', username)
        .then((resp) => resp == 0)
        .catch((err) => console.log('Error verifying prospect host\n' + err));
}

/*
 * Verify that the session id exists
 * @param sessionid -> the sessionid to be checked
 * @return -> true if the session id exists
 */
const redisVerifySessionIdExists = async (sessionId) => {

    return await redisClient.SISMEMBER('sessions', sessionId)
        .then((resp) => resp == 1)
        .catch((err) => 'Error verifying session id\n'+err);
}

/*
 * Verify that the user is in the given session
 * @param sessionid -> the sessionid to be checked
 * @param username -> the username to be checked
 * @return -> true if the participant exists in the session
 */
const redisVerifyParticipantExists = async (sessionId, username) => {

    return await redisClient.SISMEMBER(
        `sessions:${sessionId}:participants`, 
        username
    )
        .then((resp) => resp == 1)
        .catch((err) => 'Error verifying participant\n'+err);
}

/*
 * Get the session info for the given session
 * @param sessionid -> the sessionid to be checked
 * @return -> the session information
 */
const redisGetSessionInfo = async (sessionId) => {

    return await redisClient.HGETALL(`sessions:${sessionId}`)
        .then((resp) => resp)
        .catch((err) => 'Error getting session information\n'+err);
}

/*
 * Leave the given session
 * @param sessionid -> the sessionid to be left
 * @param username -> the username leaving the session
 * @return -> the resp
 */
const redisLeaveSession = async (sessionId, username) => {

    return await redisClient.SREM(`sessions:${sessionId}:participants`, username)
        .then((resp) => resp)
        .catch((err) => 'Error removing participant from session\n'+err);
}

// end session


module.exports = { 
    redisCreateSession, 
    redisVerifyProspectHost, 
    redisVerifySessionIdExists,
    redisGetSessionInfo,
    redisJoinSession,
    redisVerifyParticipantExists,
    redisLeaveSession
}