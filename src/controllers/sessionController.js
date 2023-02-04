const { 
    updateStatusAndSessionCodeController 
} = require('../controllers/accountController');

const {
	generateSessionId
} = require('../services/sessionService')

const {
    INVALID_ID,
    INVALID_NAME,
    INVALID_HOST,
    INVALID_CAPACITY,
    MAX_CAPACITY,
    SESSION_HISTORY,
    FAILURE,
    CODE_LENGTH,
    sessionSuccess,
    sessionError,
} = require('../models/sessionModels');

const { 
    dbAddSessionParticipant 
} = require('../database/historyDatabase');
const { dbGetAccount } = require('../database/accountDatabase');

/*
 * Verify that the session exists and
 * verify that the user is in the given session.
 * return -> success if session exists, failure otherwise.
 */
const validateSessionRequestController = async (redisVerifySessionIdExistsCb, redisVerifyParticipantExistsCb, sessionId, accountId) => {
    // verify session id exists
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error: Session ID does not exist')
        return sessionError(INVALID_ID);
    }
    // verify user is in session
    if (!await redisVerifyParticipantExistsCb(sessionId, accountId)) {
        console.log(`Error: User not in session ${sessionId}`)
        return sessionError(INVALID_NAME)
    }
    
    return sessionSuccess()
}

/*
 * Create a new session and save it in Redis.
 */
const createSessionController = async ( redisCreateSessionCb, redisVerifyProspectHostCb, redisVerifySessionIdExistsCb, dbUpdateStatusAndSessionCode, accountId, id, capacity ) => {
	// verify user as valid host
    if (!await redisVerifyProspectHostCb(accountId)) {
        console.log('Error creating session: User is already a host');
        return sessionError(INVALID_HOST);
    }
    if ((await dbGetAccount(accountId))['current_status'] == 'In Session') {
        console.log('Error creating session: User is already in a session')
        return sessionError(INVALID_HOST);
    }
    
    // verify capacity is an int >= 1
    if (!Number.isInteger(capacity) || capacity < 1) {
        console.log('Error creating session: capacity is invalid')
        return sessionError(INVALID_CAPACITY);
    }

    var sessionId = '';
    if (id) {
        // user entered custom session id
        if (id.length !== CODE_LENGTH || await redisVerifySessionIdExistsCb(id)) {
            console.log('Error creating session: Bad custom session code')
            return sessionError(INVALID_ID);
        }
        sessionId = id;
    }
    else {
	    // generate session id
        sessionId = await generateSessionId(redisVerifySessionIdExistsCb);
    }

	// save the new session to server
	if (await redisCreateSessionCb(sessionId, accountId, capacity)) {
        // update status and session code in database, if updates fail return null
        if (!await updateStatusAndSessionCodeController(dbUpdateStatusAndSessionCode, accountId, "Hosting Session", sessionId)) {
            console.log('Error updating account status and session code');
            return null
        }
		return { id: sessionId };
	}
	else {
        console.log('Error creating session: Redis could not create session');
		return sessionError(FAILURE);
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
const joinSessionController = async (redisVerifySessionIdExistsCb, redisJoinSessionCb, dbUpdateStatusAndSessionCode, sessionId, accountId) => {
    if (!await redisVerifySessionIdExistsCb(sessionId)) {
        console.log('Error joining session: Session ID not valid')
        return sessionError(INVALID_ID);
    }

    const response =  await redisJoinSessionCb(sessionId, accountId)
        .then((res) => {
            if (res == MAX_CAPACITY) {
                return sessionError(res);
            } else if (res == INVALID_NAME) {
                return sessionError(INVALID_NAME);
            } else {
                return sessionSuccess();
            }
        });

    // update status and session code in database on success, if updates fail return null
    if (dbUpdateStatusAndSessionCode && response.status == sessionSuccess().status && !await updateStatusAndSessionCodeController(dbUpdateStatusAndSessionCode, accountId, "In Session", sessionId)) {
        console.log('Error updating account status and session code');
        return null
    }

    return response
}

/*
 * Leave a session.
 */
const leaveSessionController = async (redisLeaveSessionCb, dbUpdateStatusAndSessionCode, sessionId, accountId) => {
    const response = await redisLeaveSessionCb(sessionId, accountId)
        .then((res) => {
            if (res) {
                console.log("in res true")
                return sessionSuccess()
            }
            console.log("in res false")
            return sessionError(FAILURE)
        });
    
    // update status and session code in database on success, if updates fail return null
    if (response.status == sessionSuccess().status && 
            !await updateStatusAndSessionCodeController(dbUpdateStatusAndSessionCode, accountId, "Online", null)) {
        console.log('Error updating account status and session code');
        return sessionError(FAILURE)
    }

    return response
}

/*
 * End a session.
 */
const endSessionController = async (redisVerifyHostExistsCb, redisEndSessionCb, dbCreateSessionCb, dbAddSessionParticipantCb, dbUpdateStatusAndSessionCode, sessionId, accountId, session, users) => {
    if (!await redisVerifyHostExistsCb(sessionId, accountId)) {
        console.log('Error ending session: Invalid host')
        return sessionError(INVALID_HOST)
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

    const response = await redisEndSessionCb(sessionId, accountId)
        .then((res) => {
            if (res) {
                return sessionSuccess();
            }
            return sessionError(FAILURE);
        });
    
    // update status and session code in database on success, if updates fail return null
    if (response.status == sessionSuccess().status && !await updateStatusAndSessionCodeController(dbUpdateStatusAndSessionCode, accountId, "Online", null)) {
        console.log('Error updating account status and session code');
        return null
    }

    return response
}

module.exports = { 
    createSessionController,
    getSessionInfoController,
    joinSessionController,
    leaveSessionController,
    endSessionController,
    validateSessionRequestController
}