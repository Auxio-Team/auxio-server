const { redisClient } = require('./initRedis');

const {
    INVALID_NAME,
    MAX_CAPACITY,
} = require('../models/sessionModels')

/*
 * Create a session.
 * @param sessionId -> the 6-digit alphanumeric session id associated with the session.
 * @return -> true if the session is created successfully
 */
const redisCreateSession = async (sessionId, host, capacity) => {
    const respStatus = await redisClient.SADD('sessions', sessionId)
        .then((resp) => resp == 1)
        .catch((err) => console.log('Error when trying to add session id to sessions\n'+ err));

    if (!respStatus) {
        return respStatus;
    }

    await redisClient.SADD('hosts', host)
        .catch((err) => console.log('unable to add host\n'+err))

    await redisClient.sendCommand(['HSET', `sessions:${sessionId}`, 'host', host, 'curr', '', 'next', ''])
        .catch((err) => console.log('unable to set session info\n'+err))
	
    await redisClient.HSET(`sessions:${sessionId}`, 'capacity', capacity)
    
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
    let capacity = await redisClient.HGET(`sessions:${sessionId}`, 'capacity');
    let val = await redisClient.SCARD(`sessions:${sessionId}:participants`);

    if (val < capacity) {
        return await redisClient.SADD(`sessions:${sessionId}:participants`, participant)
            .then(res => {
                if (res != 1) {
                    console.log('invalid name\n');
                    return INVALID_NAME;
                }
            })
    } else {
        console.log('hit max capacity\n');
        return MAX_CAPACITY;
    }
}

/*
 * Verify that the user trying to start a session is a valid host.
 * @param username -> the username of the user
 * @return -> true if the user is a valid host
 */
const redisVerifyProspectHost = async (accountId) => {

    return await redisClient.SISMEMBER('hosts', accountId)
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
 * Verify that the user is the host of the given session
 * @param sessionid -> the sessionid to be checked
 * @param username -> the username to be checked as the host
 * @return -> true if the user is the host of the session
 */
const redisVerifyHostExists = async (sessionId, username) => {

    return await redisClient.HGET(
        `sessions:${sessionId}`, 
        'host'
    )
        .then((resp) => resp == username)
        .catch((err) => 'Error verifying host\n'+err);
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

/*
 * End the given session
 * @param sessionid -> the sessionid to be ended
 * @return -> the resp
 */
const redisEndSession = async (sessionId, host) => {
    // publish end session
    await redisClient.sendCommand([
        'PUBLISH',
        `sessions:${sessionId}`,
        'sessionEnded'
    ])
    console.log("published sessionEnded")

    // cleanup Redis
    // remove all songs from queue
    await redisClient.sendCommand([
        'ZREMRANGEBYRANK',
        `sessions:${sessionId}:queue`,
        '0',
        '-1'
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when removing songs from queue\n${err}`))

    // remove all participants
    const participantCount = await redisClient.sendCommand([
        'SCARD',
        `sessions:${sessionId}:participants`
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when trying to count participants\n${err}`))
    console.log("count:")
    console.log(participantCount)

    await redisClient.SPOP(
        `sessions:${sessionId}:participants`, 
        participantCount
        ).then((resp) => resp)
    .catch((err) => console.log(`Error when trying to remove participants\n${err}`))

    // remove all session info
    await redisClient.sendCommand([
        'HDEL',
        `sessions:${sessionId}`,
        'host',
        'curr',
        'next'
    ]).then((resp) => resp)
    .catch((err) => console.log(`Error when trying to delete session info\n${err}`))

    // remove host from list of hosts
    await redisClient.SREM('hosts', host)
        .then((resp) => resp)
        .catch((err) => 'Error removing host from list of hosts\n'+err);

    // remove session id from list of sessions
    await redisClient.SREM('sessions', sessionId)
        .then((resp) => resp)
        .catch((err) => 'Error removing session id from list of sessions\n'+err);

    return true
}


module.exports = { 
    redisCreateSession, 
    redisVerifyProspectHost, 
    redisVerifySessionIdExists,
    redisGetSessionInfo,
    redisJoinSession,
    redisVerifyParticipantExists,
    redisLeaveSession,
    redisVerifyHostExists,
    redisEndSession
}