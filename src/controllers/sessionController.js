const {
	generateSessionId
} = require('../services/sessionService')

const {
    INVALID_ID,
    INVALID_NAME,
    FAILURE,
    sessionSuccess,
    sessionError
} = require('../models/sessionModels')

/*
 * Create a new account and save it in the database.
 */
const createSessionController = 
        async ( redisCreateSessionCb, redisVerifyProspectHostCb, redisVerifySessionIdExistsCb, username, body ) => {
	// verify user as valid host
    if (!await redisVerifyProspectHostCb(username)) {
        console.log('Error creating session: User cannot be a host');
        return null;
    }

    var sessionId = '';
    if (body.id) {
        // user entered custom session id
        if (body.id.length !== 6 || await redisVerifySessionIdExistsCb(body.id)) {
            console.log('Error creating session: Bad custom session code')
            return null;
        }
        sessionId = body.id;
    }
    else {
	    // generate session id
        sessionId = await generateSessionId(redisVerifySessionIdExistsCb);
    }

	// save the new session to server
	if (await redisCreateSessionCb(sessionId, username)) {
		return {id: sessionId};
	}
	else {
        console.log('Error creating session: Redis could not create session');
		return null;
	}
}

/*
 * Get session information.
 */
const getSessionInfoController = async ( redisGetSessionInfoCb, dbGetPreferredPlatform, sessionId ) => {
    const sessionInfo = await redisGetSessionInfoCb(sessionId);
    console.log("Session Info:", sessionInfo)
    if (sessionInfo.host == null) {
        return null
    }
    // get preferred streaming platform of host
    console.log("Host:", sessionInfo.host)
    const response = await dbGetPreferredPlatform(sessionInfo.host)
    if (response == null || response.preferred_streaming_platform == null) {
        return null
    }

    return { host: sessionInfo.host, platform: response.preferred_streaming_platform }
}

/*
 * Join a session.
 */
const joinSessionController = async ( redisVerifySessionIdExistsCb, redisJoinSessionCb, sessionId, username ) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error joining session: Session ID not valid')
        return sessionError(INVALID_ID);
    }
    return await redisJoinSessionCb(sessionId, username)
        .then((res) => {
            if (res) {
                return sessionSuccess();
            }
            return sessionError(INVALID_NAME);
        });
    
}

/*
 * Leave a session.
 */
const leaveSessionController = async ( redisVerifySessionIdExistsCb, redisVerifyParticipantExistsCb, redisLeaveSessionCb, sessionId, username ) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error leaving session: Session ID not valid')
        return sessionError(INVALID_ID);
    } else if (!await redisVerifyParticipantExistsCb(sessionId, username)) {
        console.log(`Error leaving session: User not in session ${sessionId}`)
        return sessionError(INVALID_NAME)
    }
    return await redisLeaveSessionCb(sessionId, username)
        .then((res) => {
            if (res) {
                return sessionSuccess();
            }
            return sessionError(FAILURE);
        });
}

/*
 * Leave a session.
 */
const endSessionController = async ( redisVerifySessionIdExistsCb, redisVerifyHostExistsCb, redisEndSessionCb, sessionId, username ) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error ending session: Session ID not valid')
        return sessionError(INVALID_ID);
    } else if (!await redisVerifyHostExistsCb(sessionId, username)) {
        console.log('Error ending session: Invalid host')
        return sessionError(INVALID_NAME)
    }
    return await redisEndSessionCb(sessionId, username)
        .then((res) => {
            if (res) {
                return sessionSuccess();
            }
            return sessionError(FAILURE);
        });
    
}

module.exports = { 
    createSessionController,
    getSessionInfoController,
    joinSessionController,
    leaveSessionController,
    endSessionController
}