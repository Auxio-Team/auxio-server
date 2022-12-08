const {
	generateSessionId
} = require('../services/sessionService')

const {
    INVALID_ID,
    INVALID_NAME,
    MAX_CAPACITY,
    SESSION_HISTORY,
    SESSION_PARTICIPANT,
    FAILURE,
    CODE_LENGTH,
    sessionSuccess,
    sessionError,
} = require('../models/sessionModels');
const { dbAddSessionParticipant } = require('../database/historyDatabase');

/*
 * Create a new session and save it in Redis.
 */
const createSessionController = 
        async ( redisCreateSessionCb, redisVerifyProspectHostCb, redisVerifySessionIdExistsCb, accountId, id, capacity ) => {
	// verify user as valid host
    if (!await redisVerifyProspectHostCb(accountId)) {
        console.log('Error creating session: User cannot be a host');
        return null;
    }

    var sessionId = '';
    if (id) {
        // user entered custom session id
        if (id.length !== CODE_LENGTH || await redisVerifySessionIdExistsCb(id)) {
            console.log('Error creating session: Bad custom session code')
            return null;
        }
        sessionId = id;
    }
    else {
	    // generate session id
        sessionId = await generateSessionId(redisVerifySessionIdExistsCb);
    }

	// save the new session to server
	if (await redisCreateSessionCb(sessionId, accountId, capacity)) {
		return { id: sessionId };
	}
	else {
        console.log('Error creating session: Redis could not create session');
		return null;
	}
}

/*
 * Get session information.
 */
const getSessionInfoController = async (redisGetSessionInfoCb, dbGetAccount, sessionId) => {
    var sessionInfo = await redisGetSessionInfoCb(sessionId);
    if (sessionInfo.host == null) {
        return null
    }

    // get preferred streaming platform of host
    console.log("Host:", sessionInfo.host)
    const response = await dbGetAccount(sessionInfo.host)
    if (response == null || response.username == null ||
        response.preferred_streaming_platform == null) {
        return null
    }

    // add host name and preferred platform to response
    sessionInfo["hostname"] = response.username
    sessionInfo["platform"] = response.preferred_streaming_platform
    console.log("Session Info:", sessionInfo)

    return sessionInfo
}

/*
 * Join a session.
 */
const joinSessionController = async (redisVerifySessionIdExistsCb, redisJoinSessionCb, sessionId, accountId) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error joining session: Session ID not valid')
        return sessionError(INVALID_ID);
    }

    return await redisJoinSessionCb(sessionId, accountId)
        .then((res) => {
            if (res == MAX_CAPACITY) {
                return sessionError(res);
            } else if (res == INVALID_NAME) {
                return sessionError(INVALID_NAME);
            } else {
                return sessionSuccess();
            }
        });
}

/*
 * Leave a session.
 */
const leaveSessionController = async (redisVerifySessionIdExistsCb, redisVerifyParticipantExistsCb, redisLeaveSessionCb, sessionId, accountId) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error leaving session: Session ID not valid')
        return sessionError(INVALID_ID);
    } else if (!await redisVerifyParticipantExistsCb(sessionId, accountId)) {
        console.log(`Error leaving session: User not in session ${sessionId}`)
        return sessionError(INVALID_NAME)
    }
    return await redisLeaveSessionCb(sessionId, accountId)
        .then((res) => {
            if (res) {
                return sessionSuccess();
            }
            return sessionError(FAILURE);
        });
}

/*
 * End a session.
 */
const endSessionController =
    async (redisVerifySessionIdExistsCb, redisVerifyHostExistsCb, redisEndSessionCb, dbCreateSessionCb, dbAddSessionParticipantCb, sessionId, accountId, session, users) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error ending session: Session ID not valid')
        return sessionError(INVALID_ID);
    } else if (!await redisVerifyHostExistsCb(sessionId, accountId)) {
        console.log('Error ending session: Invalid host')
        return sessionError(INVALID_NAME)
    }

    const res = await dbCreateSessionCb(session, accountId);
    if (!res) {
        return sessionError(SESSION_HISTORY);
    }
    
    let failedUsers = [];
    for (const user of users) {
        let val = await dbAddSessionParticipantCb(user, res);
        if (!val) {
            failedUsers.push(user);
        }
    }

    if (failedUsers.length != 0) {
        return sessionError(failedUsers);
    }

    return await redisEndSessionCb(sessionId, accountId)
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