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

    await redisClient.HSET('session:'+sessionId, 'host', host)
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

    return await redisClient.SADD('session:'+sessionId+':participants', participant)
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
 * Verify that the session id is unique
 * @param sessionid -> the sessionid to be checked
 * @return -> true if the session id is unique
 */
const redisVerifySessionIdExists = async (sessionId) => {

    return await redisClient.SISMEMBER('sessions', sessionId)
        .then((resp) => resp == 1)
        .catch((err) => 'Error verifying session id\n'+err);
}

/*
 * Verify that the session id is unique
 * @param sessionid -> the sessionid to be checked
 * @return -> true if the session id is unique
 */
const redisGetSessionInfo = async (sessionId) => {

    return await redisClient.HGETALL('session:'+sessionId)
        .then((resp) => resp)
        .catch((err) => 'Error verifying session id\n'+err);
}

// join session

// leave session

// end session


module.exports = { 
    redisCreateSession, 
    redisVerifyProspectHost, 
    redisVerifySessionIdExists,
    redisGetSessionInfo,
    redisJoinSession
}